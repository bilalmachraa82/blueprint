import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neon } from '@neondatabase/serverless';

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in environment variables');
  console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('DATABASE')));
}

// Function to create Prisma client
const prismaClientSingleton = () => {
  // Use Neon serverless adapter if DATABASE_URL is available
  if (process.env.DATABASE_URL) {
    try {
      const neonConnection = neon(process.env.DATABASE_URL);
      const adapter = new PrismaNeon(neonConnection);
      
      console.log('Creating Prisma client with Neon adapter...');
      
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
  console.log('Creating regular Prisma client...');
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