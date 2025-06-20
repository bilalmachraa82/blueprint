import { NextRequest, NextResponse } from "next/server";
import { getNeonClient } from '@/lib/db/neon-client';
import { stackServerApp } from "@/lib/auth/stack-server";

async function ensureUserOrganization(userId: string) {
  const sql = getNeonClient();
  
  const userOrgs = await sql`
    SELECT "organizationId" FROM "UserOrganization" 
    WHERE "userId" = ${userId}
    LIMIT 1
  `;
  
  if (userOrgs.length > 0) {
    return userOrgs[0].organizationId;
  }
  
  const orgName = `User ${userId.substring(0, 8)}`;
  const orgSlug = `user-${userId.substring(0, 8)}-org`;
  const newOrg = await sql`
    INSERT INTO "Organization" (id, name, slug, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), ${orgName}, ${orgSlug}, NOW(), NOW())
    RETURNING id
  `;
  
  await sql`
    INSERT INTO "UserOrganization" ("userId", "organizationId", role, "joinedAt")
    VALUES (${userId}, ${newOrg[0].id}, 'admin', NOW())
  `;
  
  return newOrg[0].id;
}

// GET - Listar work orders
export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ tokenStore: request, or: 'anonymous-if-exists' });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = getNeonClient();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const projectId = searchParams.get("projectId");
    
    const organizationId = await ensureUserOrganization(user.id);

    let query = `
      SELECT wo.*, p.name as "projectName",
        (SELECT COUNT(*) FROM "Task" t WHERE t."workOrderId" = wo.id)::int as "taskCount",
        (SELECT COUNT(*) FROM "Operation" o WHERE o."workOrderId" = wo.id)::int as "operationCount"
      FROM "WorkOrder" wo
      LEFT JOIN "Project" p ON wo."projectId" = p.id
      WHERE p."organizationId" = $1
    `;
    
    const params: any[] = [organizationId];
    
    if (status) {
      params.push(status);
      query += ` AND wo.status = $${params.length}`;
    }
    
    if (projectId) {
      params.push(projectId);
      query += ` AND wo."projectId" = $${params.length}`;
    }
    
    query += ` ORDER BY wo."createdAt" DESC`;

    const workOrders = await sql(query, params);
    
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
    const user = await stackServerApp.getUser({ tokenStore: request, or: 'anonymous-if-exists' });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = getNeonClient();
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

    if (!title || !projectId || !type) {
      return NextResponse.json(
        { error: "Title, project ID, and type are required" },
        { status: 400 }
      );
    }

    // Generate unique code
    const year = new Date().getFullYear();
    const countResult = await sql`
      SELECT COUNT(*)::int as count FROM "WorkOrder"
      WHERE EXTRACT(YEAR FROM "createdAt") = ${year}
    `;
    const count = countResult[0].count || 0;
    const code = `WO-${year}-${String(count + 1).padStart(3, "0")}`;

    const newWorkOrder = await sql`
      INSERT INTO "WorkOrder" (
        id, code, title, description, type,
        status, priority, "projectId", "parentId",
        "dueDate", "createdBy", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(),
        ${code},
        ${title},
        ${description || null},
        ${type},
        'pending',
        ${priority || 'medium'},
        ${projectId},
        ${parentId || null},
        ${dueDate ? new Date(dueDate) : null},
        ${user.id},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    return NextResponse.json(newWorkOrder[0], { status: 201 });
  } catch (error) {
    console.error("Error creating work order:", error);
    return NextResponse.json(
      { error: "Failed to create work order" },
      { status: 500 }
    );
  }
}