# Remote MCP Server on Cloudflare Workers (Without Auth)

This project provides a ready-to-deploy Model Context Protocol (MCP) server running on Cloudflare Workers without requiring authentication. It enables AI assistants to access custom tools and capabilities through the standardized MCP interface.

## Quick Start

### Option 1: One-Click Deploy

[![Deploy to Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/ai/tree/main/demos/remote-mcp-authless)

This will deploy your MCP server to a URL in the format:

```
remote-mcp-server-authless.<your-account>.workers.dev/sse
```

### Option 2: Local Setup

Create and deploy the MCP server using the command line:

```bash
# Create a new project from the template
npm create cloudflare@latest -- my-mcp-server --template=cloudflare/ai/demos/remote-mcp-authless

# Navigate to your new project
cd my-mcp-server

# Deploy to Cloudflare Workers
pnpm run deploy
```

After deployment, your server will be available at:

```
remote-mcp-authless.<your-account>.workers.dev
```

## Customizing Your MCP Server

### Adding Custom Tools

To add your own tools to the MCP server:

1. Open `src/index.ts`
2. Define each tool inside the `init()` method using the `this.server.tool(...)` syntax
3. Deploy your changes with `pnpm run deploy`

Example of adding a custom tool:

```typescript
init() {
  // Built-in calculator tool
  this.server.tool({
    name: "calculator",
    description: "Evaluates mathematical expressions",
    parameters: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description: "The mathematical expression to evaluate"
        }
      },
      required: ["expression"]
    },
    handler: async ({ expression }) => {
      // Tool implementation
      return { result: eval(expression) };
    }
  });

  // Add your custom tool here
  this.server.tool({
    name: "my_custom_tool",
    description: "Description of what your tool does",
    parameters: {
      // Define your tool's parameters
    },
    handler: async (params) => {
      // Your tool's implementation
      return { result: "Tool output" };
    }
  });
}
```

## Connecting to Your MCP Server

### Using Cloudflare AI Playground

The Cloudflare AI Playground provides a web interface for interacting with your MCP server:

1. Go to [https://playground.ai.cloudflare.com/](https://playground.ai.cloudflare.com/)
2. Enter your deployed MCP server URL (e.g., `remote-mcp-server-authless.<your-account>.workers.dev/sse`)
3. Start using your custom tools within the playground

### Connecting Claude Desktop (or other MCP clients)

Connect local MCP clients to your remote MCP server using the [mcp-remote proxy](https://www.npmjs.com/package/mcp-remote):

1. Follow [Anthropic's MCP Quickstart Guide](https://modelcontextprotocol.io/quickstart/user)
2. In Claude Desktop, go to Settings > Developer > Edit Config
3. Update the configuration with:

```json
{
  "mcpServers": {
    "calculator": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://remote-mcp-authless.<your-account>.workers.dev/sse"
      ]
    }
  }
}
```

4. Restart Claude Desktop to activate the tools

## Development and Testing

### Local Development

Run your MCP server locally for testing:

```bash
# Install dependencies
pnpm install

# Start local development server
pnpm run dev
```

Your local server will be available at `http://localhost:8787/sse`

### Deployment

Deploy updates to your MCP server:

```bash
pnpm run deploy
```

The command output will show the deployed URL:

```
Uploaded remote-mcp-authless (x.xx sec)
Deployed remote-mcp-authless triggers (x.xx sec)
  https://remote-mcp-authless.<your-account>.workers.dev
```

## Troubleshooting

- **Connection Issues**: Ensure your Cloudflare Workers URL includes the `/sse` endpoint
- **CORS Errors**: By default, the server accepts connections from any origin. Modify `src/index.ts` if you need to restrict access
- **Tool Not Found**: Check that your tool is properly registered in the `init()` method
- **Deployment Failures**: Verify that you have the correct Cloudflare credentials configured

## Additional Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Anthropic Claude MCP Guide](https://docs.anthropic.com/claude/docs/model-context-protocol)
- [MCP-Remote Proxy Package](https://www.npmjs.com/package/mcp-remote)

## License

This project is licensed under the terms specified in the repository.
