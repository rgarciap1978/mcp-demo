import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

interface GreetArgs {
    name: string;
}

const server = new Server(
    {
        name: "mcp-demo",
        version: "1.0.0",
        description: "Greet the user"
    },
    {
        capabilities: {
            tools: {}
        }
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "greet",
                description: "Greet a person by name",
                inputSchema: {
                    type: "object",
                    properties: {
                        name: { 
                            type: "string", 
                            description: "The name of the person to greet" 
                        }
                    },
                    required: ["name"]
                }
            }
        ]
    }
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if(name === "greet") {
        const { name: personName } = args as unknown as GreetArgs;

        return {
            content: [
                {
                    type: "text",
                    text: `Hello, ${personName}! Welcome to th minimal MCP demo.`
                }
            ]
        }
    }

    throw new Error(`Tool ${name} not found`);
});

async function main(): Promise<void> {
    const transport = new StdioServerTransport();
    
    await server.connect(transport);
    //console.log("Minimal MCP Demo Server is running...");

    process.stdin.resume();
}

main().catch((error: Error) => {
    console.error("Error: ", error);
    process.exit(1);
})