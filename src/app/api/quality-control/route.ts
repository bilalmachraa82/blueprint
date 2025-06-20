import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/db/prisma";
import { stackServerApp } from '@/lib/auth/stack-server';

// GET - Listar quality checks
export async function GET(request: NextRequest) {
  const user = await stackServerApp.getUser({ tokenStore: request, or: 'anonymous-if-exists' });
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const checkType = searchParams.get("checkType");
    const operationId = searchParams.get("operationId");

    const where = {
      ...(status && { status }),
      ...(checkType && { checkType }),
      ...(operationId && { operationId }),
    };

    const qualityChecks = await prisma.qualityCheck.findMany({
      where,
      include: {
        operation: {
          include: {
            task: true,
            workOrder: true,
          },
        },
        images: true,
        _count: {
          select: {
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(qualityChecks);
  } catch (error) {
    console.error("Error fetching quality checks:", error);
    return NextResponse.json(
      { error: "Failed to fetch quality checks" },
      { status: 500 }
    );
  }
}

// POST - Criar novo quality check
export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ tokenStore: request });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      operationId,
      checkType,
      status,
      notes,
      measurements,
      qrCode,
    } = body;

    const qualityCheck = await prisma.qualityCheck.create({
      data: {
        operationId,
        checkType,
        status: status || "Pending",
        checkedBy: user.id,
        checkedAt: new Date(),
        notes,
        measurements: measurements || {},
        qrCode,
      },
      include: {
        operation: true,
        images: true,
      },
    });

    // Atualizar status da operação se o check falhou
    if (status === "Failed") {
      await prisma.operation.update({
        where: { id: operationId },
        data: {
          status: "failed",
        },
      });
    }

    return NextResponse.json(qualityCheck, { status: 201 });
  } catch (error) {
    console.error("Error creating quality check:", error);
    return NextResponse.json(
      { error: "Failed to create quality check" },
      { status: 500 }
    );
  }
}