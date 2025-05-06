import { Hono } from 'hono';
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

// Create Hono app for handling HTTP requests
const app = new Hono<{
  Bindings: Bindings;
}>();
// Serve home page
app.get('/', renderHomePage);


// Handle MCP endpoints
app.get('/sse', (c) => {
	// @ts-ignore
	return CalculatorMCP.serveSSE('/sse').fetch(c.req.raw, c.env, c.executionCtx);
  });

app.get('/mcp', (c) => {
	// @ts-ignore
	return CalculatorMCP.serve('/mcp').fetch(c.req.raw, c.env, c.executionCtx);
  });

// Fallback route
app.all('*', (c) => c.text('Not found', 404));

// Export for edge environments
export default {
  fetch: app.fetch,
};	