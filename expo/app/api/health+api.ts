export async function GET(request: Request) {
  return Response.json({
    status: "ok",
    message: "Health check passed",
    timestamp: new Date().toISOString(),
    url: request.url
  });
}
