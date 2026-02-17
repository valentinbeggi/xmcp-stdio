import { createServer } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const server = new McpServer({
  name: "query-param-test",
  version: "1.0.0",
});

const PORT = 3000;

server.registerTool(
  "echo-vendor",
  {
    description: "Returns the vendor from query params",
  },
  (extra) => {
    const url = extra.requestInfo?.url;
    const vendor = url ? new URL(url.toString()).searchParams.get("vendor") : null;
    return {
      content: [{ type: "text", text: JSON.stringify({ vendor, url: url?.toString() ?? null }) }],
    };
  },
);

const httpServer = createServer(async (request, response) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  await server.connect(transport);
  await transport.handleRequest(request, response);
});

httpServer.listen(PORT, () => {
  console.log(`MCP server listening on port ${PORT}`);
});
