import composio from '../composio/client.js';
interface GmailTool {
    slug: string;
    name: string;
    displayName: string;
    description: string;
    parameters: any[];
    category: string;
}
interface CategorizedTools {
    fetch: GmailTool[];
    send: GmailTool[];
    draft: GmailTool[];
    reply: GmailTool[];
    labels: GmailTool[];
    search: GmailTool[];
    actions: GmailTool[];
    other: GmailTool[];
}
/**
 * Fetch available Gmail tools for a specific user
 * @param userId - The user ID to fetch tools for
 * @returns Promise with list of Gmail tool slugs and metadata
 */
export declare function getGmailTools(userId: string): Promise<{
    success: boolean;
    totalTools: number;
    tools: GmailTool[];
    categorized: CategorizedTools;
    slugs: string[];
}>;
/**
 * Validate if a tool slug belongs to Gmail toolkit
 * @param toolSlug - The tool slug to validate
 * @param userId - Optional user ID to check against available tools
 * @returns Promise<boolean> indicating if the tool is a valid Gmail tool
 */
export declare function isValidGmailTool(toolSlug: string, userId?: string): Promise<boolean>;
/**
 * Get tool information by slug
 * @param toolSlug - The tool slug to get info for
 * @param userId - The user ID to fetch tools for
 * @returns Promise with tool information or null if not found
 */
export declare function getGmailToolInfo(toolSlug: string, userId: string): Promise<GmailTool | null>;
/**
 * Execute a Gmail tool with given parameters (updated to handle any Gmail tool)
 * @param toolSlug - The Gmail tool slug to execute
 * @param userId - The user ID to execute for
 * @param parameters - The parameters to pass to the tool
 * @param validateTool - Whether to validate the tool belongs to Gmail toolkit (default: true)
 * @returns Promise with tool execution result
 */
export declare function executeGmailTool(toolSlug: string, userId: string, parameters: any, validateTool?: boolean): Promise<{
    success: boolean;
    toolSlug: string;
    result: Record<string, unknown>;
    rawResult: {
        error: string | null;
        data: Record<string, unknown>;
        successful: boolean;
        logId?: string | undefined;
        sessionInfo?: unknown;
    };
}>;
/**
 * Helper function to send arguments to any Composio tool
 * @param toolSlug - The tool slug to execute
 * @param args - The arguments to pass to the tool
 * @param userId - Optional user ID (if not provided, will use a default)
 * @returns Promise with tool execution result
 */
export declare function sendArguments(toolSlug: string, args: any, userId?: string): Promise<{
    success: boolean;
    toolSlug: string;
    result: Record<string, unknown>;
    rawResult: {
        error: string | null;
        data: Record<string, unknown>;
        successful: boolean;
        logId?: string | undefined;
        sessionInfo?: unknown;
    };
    executedFor: string;
}>;
/**
 * Execute multiple Gmail tools in sequence
 * @param operations - Array of tool operations to execute
 * @param userId - The user ID to execute for
 * @param stopOnError - Whether to stop execution on first error (default: true)
 * @returns Promise with results from all operations
 */
export declare function executeBatchGmailTools(operations: Array<{
    toolSlug: string;
    parameters: any;
}>, userId: string, stopOnError?: boolean): Promise<{
    success: boolean;
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    results: any[];
    errors: any[];
}>;
/**
 * Get available Gmail tools with filtering options
 * @param userId - The user ID to fetch tools for
 * @param category - Optional category filter
 * @param searchTerm - Optional search term to filter tools
 * @returns Promise with filtered Gmail tools
 */
export declare function getFilteredGmailTools(userId: string, category?: string, searchTerm?: string): Promise<{
    success: boolean;
    totalTools: number;
    filteredCount: number;
    tools: GmailTool[];
    categories: string[];
    appliedFilters: {
        category: string;
        searchTerm: string;
    };
}>;
export { composio };
