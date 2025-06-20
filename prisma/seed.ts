import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a demo organization
  const organization = await prisma.organization.create({
    data: {
      name: 'Demo Corp',
      slug: 'demo-corp',
      description: 'A demonstration organization',
    },
  });

  console.log(`Created organization: ${organization.name} (ID: ${organization.id})`);

  // Note: In a real application, user creation would likely be handled by your auth provider (Stack).
  // For seeding purposes, we'll simulate a user ID. You'd replace this with an actual user ID from Stack.
  const demoUserId = 'user_demo_12345'; // This should ideally come from your auth system

  // Associate the user with the organization
  const userOrganization = await prisma.userOrganization.create({
    data: {
      userId: demoUserId,
      organizationId: organization.id,
      role: 'admin',
    },
  });

  console.log(`Associated user ${userOrganization.userId} with organization ${userOrganization.organizationId} as ${userOrganization.role}`);

  // Create a sample project for the demo organization and user
  const project = await prisma.project.create({
    data: {
      name: 'Initial Demo Project',
      description: 'This is a sample project created during seeding.',
      organizationId: organization.id,
      createdBy: demoUserId, // This user created the project
      status: 'active',
      startDate: new Date(),
    },
  });
  console.log(`Created project: ${project.name} (ID: ${project.id}) for organization ${organization.id} by user ${demoUserId}`);

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
