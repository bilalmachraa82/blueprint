import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neon } from '@neondatabase/serverless';

// Function to create Prisma client
const prismaClientSingleton = () => {
  // Use Neon serverless adapter if DATABASE_URL is available
  if (process.env.DATABASE_URL) {
    try {
      const neonConnection = neon(process.env.DATABASE_URL);
      const adapter = new PrismaNeon(neonConnection);
      
      return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    } catch (error) {
      console.error('Failed to create Neon adapter:', error);
      // Fallback to regular client
    }
  }
  
  // Fallback to regular client
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
export { prisma };