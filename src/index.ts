import { Hono } from 'hono';
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { renderHomePage } from './home';

// Simplified environment interface
export interface Env {
  MCP_OBJECT: DurableObjectNamespace;
}

/**
 * Calculator MCP Agent using Hono framework
 */
export class CalculatorMCP extends McpAgent<Env, null, {}> {
  server = new McpServer({
    name: "Calculator",
    version: "1.0.0",
  });

  async init() {
    // Register calculator tool with optimized operation handling
    this.server.tool(
      "calculate",
      {
        operation: z.enum(["add", "subtract", "multiply", "divide"]),
        a: z.number(),
        b: z.number(),
      },
      async ({ operation, a, b }) => {
        // Use operation map for cleaner calculation logic
        const operations = {
          add: () => a + b,
          subtract: () => a - b,
          multiply: () => a * b,
          divide: () => b === 0 ? null : a / b
        };
        
        const result = operations[operation]();
        
        return result === null
          ? { content: [{ type: "text", text: "Error: Cannot divide by zero" }] }
          : { content: [{ type: "text", text: String(result) }] };
      }
    );
  }

  // Static helper to expose MCP endpoints
  static createEndpoints(app: Hono<{ Bindings: Env }>) {
    app.get('/sse', (c) => this.serveSSE('/sse').fetch(c.req.raw, c.env, c.executionCtx));
    app.get('/sse/message', (c) => this.serveSSE('/sse').fetch(c.req.raw, c.env, c.executionCtx));
    app.get('/mcp', (c) => this.serve('/mcp').fetch(c.req.raw, c.env, c.executionCtx));
    return app;
  }
}

// Create Hono app with direct routes for better readability
const app = new Hono<{ Bindings: Env }>();

// Home route
app.get('/', renderHomePage);

// Add MCP endpoints using the helper method
CalculatorMCP.createEndpoints(app);

// Fallback route
app.all('*', (c) => c.text('Not found', 404));

// Simplified export
export default { fetch: app.fetch };