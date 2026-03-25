import honoApp from '@/backend/hono';

const handle = async (request: Request) => {
  console.log(`⚡️ [Proxy API Route] ${request.method} ${request.url}`);
  return honoApp.fetch(request);
};

export async function GET(request: Request) { return handle(request); }
export async function POST(request: Request) { return handle(request); }
export async function PUT(request: Request) { return handle(request); }
export async function DELETE(request: Request) { return handle(request); }
export async function PATCH(request: Request) { return handle(request); }
export async function OPTIONS(request: Request) { return handle(request); }
