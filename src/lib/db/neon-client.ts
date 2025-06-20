import { neon } from '@neondatabase/serverless';

// Create a direct Neon connection as a fallback
export const createNeonClient = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in environment variables');
  }
  
  return neon(process.env.DATABASE_URL);
};

// Export a singleton instance
let neonClient: ReturnType<typeof neon> | null = null;

export const getNeonClient = () => {
  if (!neonClient) {
    neonClient = createNeonClient();
  }
  return neonClient;
};