import { createServer } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const server = new McpServer({
  name: "query-param-test",
  version: "1.0.0",
});

const PORT = 3000;

let currentRequestUrl: string | undefined;

server.registerTool(
  "echo-vendor",
  {
    description: "Returns the vendor from query params",
  },
  () => {
    const params = currentRequestUrl
      ? new URL(currentRequestUrl, "http://localhost").searchParams
      : undefined;
    const vendor = params?.get("vendor") ?? null;
    return {
      content: [{ type: "text", text: JSON.stringify({ vendor, rawUrl: currentRequestUrl ?? null }) }],
    };
  },
);

const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
});

const httpServer = createServer((request, response) => {
  currentRequestUrl = request.url;
  transport.handleRequest(request, response);
});

server.connect(transport).then(() => {
  httpServer.listen(PORT, () => {
    console.log(`MCP server listening on port ${PORT}`);
  });
});
