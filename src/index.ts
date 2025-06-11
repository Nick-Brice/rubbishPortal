import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create server instance
const server = new McpServer({
    name: "rubbishPortal",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});

// Helper function for making API requests
async function makeAPIPostRequest<T>(url: string, body: object): Promise<T | null> {
    const headers = {
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(url, {
            headers,
            method: "POST",
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json()) as T;
    } catch (error) {
        console.error("Error making Post request:", error);
        return null;
    }
}

// Helper function for making API requests
async function makeAPIGetRequest<T>(url: string): Promise<T | null> {
    const headers = {
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(url, {
            headers,
            method: "GET",
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json()) as T;
    } catch (error) {
        console.error("Error making Post request:", error);
        return null;
    }
}

interface StreamStatsResponseObject {
    captureRate: number;
    weightUsed: number;
    weightCollected: number;
}

server.tool(
    "get-stream-statistics",
    "Find general statistics for a single stream",
    {
        stream_record_id: z.string().describe("Record ID of the stream"),

    },
    async ({ stream_record_id }) => {
        const apiURL = `http://localhost:3000/api/mcp/stats/streams/${stream_record_id}`;
        const apiData = await makeAPIGetRequest<StreamStatsResponseObject>(apiURL);

        if (!apiData) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to get stream statistics. Check API is still working.`,
                    },
                ],
            };
        }

        const captureRate = apiData?.captureRate;
        if (!captureRate) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Failed to get stream statistics.",
                    },
                ],
            };
        }

        const formattedResponse = `Statistics for ${stream_record_id}:\n Capture rate: ${captureRate} %,\n Weight Used: ${apiData?.weightUsed} kg,\n Weight Collected: ${apiData?.weightCollected} kg`;

        return {
            content: [
                {
                    type: "text",
                    text: formattedResponse,
                },
            ],
        };
    },
);

interface ProductStatsResponseObject {
    quantityUsed: number;
    quantityCollected: number;
}

server.tool(
    "get-venue-product-statistics",
    "Find general statistics for a single venue product",
    {
        product_record_id: z.string().describe("Record ID of the venue product"),

    },
    async ({ product_record_id }) => {
        const apiURL = `http://localhost:3000/api/mcp/stats/products/${product_record_id}`;
        const apiData = await makeAPIGetRequest<ProductStatsResponseObject>(apiURL);

        if (!apiData) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to get product statistics. Check API is still working.`,
                    },
                ],
            };
        }

        const captureRate = apiData?.quantityUsed;
        if (!captureRate) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Failed to get product statistics.",
                    },
                ],
            };
        }

        const formattedResponse = `Statistics for ${product_record_id}:\n Quantity Used: ${apiData?.quantityUsed} kg,\n Quantity Collected: ${apiData?.quantityCollected} kg`;

        return {
            content: [
                {
                    type: "text",
                    text: formattedResponse,
                },
            ],
        };
    },
);

interface VenueProductRecord {
    record_id: string;
    name: string;
}

server.tool(
    "get-stream-venue-products",
    "Find all venue products for a specific stream",
    {
        stream_record_id: z.string().describe("Record ID of the stream"),
    },
    async ({ stream_record_id }) => {
        const apiURL = `http://localhost:3000/api/mcp/records/streams/${stream_record_id}/products`;
        const apiData = await makeAPIGetRequest<VenueProductRecord[]>(apiURL);

        if (!apiData) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to get venue products. Check API is still working.`,
                    },
                ],
            };
        }

        if (apiData?.length == 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: "No venue products for this stream.",
                    },
                ],
            };
        }

        const formattedProducts = apiData?.map(product => `Record ID: ${product?.record_id}, Product Name: ${product?.name}`)?.join(",\n")

        const formattedResponse = `Venue Products for ${stream_record_id}:\n ${formattedProducts}`;

        return {
            content: [
                {
                    type: "text",
                    text: formattedResponse,
                },
            ],
        };
    },
);

interface VenueRecord {
    record_id: string;
    name: string;
}

server.tool(
    "get-service-provider-venues",
    "Find all venues for a specific service provider",
    {
        service_provider_name: z.string().describe("Name of the service provider"),
    },
    async ({ service_provider_name }) => {
        const apiURL = `http://localhost:3000/api/mcp/records/service-providers/${service_provider_name}/venues`;
        const apiData = await makeAPIGetRequest<VenueRecord[]>(apiURL);

        if (!apiData) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to get venues. Check API is still working.`,
                    },
                ],
            };
        }

        if (apiData?.length == 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: "No venues for this service provider.",
                    },
                ],
            };
        }

        const formattedVenues = apiData?.map(venue => `Record ID: ${venue?.record_id}, Product Name: ${venue?.name}`)?.join(",\n")

        const formattedResponse = `Venues for ${service_provider_name}:\n ${formattedVenues}`;

        return {
            content: [
                {
                    type: "text",
                    text: formattedResponse,
                },
            ],
        };
    },
);

interface StreamRecordID {
    record_id: string;
    name: string;
}

server.tool(
    "get-stream-ids",
    "Find all streams for a specific venue",
    {
        venue_record_id: z.string().describe("Record ID of the venue"),

    },
    async ({ venue_record_id }) => {
        const apiURL = `http://localhost:3000/api/mcp/records/venues/${venue_record_id}/streams`;
        const apiData = await makeAPIGetRequest<StreamRecordID[]>(apiURL);

        if (!apiData) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to get stream ids. Check API is still working.`,
                    },
                ],
            };
        }

        if (apiData?.length == 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Failed to get stream ids.",
                    },
                ],
            };
        }

        const formattedStreams = apiData?.map(stream => `Record ID: ${stream?.record_id}, Stream Name: ${stream?.name}`)?.join(",\n")

        const formattedResponse = `Stream record ids for ${venue_record_id}:\n ${formattedStreams}`;

        return {
            content: [
                {
                    type: "text",
                    text: formattedResponse,
                },
            ],
        };
    },
);


async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Rubbish Portal MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});