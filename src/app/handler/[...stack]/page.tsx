
import { StackHandler } from '@stackframe/stack';
import { stackServerApp } from '@/lib/auth/stack-server';

interface HandlerProps {
  params: Record<string, string | string[]>;
  searchParams: Record<string, string | string[]>;
}

export default function StackAuthHandlerPage(props: HandlerProps) {
  return <StackHandler app={stackServerApp} fullPage routeProps={props} />;
}
