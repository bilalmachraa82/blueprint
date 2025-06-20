import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/auth/stack-server';
import { prisma } from '@/lib/db/prisma';
import { ensureUserOrganization } from '@/lib/auth/organization';

// GET - List tasks
export async function GET(request: NextRequest) {
  const user = await stackServerApp.getUser({ tokenStore: request });
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const organizationId = await ensureUserOrganization(user.id);

    // This will fetch all tasks for the organization.
    // We can add filters (e.g., by projectId) from the request query if needed.
    const tasks = await prisma.task.findMany({
      where: {
        project: {
          organizationId: organizationId,
        },
      },
      include: {
        project: true,
        workOrder: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST - Create a new task
export async function POST(request: NextRequest) {
  const user = await stackServerApp.getUser({ tokenStore: request });
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const organizationId = await ensureUserOrganization(user.id);

    const body = await request.json();
    const { title, description, projectId, workOrderId, priority, dueDate } = body;

    if (!title || !projectId) {
      return new NextResponse('Title and Project ID are required', { status: 400 });
    }

    // Verify the project belongs to the user's organization
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId },
    });

    if (!project) {
      return new NextResponse('Project not found or access denied', { status: 404 });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        workOrderId,
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        createdBy: user.id,
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
