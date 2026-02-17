import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

const app = express();
app.use(express.json());

const server = new McpServer({ name: "query-param-test", version: "1.0.0" });

server.tool("echo-vendor", "Returns the vendor from query params", {}, (_args, extra) => {
  const url = extra.requestInfo?.url;
  const vendor = url ? new URL(url.toString()).searchParams.get("vendor") : null;
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ vendor, url: url?.toString() ?? null }),
      },
    ],
  };
});

const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
await server.connect(transport);

app.all("/mcp", async (req, res) => {
  await transport.handleRequest(req, res, req.body);
});

app.listen(3000, () => console.log("MCP server listening on port 3000"));
