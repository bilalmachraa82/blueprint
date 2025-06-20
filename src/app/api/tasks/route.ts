import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/auth/stack-server';
import { getNeonClient } from '@/lib/db/neon-client';

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

// GET - List tasks
export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ tokenStore: request, or: 'anonymous-if-exists' });
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = getNeonClient();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const workOrderId = searchParams.get('workOrderId');

    let query = `
      SELECT t.*, p.name as "projectName", wo.code as "workOrderCode"
      FROM "Task" t
      LEFT JOIN "Project" p ON t."projectId" = p.id
      LEFT JOIN "WorkOrder" wo ON t."workOrderId" = wo.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (projectId) {
      params.push(projectId);
      query += ` AND t."projectId" = $${params.length}`;
    }
    
    if (workOrderId) {
      params.push(workOrderId);
      query += ` AND t."workOrderId" = $${params.length}`;
    }
    
    query += ` ORDER BY t."createdAt" DESC`;

    const tasks = params.length > 0 
      ? await sql(query, params)
      : await sql(query);
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST - Create a new task
export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ tokenStore: request, or: 'anonymous-if-exists' });
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = getNeonClient();
    const body = await request.json();
    const { 
      title, 
      description, 
      projectId, 
      workOrderId, 
      priority = 'medium',
      status = 'pending',
      dueDate 
    } = body;

    if (!title || !projectId) {
      return NextResponse.json(
        { error: 'Title and project ID are required' },
        { status: 400 }
      );
    }

    const newTask = await sql`
      INSERT INTO "Task" (
        id, title, description, "projectId", "workOrderId",
        priority, status, "dueDate", "assignedTo", "createdBy", 
        "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(),
        ${title},
        ${description || null},
        ${projectId},
        ${workOrderId || null},
        ${priority},
        ${status},
        ${dueDate ? new Date(dueDate) : null},
        ${user.id},
        ${user.id},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    return NextResponse.json(newTask[0], { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
