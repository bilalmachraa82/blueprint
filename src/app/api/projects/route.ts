import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/auth/stack-server';
import { prisma } from '@/lib/db/prisma';
import { ensureUserOrganization } from '@/lib/auth/organization';

export async function GET(request: NextRequest) {
  const user = await stackServerApp.getUser({ tokenStore: request, or: 'anonymous-if-exists' });
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const organizationId = await ensureUserOrganization(user.id);

    const projects = await prisma.project.findMany({
      where: { organizationId },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await stackServerApp.getUser({ tokenStore: request, or: 'anonymous-if-exists' });
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const organizationId = await ensureUserOrganization(user.id);

    const body = await request.json();
    const { name, description, startDate, endDate } = body;

    if (!name) {
      return new NextResponse('Project name is required', { status: 400 });
    }

    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        organizationId: organizationId,
        createdBy: user.id,
      },
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
