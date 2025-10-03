import composio from '../composio/client.js';

// Type definitions
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
export async function getGmailTools(userId: string) {
  try {
    console.log(`Fetching Gmail tools for user: ${userId}`);
    
    // Get all Gmail tools for the user
    const tools = await composio.tools.get(userId, { toolkits: ['GMAIL'] });
    
    console.log(`Found ${tools.length} Gmail tools`);
    console.log('Raw tools data (first tool):', JSON.stringify(tools[0], null, 2));
    
    // Extract tool information with better error handling
    const toolsInfo: GmailTool[] = tools.map((tool: any, index: number) => {
      // Log the structure of each tool to understand the data format
      if (index < 3) {
        console.log(`Tool ${index} structure:`, Object.keys(tool));
        console.log(`Tool ${index} function name:`, tool.function?.name);
      }
      
      // The correct structure is tool.function.name and tool.function.description
      const slug = tool.function?.name || `tool_${index}`;
      const name = tool.function?.name || `tool_${index}`;
      const description = tool.function?.description || 'No description available';
      
      return {
        slug: slug,
        name: name,
        displayName: name,
        description: description,
        parameters: tool.function?.parameters || {},
        // Categorize tools by operation type
        category: categorizeGmailTool(slug)
      };
    });
    
    // Group tools by category for easier understanding
    const categorizedTools: CategorizedTools = {
      fetch: toolsInfo.filter((tool: GmailTool) => tool.category === 'fetch'),
      send: toolsInfo.filter((tool: GmailTool) => tool.category === 'send'),
      draft: toolsInfo.filter((tool: GmailTool) => tool.category === 'draft'),
      reply: toolsInfo.filter((tool: GmailTool) => tool.category === 'reply'),
      labels: toolsInfo.filter((tool: GmailTool) => tool.category === 'labels'),
      search: toolsInfo.filter((tool: GmailTool) => tool.category === 'search'),
      actions: toolsInfo.filter((tool: GmailTool) => tool.category === 'actions'),
      other: toolsInfo.filter((tool: GmailTool) => tool.category === 'other')
    };
    
    // Log detailed information
    console.log('=== Gmail Tools by Category ===');
    Object.entries(categorizedTools).forEach(([category, tools]) => {
      if (tools.length > 0) {
        console.log(`\n${category.toUpperCase()} Tools (${tools.length}):`);
        tools.forEach((tool: GmailTool) => {
          console.log(`  - ${tool.slug}: ${tool.description}`);
        });
      }
    });
    
    return {
      success: true,
      totalTools: tools.length,
      tools: toolsInfo,
      categorized: categorizedTools,
      slugs: toolsInfo.map((tool: GmailTool) => tool.slug)
    };
    
  } catch (error) {
    console.error('Error fetching Gmail tools:', error);
    throw new Error(`Failed to fetch Gmail tools: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Categorize Gmail tools based on their slug/name
 * @param slug - Tool slug to categorize
 * @returns Category string
 */
function categorizeGmailTool(slug: string): string {
  if (!slug) return 'other';
  
  const lowerSlug = slug.toLowerCase();
  
  // Fetch/Get operations
  if (lowerSlug.includes('fetch') || lowerSlug.includes('get') || lowerSlug.includes('list') || lowerSlug.includes('read')) {
    return 'fetch';
  }
  
  // Send operations
  if (lowerSlug.includes('send') || lowerSlug.includes('compose')) {
    return 'send';
  }
  
  // Draft operations
  if (lowerSlug.includes('draft')) {
    return 'draft';
  }
  
  // Reply operations
  if (lowerSlug.includes('reply') || lowerSlug.includes('forward')) {
    return 'reply';
  }
  
  // Label operations
  if (lowerSlug.includes('label') || lowerSlug.includes('folder')) {
    return 'labels';
  }
  
  // Search operations
  if (lowerSlug.includes('search') || lowerSlug.includes('query')) {
    return 'search';
  }
  
  // Actions (mark read, delete, star, etc.)
  if (lowerSlug.includes('mark') || lowerSlug.includes('delete') || lowerSlug.includes('star') || 
      lowerSlug.includes('archive') || lowerSlug.includes('spam') || lowerSlug.includes('trash')) {
    return 'actions';
  }
  
  return 'other';
}

/**
 * Validate if a tool slug belongs to Gmail toolkit
 * @param toolSlug - The tool slug to validate
 * @param userId - Optional user ID to check against available tools
 * @returns Promise<boolean> indicating if the tool is a valid Gmail tool
 */
export async function isValidGmailTool(toolSlug: string, userId?: string): Promise<boolean> {
  try {
    if (!toolSlug) return false;
    
    // Basic validation - check if slug starts with GMAIL_
    if (!toolSlug.toUpperCase().startsWith('GMAIL_')) {
      return false;
    }
    
    // If userId is provided, check against available tools
    if (userId) {
      const availableTools = await getGmailTools(userId);
      return availableTools.slugs.includes(toolSlug);
    }
    
    return true;
  } catch (error) {
    console.error('Error validating Gmail tool:', error);
    return false;
  }
}

/**
 * Get tool information by slug
 * @param toolSlug - The tool slug to get info for
 * @param userId - The user ID to fetch tools for
 * @returns Promise with tool information or null if not found
 */
export async function getGmailToolInfo(toolSlug: string, userId: string): Promise<GmailTool | null> {
  try {
    const availableTools = await getGmailTools(userId);
    return availableTools.tools.find(tool => tool.slug === toolSlug) || null;
  } catch (error) {
    console.error('Error getting Gmail tool info:', error);
    return null;
  }
}

/**
 * Execute a Gmail tool with given parameters (updated to handle any Gmail tool)
 * @param toolSlug - The Gmail tool slug to execute
 * @param userId - The user ID to execute for
 * @param parameters - The parameters to pass to the tool
 * @param validateTool - Whether to validate the tool belongs to Gmail toolkit (default: true)
 * @returns Promise with tool execution result
 */
export async function executeGmailTool(
  toolSlug: string, 
  userId: string, 
  parameters: any, 
  validateTool: boolean = true
) {
  try {
    console.log(`Executing Gmail tool: ${toolSlug} for user: ${userId}`);
    console.log('Parameters:', JSON.stringify(parameters, null, 2));
    
    // Validate tool if requested
    if (validateTool) {
      const isValid = await isValidGmailTool(toolSlug, userId);
      if (!isValid) {
        throw new Error(`Invalid Gmail tool: ${toolSlug}. Tool not found or not available for user.`);
      }
    }
    
    const result = await composio.tools.execute(
      toolSlug,
      {
        userId: userId,
        arguments: parameters
      }
    );
    
    console.log(`Tool execution successful for ${toolSlug}`);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    return {
      success: true,
      toolSlug,
      result: result.data || result,
      rawResult: result
    };
    
  } catch (error) {
    console.error(`Error executing Gmail tool ${toolSlug}:`, error);
    throw new Error(`Failed to execute ${toolSlug}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Helper function to send arguments to any Composio tool
 * @param toolSlug - The tool slug to execute
 * @param args - The arguments to pass to the tool
 * @param userId - Optional user ID (if not provided, will use a default)
 * @returns Promise with tool execution result
 */
export async function sendArguments(toolSlug: string, args: any, userId?: string) {
  try {
    console.log(`Sending arguments to tool: ${toolSlug}`);
    console.log('Arguments:', JSON.stringify(args, null, 2));
    
    // Use provided userId or fall back to a default
    const entityId = userId || 'default-user';
    
    const result = await composio.tools.execute(
      toolSlug,
      {
        userId: entityId,
        arguments: args
      }
    );
    
    console.log(`Tool execution successful for ${toolSlug}`);
    console.log('Raw result:', JSON.stringify(result, null, 2));
    
    return {
      success: true,
      toolSlug,
      result: result.data || result,
      rawResult: result,
      executedFor: entityId
    };
    
  } catch (error) {
    console.error(`Error executing tool ${toolSlug}:`, error);
    throw new Error(`Failed to execute ${toolSlug}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Execute multiple Gmail tools in sequence
 * @param operations - Array of tool operations to execute
 * @param userId - The user ID to execute for
 * @param stopOnError - Whether to stop execution on first error (default: true)
 * @returns Promise with results from all operations
 */
export async function executeBatchGmailTools(
  operations: Array<{ toolSlug: string; parameters: any }>,
  userId: string,
  stopOnError: boolean = true
) {
  const results: any[] = [];
  const errors: any[] = [];
  
  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i];
    try {
      console.log(`Executing batch operation ${i + 1}/${operations.length}: ${operation.toolSlug}`);
      
      const result = await executeGmailTool(
        operation.toolSlug, 
        userId, 
        operation.parameters,
        false // Skip validation for batch operations for performance
      );
      
      results.push({
        index: i,
        operation: operation.toolSlug,
        success: true,
        result
      });
      
    } catch (error) {
      const errorInfo = {
        index: i,
        operation: operation.toolSlug,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      errors.push(errorInfo);
      results.push(errorInfo);
      
      if (stopOnError) {
        console.error(`Batch execution stopped at operation ${i + 1} due to error:`, error);
        break;
      }
    }
  }
  
  return {
    success: errors.length === 0,
    totalOperations: operations.length,
    successfulOperations: results.filter(r => r.success).length,
    failedOperations: errors.length,
    results,
    errors
  };
}

/**
 * Get available Gmail tools with filtering options
 * @param userId - The user ID to fetch tools for
 * @param category - Optional category filter
 * @param searchTerm - Optional search term to filter tools
 * @returns Promise with filtered Gmail tools
 */
export async function getFilteredGmailTools(
  userId: string, 
  category?: string, 
  searchTerm?: string
) {
  try {
    const allTools = await getGmailTools(userId);
    
    let filteredTools = allTools.tools;
    
    // Filter by category if provided
    if (category && category !== 'all') {
      filteredTools = filteredTools.filter(tool => tool.category === category);
    }
    
    // Filter by search term if provided
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredTools = filteredTools.filter(tool => 
        tool.slug.toLowerCase().includes(searchLower) ||
        tool.name.toLowerCase().includes(searchLower) ||
        tool.description.toLowerCase().includes(searchLower)
      );
    }
    
    return {
      success: true,
      totalTools: allTools.totalTools,
      filteredCount: filteredTools.length,
      tools: filteredTools,
      categories: Object.keys(allTools.categorized),
      appliedFilters: {
        category: category || 'all',
        searchTerm: searchTerm || ''
      }
    };
    
  } catch (error) {
    console.error('Error filtering Gmail tools:', error);
    throw new Error(`Failed to filter Gmail tools: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export { composio };