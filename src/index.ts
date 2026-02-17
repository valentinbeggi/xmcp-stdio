import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import express, { type Request, type Response } from "express";

const app = express();
app.use(express.json());

function getServer() {
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

  return server;
}

app.all("/mcp", async (req: Request, res: Response) => {
  const body = req.body as { method?: string };
  if (body.method && isInitializeRequest(body)) {
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    const server = getServer();
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
    return;
  }
  res.status(400).json({ jsonrpc: "2.0", error: { code: -32600, message: "Must initialize first" }, id: null });
});

app.listen(3000, () => console.log("MCP server listening on port 3000"));
