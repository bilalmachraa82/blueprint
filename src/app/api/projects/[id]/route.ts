import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/auth/stack-server';
import { prisma } from '@/lib/db/prisma';
import { ensureUserOrganization } from '@/lib/auth/organization';

// GET - Get a single project
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

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        organizationId: organizationId,
      },
      include: {
        workOrders: {
          include: {
            tasks: true,
          },
        },
      },
    });

    if (!project) {
      return new NextResponse('Project not found', { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PUT - Update a project
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
    const { name, description, status, startDate, endDate } = body;

    // Verify the project belongs to the user's organization
    const existingProject = await prisma.project.findFirst({
      where: {
        id: params.id,
        organizationId: organizationId,
      },
    });

    if (!existingProject) {
      return new NextResponse('Project not found or access denied', { status: 404 });
    }

    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: {
        name,
        description,
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE - Delete a project
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

    // Verify the project belongs to the user's organization
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        organizationId: organizationId,
      },
    });

    if (!project) {
      return new NextResponse('Project not found or access denied', { status: 404 });
    }

    // Delete project (this will cascade delete work orders and tasks due to database relationships)
    await prisma.project.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting project:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}