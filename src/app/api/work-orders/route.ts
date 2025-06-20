import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { stackServerApp } from "@/lib/auth/stack-server"; // Corrected import path

// Helper to get organization ID from user session
async function getOrganizationId(userId: string): Promise<string | null> {
  const userOrganization = await prisma.userOrganization.findFirst({
    where: { userId },
  });
  return userOrganization?.organizationId || null;
}

// GET - Listar work orders
export async function GET(request: NextRequest) {
  const user = await stackServerApp.getUser({ tokenStore: request });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const projectId = searchParams.get("projectId");
    
        const organizationId = await getOrganizationId(user.id);
    if (!organizationId) {
      return NextResponse.json({ error: "User not in an organization" }, { status: 403 });
    }

    const where = {
      project: { organizationId }, // Ensure we only get work orders from the user's org
      ...(status && { status }),
      ...(projectId && { projectId }),
    };

    const workOrders = await prisma.workOrder.findMany({
      where,
      include: {
        project: true,
        children: true,
        _count: {
          select: {
            tasks: true,
            operations: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(workOrders);
  } catch (error) {
    console.error("Error fetching work orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch work orders" },
      { status: 500 }
    );
  }
}

// POST - Criar nova work order
export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ tokenStore: request });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      projectId,
      title,
      description,
      type,
      priority,
      dueDate,
      parentId,
    } = body;

    // Gerar código único
    const count = await prisma.workOrder.count();
    const code = `WO-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

        const organizationId = await getOrganizationId(user.id);
    if (!organizationId) {
      return NextResponse.json({ error: "User not in an organization" }, { status: 403 });
    }

    // Verify the project belongs to the user's organization
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: organizationId,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
    }

    const workOrder = await prisma.workOrder.create({
      data: {
        code,
        title,
        description,
        type,
        status: "pending",
        priority: priority || "medium",
        projectId,
        parentId,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdBy: user.id,
      },
      include: {
        project: true,
        children: true,
      },
    });

    return NextResponse.json(workOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating work order:", error);
    return NextResponse.json(
      { error: "Failed to create work order" },
      { status: 500 }
    );
  }
}