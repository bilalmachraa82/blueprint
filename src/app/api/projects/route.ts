import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/auth/stack-server';
import { getNeonClient } from '@/lib/db/neon-client';

async function ensureUserOrganization(userId: string) {
  const sql = getNeonClient();
  
  // Check if user has an organization
  const userOrgs = await sql`
    SELECT "organizationId" FROM "UserOrganization" 
    WHERE "userId" = ${userId}
    LIMIT 1
  `;
  
  if (userOrgs.length > 0) {
    return userOrgs[0].organizationId;
  }
  
  // Create a default organization for the user
  const orgName = `User ${userId.substring(0, 8)}`;
  const orgSlug = `user-${userId.substring(0, 8)}-org`;
  const newOrg = await sql`
    INSERT INTO "Organization" (id, name, slug, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), ${orgName}, ${orgSlug}, NOW(), NOW())
    RETURNING id
  `;
  
  // Link user to organization
  await sql`
    INSERT INTO "UserOrganization" ("userId", "organizationId", role, "joinedAt")
    VALUES (${userId}, ${newOrg[0].id}, 'admin', NOW())
  `;
  
  return newOrg[0].id;
}

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ tokenStore: request, or: 'anonymous-if-exists' });
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = await ensureUserOrganization(user.id);
    const sql = getNeonClient();

    const projects = await sql`
      SELECT * FROM "Project" 
      WHERE "organizationId" = ${organizationId}
      ORDER BY "createdAt" DESC
    `;
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ tokenStore: request, or: 'anonymous-if-exists' });
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = await ensureUserOrganization(user.id);
    const sql = getNeonClient();

    const body = await request.json();
    const { name, description, startDate, endDate } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    const newProject = await sql`
      INSERT INTO "Project" (
        id, name, description, "startDate", "endDate", 
        "organizationId", "createdBy", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(), 
        ${name}, 
        ${description || null}, 
        ${startDate ? new Date(startDate) : null}, 
        ${endDate ? new Date(endDate) : null},
        ${organizationId}, 
        ${user.id},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    return NextResponse.json(newProject[0], { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}