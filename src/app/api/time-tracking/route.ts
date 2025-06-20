// Updated to use Neon client directly
import { NextRequest, NextResponse } from "next/server";
import { getNeonClient } from '@/lib/db/neon-client';

// GET - Listar time logs
export async function GET(request: NextRequest) {
  try {
    const sql = getNeonClient();
    const searchParams = request.nextUrl.searchParams;
    const operationId = searchParams.get("operationId");
    const userId = searchParams.get("userId");
    const active = searchParams.get("active");

    // Build WHERE conditions
    const conditions = [];
    const params: any[] = [];
    
    if (operationId) {
      conditions.push(`tl."operationId" = $${params.length + 1}`);
      params.push(operationId);
    }
    if (userId) {
      conditions.push(`tl."userId" = $${params.length + 1}`);
      params.push(userId);
    }
    if (active === "true") {
      conditions.push(`tl."endTime" IS NULL`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Build the query based on filters
    let timeLogs;
    
    if (conditions.length === 0) {
      // No filters - simple query
      timeLogs = await sql`
        SELECT 
          tl.*,
          o.id as operation_id,
          o.type as operation_type,
          o.title as operation_title,
          o.status as operation_status,
          t.id as task_id,
          t.title as task_title,
          w.id as work_order_id,
          w.title as work_order_title
        FROM "TimeLog" tl
        LEFT JOIN "Operation" o ON tl."operationId" = o.id
        LEFT JOIN "Task" t ON o."taskId" = t.id
        LEFT JOIN "WorkOrder" w ON o."workOrderId" = w.id
        ORDER BY tl."startTime" DESC
      `;
    } else {
      // Handle filters
      const baseQuery = sql`SELECT * FROM "TimeLog" WHERE 1=1`;
      
      let filteredLogs;
      if (operationId && userId && active === "true") {
        filteredLogs = await sql`
          SELECT * FROM "TimeLog"
          WHERE "operationId" = ${operationId}
            AND "userId" = ${userId}
            AND "endTime" IS NULL
          ORDER BY "startTime" DESC
        `;
      } else if (operationId && userId) {
        filteredLogs = await sql`
          SELECT * FROM "TimeLog"
          WHERE "operationId" = ${operationId}
            AND "userId" = ${userId}
          ORDER BY "startTime" DESC
        `;
      } else if (operationId) {
        filteredLogs = await sql`
          SELECT * FROM "TimeLog"
          WHERE "operationId" = ${operationId}
          ORDER BY "startTime" DESC
        `;
      } else if (userId) {
        filteredLogs = await sql`
          SELECT * FROM "TimeLog"
          WHERE "userId" = ${userId}
            ${active === "true" ? sql`AND "endTime" IS NULL` : sql``}
          ORDER BY "startTime" DESC
        `;
      } else if (active === "true") {
        filteredLogs = await sql`
          SELECT * FROM "TimeLog"
          WHERE "endTime" IS NULL
          ORDER BY "startTime" DESC
        `;
      } else {
        filteredLogs = await sql`
          SELECT * FROM "TimeLog"
          ORDER BY "startTime" DESC
        `;
      }
      
      // Get related data for each log
      timeLogs = await Promise.all(filteredLogs.map(async (log) => {
        const operation = log.operationId ? await sql`
          SELECT o.*, t.id as task_id, t.title as task_title, 
                 w.id as work_order_id, w.title as work_order_title
          FROM "Operation" o
          LEFT JOIN "Task" t ON o."taskId" = t.id
          LEFT JOIN "WorkOrder" w ON o."workOrderId" = w.id
          WHERE o.id = ${log.operationId}
        ` : [null];
        
        return {
          ...log,
          operation_id: operation[0]?.id || null,
          operation_type: operation[0]?.type || null,
          operation_title: operation[0]?.title || null,
          operation_status: operation[0]?.status || null,
          task_id: operation[0]?.task_id || null,
          task_title: operation[0]?.task_title || null,
          work_order_id: operation[0]?.work_order_id || null,
          work_order_title: operation[0]?.work_order_title || null
        };
      }));
    }

    // Format the response
    const formattedLogs = timeLogs.map(log => ({
      id: log.id,
      operationId: log.operationId,
      userId: log.userId,
      startTime: log.startTime,
      endTime: log.endTime,
      duration: log.duration,
      notes: log.notes,
      createdAt: log.createdAt,
      operation: log.operation_id ? {
        id: log.operation_id,
        type: log.operation_type,
        title: log.operation_title,
        status: log.operation_status,
        task: log.task_id ? {
          id: log.task_id,
          title: log.task_title
        } : null,
        workOrder: log.work_order_id ? {
          id: log.work_order_id,
          title: log.work_order_title
        } : null
      } : null
    }));

    return NextResponse.json(formattedLogs);
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
    const sql = getNeonClient();
    const body = await request.json();
    const { operationId, userId, notes } = body;

    // Check if timer is already active for this operation
    const activeTimers = await sql`
      SELECT * FROM "TimeLog"
      WHERE "operationId" = ${operationId}
        AND "userId" = ${userId}
        AND "endTime" IS NULL
    `;

    if (activeTimers.length > 0) {
      return NextResponse.json(
        { error: "Timer already active for this operation" },
        { status: 400 }
      );
    }

    // Create new time log
    const newTimeLog = await sql`
      INSERT INTO "TimeLog" (
        id, "operationId", "userId", "startTime", notes, "createdAt"
      )
      VALUES (
        gen_random_uuid(),
        ${operationId},
        ${userId || "system"},
        NOW(),
        ${notes || null},
        NOW()
      )
      RETURNING *
    `;

    const timeLog = newTimeLog[0];

    // Update operation status
    await sql`
      UPDATE "Operation"
      SET status = 'inProgress', "startTime" = NOW(), "updatedAt" = NOW()
      WHERE id = ${operationId}
    `;

    // Get operation details
    const operationResult = await sql`
      SELECT * FROM "Operation" WHERE id = ${operationId}
    `;

    return NextResponse.json({
      ...timeLog,
      operation: operationResult[0] || null
    }, { status: 201 });
  } catch (error) {
    console.error("Error starting timer:", error);
    return NextResponse.json(
      { error: "Failed to start timer" },
      { status: 500 }
    );
  }
}