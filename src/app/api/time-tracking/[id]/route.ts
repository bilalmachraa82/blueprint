import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// PUT - Parar timer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const timeLog = await prisma.timeLog.findUnique({
      where: { id },
    });

    if (!timeLog) {
      return NextResponse.json(
        { error: "Time log not found" },
        { status: 404 }
      );
    }

    if (timeLog.endTime) {
      return NextResponse.json(
        { error: "Timer already stopped" },
        { status: 400 }
      );
    }

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - timeLog.startTime.getTime()) / 1000 / 60
    ); // Duration in minutes

    const updatedTimeLog = await prisma.timeLog.update({
      where: { id },
      data: {
        endTime,
        duration,
      },
      include: {
        operation: true,
      },
    });

    // Atualizar operação
    const totalDuration = await prisma.timeLog.aggregate({
      where: { operationId: timeLog.operationId },
      _sum: { duration: true },
    });

    await prisma.operation.update({
      where: { id: timeLog.operationId },
      data: {
        duration: totalDuration._sum.duration || 0,
        endTime: endTime,
      },
    });

    return NextResponse.json(updatedTimeLog);
  } catch (error) {
    console.error("Error stopping timer:", error);
    return NextResponse.json(
      { error: "Failed to stop timer" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar time log
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const timeLog = await prisma.timeLog.findUnique({
      where: { id },
    });

    if (!timeLog) {
      return NextResponse.json(
        { error: "Time log not found" },
        { status: 404 }
      );
    }

    await prisma.timeLog.delete({
      where: { id },
    });

    // Recalcular duração total da operação
    const totalDuration = await prisma.timeLog.aggregate({
      where: { operationId: timeLog.operationId },
      _sum: { duration: true },
    });

    await prisma.operation.update({
      where: { id: timeLog.operationId },
      data: {
        duration: totalDuration._sum.duration || 0,
      },
    });

    return NextResponse.json({ message: "Time log deleted successfully" });
  } catch (error) {
    console.error("Error deleting time log:", error);
    return NextResponse.json(
      { error: "Failed to delete time log" },
      { status: 500 }
    );
  }
}