import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET - Buscar work order específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        project: true,
        parent: true,
        children: {
          include: {
            _count: {
              select: {
                tasks: true,
                operations: true,
              },
            },
          },
        },
        tasks: {
          include: {
            _count: {
              select: {
                operations: true,
              },
            },
          },
        },
        operations: {
          include: {
            timeLogs: true,
            qualityCheck: true,
          },
        },
      },
    });

    if (!workOrder) {
      return NextResponse.json(
        { error: "Work order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(workOrder);
  } catch (error) {
    console.error("Error fetching work order:", error);
    return NextResponse.json(
      { error: "Failed to fetch work order" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar work order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { status, priority, title, description, dueDate } = body;

    const workOrder = await prisma.workOrder.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(title && { title }),
        ...(description && { description }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(status === "completed" && { completedAt: new Date() }),
      },
      include: {
        project: true,
        children: true,
      },
    });

    return NextResponse.json(workOrder);
  } catch (error) {
    console.error("Error updating work order:", error);
    return NextResponse.json(
      { error: "Failed to update work order" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar work order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Verificar se tem filhos
    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: { children: true },
    });

    if (!workOrder) {
      return NextResponse.json(
        { error: "Work order not found" },
        { status: 404 }
      );
    }

    if (workOrder.children.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete work order with children" },
        { status: 400 }
      );
    }

    await prisma.workOrder.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Work order deleted successfully" });
  } catch (error) {
    console.error("Error deleting work order:", error);
    return NextResponse.json(
      { error: "Failed to delete work order" },
      { status: 500 }
    );
  }
}