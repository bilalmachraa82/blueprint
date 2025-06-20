// src/lib/auth/stack.ts
import { stackServerApp } from "./stack-server";

// Re-export server app for convenience if used in client components (though rare)
// or by other parts of the Stack Auth setup if needed.
export { stackServerApp };

// Client-side app instance (stackApp) and page app instance (stackPageApp)
// are not being created here as StackApp and StackPageApp classes are not exported
// by @stackframe/stack@2.8.12. Client-side interaction will likely rely on hooks
// like useUser() and useStackApp() provided by StackProvider.
