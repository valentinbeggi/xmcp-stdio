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
    const requestInfo = extra.requestInfo as Record<string, unknown> | undefined;
    const url = requestInfo?.url;
    const vendor = url ? new URL(String(url)).searchParams.get("vendor") : null;
    return {
      content: [{ type: "text", text: JSON.stringify({ vendor, url: url ? String(url) : null }) }],
    };
  },
);

const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
});

const httpServer = createServer((request, response) => {
  transport.handleRequest(request, response);
});

server.connect(transport).then(() => {
  httpServer.listen(PORT, () => {
    console.log(`MCP server listening on port ${PORT}`);
  });
});
