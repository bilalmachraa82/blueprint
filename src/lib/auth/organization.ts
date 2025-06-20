import { prisma } from '@/lib/db/prisma';

export async function ensureUserOrganization(userId: string): Promise<string> {
  // Check if user already has an organization
  const userOrganization = await prisma.userOrganization.findFirst({
    where: { userId },
  });

  if (userOrganization) {
    return userOrganization.organizationId;
  }

  // Create a default organization for the user
  const organization = await prisma.organization.create({
    data: {
      name: `Organization for User ${userId}`,
      slug: `org-${userId.slice(0, 8)}`,
      description: `Default organization for user ${userId}`,
    },
  });

  // Associate user with the organization
  await prisma.userOrganization.create({
    data: {
      userId,
      organizationId: organization.id,
      role: 'admin',
    },
  });

  return organization.id;
}

export async function getOrganizationId(userId: string): Promise<string | null> {
  const userOrganization = await prisma.userOrganization.findFirst({
    where: { userId },
  });
  return userOrganization?.organizationId || null;
}