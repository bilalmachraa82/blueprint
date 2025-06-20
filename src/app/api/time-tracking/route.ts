import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET - Listar time logs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const operationId = searchParams.get("operationId");
    const userId = searchParams.get("userId");
    const active = searchParams.get("active");

    const where = {
      ...(operationId && { operationId }),
      ...(userId && { userId }),
      ...(active === "true" && { endTime: null }),
    };

    const timeLogs = await prisma.timeLog.findMany({
      where,
      include: {
        operation: {
          include: {
            task: true,
            workOrder: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return NextResponse.json(timeLogs);
  } catch (error) {
    console.error("Error fetching time logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch time logs" },
      { status: 500 }
    );
  }
}

// POST - Iniciar timer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operationId, userId, notes } = body;

    // Verificar se já existe um timer ativo para esta operação
    const activeTimer = await prisma.timeLog.findFirst({
      where: {
        operationId,
        userId,
        endTime: null,
      },
    });

    if (activeTimer) {
      return NextResponse.json(
        { error: "Timer already active for this operation" },
        { status: 400 }
      );
    }

    const timeLog = await prisma.timeLog.create({
      data: {
        operationId,
        userId: userId || "system", // TODO: Get from auth
        startTime: new Date(),
        notes,
      },
      include: {
        operation: true,
      },
    });

    // Atualizar status da operação
    await prisma.operation.update({
      where: { id: operationId },
      data: {
        status: "inProgress",
        startTime: new Date(),
      },
    });

    return NextResponse.json(timeLog, { status: 201 });
  } catch (error) {
    console.error("Error starting timer:", error);
    return NextResponse.json(
      { error: "Failed to start timer" },
      { status: 500 }
    );
  }
}