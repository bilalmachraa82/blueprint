import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/auth/stack-server';
import { prisma } from '@/lib/db/prisma';
import { ensureUserOrganization } from '@/lib/auth/organization';

// GET - Get a single task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await stackServerApp.getUser({ tokenStore: request });
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const organizationId = await ensureUserOrganization(user.id);

    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        project: {
          organizationId: organizationId,
        },
      },
      include: {
        project: true,
        workOrder: true,
      },
    });

    if (!task) {
      return new NextResponse('Task not found', { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PUT - Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await stackServerApp.getUser({ tokenStore: request });
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const organizationId = await ensureUserOrganization(user.id);
    const body = await request.json();
    const { title, description, projectId, workOrderId, priority, status, dueDate } = body;

    // Verify the task belongs to the user's organization
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        project: {
          organizationId: organizationId,
        },
      },
    });

    if (!existingTask) {
      return new NextResponse('Task not found or access denied', { status: 404 });
    }

    // If projectId is being changed, verify the new project belongs to the organization
    if (projectId && projectId !== existingTask.projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, organizationId },
      });

      if (!project) {
        return new NextResponse('Project not found or access denied', { status: 404 });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        title,
        description,
        projectId,
        workOrderId: workOrderId || null,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        updatedAt: new Date(),
      },
      include: {
        project: true,
        workOrder: true,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await stackServerApp.getUser({ tokenStore: request });
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const organizationId = await ensureUserOrganization(user.id);

    // Verify the task belongs to the user's organization
    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        project: {
          organizationId: organizationId,
        },
      },
    });

    if (!task) {
      return new NextResponse('Task not found or access denied', { status: 404 });
    }

    await prisma.task.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}