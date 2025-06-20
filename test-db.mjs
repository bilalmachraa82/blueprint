import { testDatabaseConnection } from './src/lib/db/test-connection.ts';

console.log('Testing database connection...');
testDatabaseConnection()
  .then(result => {
    console.log('Test result:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test error:', error);
    process.exit(1);
  });