// Updated to use Neon client directly - v2
import { NextRequest, NextResponse } from 'next/server';
import { getNeonClient } from '@/lib/db/neon-client';
import { stackServerApp } from '@/lib/auth/stack-server';

// GET - Listar quality checks
export async function GET(request: NextRequest) {
  const user = await stackServerApp.getUser({ tokenStore: request, or: 'anonymous-if-exists' });
  try {
    const sql = getNeonClient();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const checkType = searchParams.get("checkType");
    const operationId = searchParams.get("operationId");

    // Build WHERE conditions
    const conditions = [];
    const params: any[] = [];
    
    if (status) {
      conditions.push(`qc.status = $${params.length + 1}`);
      params.push(status);
    }
    if (checkType) {
      conditions.push(`qc."checkType" = $${params.length + 1}`);
      params.push(checkType);
    }
    if (operationId) {
      conditions.push(`qc."operationId" = $${params.length + 1}`);
      params.push(operationId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Build the full query
    let qualityChecks;
    
    if (conditions.length === 0) {
      // No filters - simple query
      qualityChecks = await sql`
        SELECT 
          qc.*,
          o.id as operation_id,
          o.type as operation_type,
          o.title as operation_title,
          o.status as operation_status,
          t.id as task_id,
          t.title as task_title,
          w.id as work_order_id,
          w.title as work_order_title,
          COUNT(qi.id) as image_count
        FROM "QualityCheck" qc
        LEFT JOIN "Operation" o ON qc."operationId" = o.id
        LEFT JOIN "Task" t ON o."taskId" = t.id
        LEFT JOIN "WorkOrder" w ON o."workOrderId" = w.id
        LEFT JOIN "QualityImage" qi ON qc.id = qi."qualityCheckId"
        GROUP BY qc.id, o.id, t.id, w.id
        ORDER BY qc."createdAt" DESC
      `;
    } else {
      // For now, handle filters separately
      // First get quality checks with filters
      const baseChecks = await sql`
        SELECT * FROM "QualityCheck"
        WHERE ${status ? sql`status = ${status}` : sql`1=1`}
          AND ${checkType ? sql`"checkType" = ${checkType}` : sql`1=1`}
          AND ${operationId ? sql`"operationId" = ${operationId}` : sql`1=1`}
        ORDER BY "createdAt" DESC
      `;
      
      // Then get related data for each check
      qualityChecks = await Promise.all(baseChecks.map(async (check) => {
        const operation = check.operationId ? await sql`
          SELECT o.*, t.id as task_id, t.title as task_title, 
                 w.id as work_order_id, w.title as work_order_title
          FROM "Operation" o
          LEFT JOIN "Task" t ON o."taskId" = t.id
          LEFT JOIN "WorkOrder" w ON o."workOrderId" = w.id
          WHERE o.id = ${check.operationId}
        ` : [null];
        
        const imageCount = await sql`
          SELECT COUNT(*) as count FROM "QualityImage" 
          WHERE "qualityCheckId" = ${check.id}
        `;
        
        return {
          ...check,
          operation_id: operation[0]?.id || null,
          operation_type: operation[0]?.type || null,
          operation_title: operation[0]?.title || null,
          operation_status: operation[0]?.status || null,
          task_id: operation[0]?.task_id || null,
          task_title: operation[0]?.task_title || null,
          work_order_id: operation[0]?.work_order_id || null,
          work_order_title: operation[0]?.work_order_title || null,
          image_count: imageCount[0].count
        };
      }));
    }

    // Format the response
    const formattedChecks = qualityChecks.map(check => ({
      id: check.id,
      operationId: check.operationId,
      checkType: check.checkType,
      status: check.status,
      checkedBy: check.checkedBy,
      checkedAt: check.checkedAt,
      notes: check.notes,
      measurements: check.measurements,
      qrCode: check.qrCode,
      createdAt: check.createdAt,
      updatedAt: check.updatedAt,
      operation: check.operation_id ? {
        id: check.operation_id,
        type: check.operation_type,
        title: check.operation_title,
        status: check.operation_status,
        task: check.task_id ? {
          id: check.task_id,
          title: check.task_title
        } : null,
        workOrder: check.work_order_id ? {
          id: check.work_order_id,
          title: check.work_order_title
        } : null
      } : null,
      _count: {
        images: parseInt(check.image_count)
      }
    }));

    return NextResponse.json(formattedChecks);
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

    const sql = getNeonClient();
    const body = await request.json();
    const {
      operationId,
      checkType,
      status,
      notes,
      measurements,
      qrCode,
    } = body;

    // Create quality check
    const newQualityCheck = await sql`
      INSERT INTO "QualityCheck" (
        id, "operationId", "checkType", status, "checkedBy", "checkedAt",
        notes, measurements, "qrCode", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(),
        ${operationId},
        ${checkType},
        ${status || "Pending"},
        ${user.id},
        NOW(),
        ${notes || null},
        ${measurements || {}},
        ${qrCode || null},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    const qualityCheck = newQualityCheck[0];

    // Update operation status if check failed
    if (status === "Failed") {
      await sql`
        UPDATE "Operation"
        SET status = 'failed', "updatedAt" = NOW()
        WHERE id = ${operationId}
      `;
    }

    // Get operation details
    const operationResult = await sql`
      SELECT * FROM "Operation" WHERE id = ${operationId}
    `;

    return NextResponse.json({
      ...qualityCheck,
      operation: operationResult[0] || null,
      images: []
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating quality check:", error);
    return NextResponse.json(
      { error: "Failed to create quality check" },
      { status: 500 }
    );
  }
}