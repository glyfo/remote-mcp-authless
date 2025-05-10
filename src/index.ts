import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { renderHomePage } from './home';

// Environment interface with necessary bindings
export interface Env {
	MCP_OBJECT: DurableObjectNamespace;

  }
  
  interface Context {
	// Add context properties if needed
  }

  type Bindings = Env & {};
  
  // Props passed to the Durable Object
  type Props = {};
  
  // State maintained by the Durable Object
  type State = null;

/**
 * Calculator MCP Agent using Hono framework
 */
export class CalculatorMCP extends McpAgent<Bindings, State, Props> {

  server = new McpServer({
    name: "Calculator",
    version: "1.0.0",
  });

  async init() {
    // Register calculator tool with multiple operations
    this.server.tool(
      "calculate",
      {
        operation: z.enum(["add", "subtract", "multiply", "divide"]),
        a: z.number(),
        b: z.number(),
      },
      async ({ operation, a, b }) => {
        let result: number;
        
        switch (operation) {
          case "add":
            result = a + b;
            break;
          case "subtract":
            result = a - b;
            break;
          case "multiply":
            result = a * b;
            break;
          case "divide":
            if (b === 0) {
              return {
                content: [{ type: "text", text: "Error: Cannot divide by zero" }],
              };
            }
            result = a / b;
            break;
        }
        
        return { 
          content: [{ type: "text", text: String(result) }] 
        };
      }
    );
  }
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    if (url.pathname === "/sse" || url.pathname === "/sse/message") {
      // @ts-ignore
      return CalculatorMCP.serveSSE("/sse").fetch(request, env, ctx);
    }
    if (url.pathname === "/mcp") {
      // @ts-ignore
      return CalculatorMCP.serve("/mcp").fetch(request, env, ctx);
    }
    if (url.pathname === "/") {
      return renderHomePage({ req: { raw: request }, env, executionCtx: ctx });
    }
    return new Response("Not found", { status: 404 });
  },
};
