import { env } from '../src/config/env.ts';

console.log(' SUCCESS: All environment variables validated perfectly!');
console.log(` Environment: ${env.NODE_ENV}`);
console.log(` Server Port: ${env.PORT}`);
console.log(` Database Host: ${env.db.host}`);
console.log(` Database Name: ${env.db.name}`);
console.log(` URL: ${env.db.url}`);

// This is the command for testing the .env
// NODE_ENV=production npx ts-node tests/test-env.ts
// NODE_ENV=development npx ts-node tests/test-env.ts
// NODE_ENV=test npx ts-node tests/test-env.ts