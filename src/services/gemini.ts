import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY not found in environment variables. Gemini features will be disabled.');
}

// Initialize the GoogleGenerativeAI client
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// System prompt for Gmail automation
const SYSTEM_PROMPT = `You are an assistant that automates Gmail tasks via Composio tools.
You must always return a structured JSON tool call when a Gmail action is requested.
Available tools:
- GMAIL_FETCH_EMAILS (list emails, unread, inbox, sent, spam)
- GMAIL_SEND_EMAIL (send new email)
- GMAIL_REPLY_TO_THREAD (reply to thread)
- GMAIL_DELETE_MESSAGE (delete a message)
- GMAIL_LIST_DRAFTS (show drafts)
- GMAIL_CREATE_EMAIL_DRAFT (create draft email)
- GMAIL_SEND_DRAFT (send existing draft)
- GMAIL_SEARCH_EMAILS (search by query)
- GMAIL_LIST_LABELS (list labels)
- GMAIL_ADD_LABEL_TO_EMAIL (add label to message)
- GMAIL_REMOVE_LABEL (remove label from message)

CRITICAL RULES:
- When user says "send email to [email] about [topic]", IMMEDIATELY create a GMAIL_SEND_EMAIL tool call
- When user says "draft email to [email]" or "create draft", use GMAIL_CREATE_EMAIL_DRAFT tool call
- Use ONLY the content the user provides - DO NOT add extra text, greetings, or signatures
- If user provides specific email content, use it exactly as written
- If user only provides topic/subject, use a minimal professional message
- DO NOT ask for clarification if you have recipient and general topic
- Only ask for clarification if recipient email is completely missing
- Always extract entities (recipient, subject, body, query, thread_id, gmailId) from the user input
- If multiple possible matches, pick the most recent message
- Format responses for humans: short, friendly confirmations

EXAMPLES:
User: "send email to john@example.com about the quarterly report"
Response: {
  "reply": "Sending email about quarterly report to john@example.com...",
  "toolCalls": [
    {
      "tool": "GMAIL_SEND_EMAIL",
      "arguments": {
        "recipient_email": "john@example.com",
        "subject": "Quarterly Report",
        "body": "Quarterly Report"
      }
    }
  ]
}

User: "send email to john@example.com saying thanks for the meeting today"
Response: {
  "reply": "Sending thank you email to john@example.com...",
  "toolCalls": [
    {
      "tool": "GMAIL_SEND_EMAIL",
      "arguments": {
        "recipient_email": "john@example.com",
        "subject": "Thank you",
        "body": "Thanks for the meeting today"
      }
    }
  ]
}

User: "create draft email to sarah@company.com about quarterly report"
Response: {
  "reply": "Creating draft email about quarterly report for sarah@company.com...",
  "toolCalls": [
    {
      "tool": "GMAIL_CREATE_EMAIL_DRAFT",
      "arguments": {
        "recipient_email": "sarah@company.com",
        "subject": "Quarterly Report",
        "body": "Quarterly Report"
      }
    }
  ]
}

User: "show my unread emails"
Response: {
  "reply": "Fetching your unread emails...",
  "toolCalls": [
    {
      "tool": "GMAIL_FETCH_EMAILS",
      "arguments": {
        "max_results": 10,
        "query": "is:unread"
      }
    }
  ]
}

When responding, you must return a JSON object with:
{
  "reply": "Human-friendly response",
  "toolCalls": [
    {
      "tool": "TOOL_NAME",
      "arguments": { "key": "value" }
    }
  ]
}

IMPORTANT: In JSON responses, always escape newlines as \\n in string values. Never use literal newlines.

If no Gmail action is needed, set toolCalls to null.`;

// Function to get Gemini model
export const getGeminiModel = () => {
  if (!genAI) {
    throw new Error('Gemini not initialized. Check GEMINI_API_KEY environment variable.');
  }
  
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp',
    systemInstruction: SYSTEM_PROMPT
  });
  
  return model;
};

// Function to call Gemini with user message
export const callGemini = async (userMessage: string, availableTools: any[]) => {
  try {
    if (!genAI) {
      throw new Error('Gemini not initialized. Using fallback response.');
    }

    const model = getGeminiModel();
    
    // Include available tools info in the prompt
    const toolsInfo = availableTools.map(tool => tool.name).join(', ');
    const enhancedPrompt = `User request: "${userMessage}"

IMPORTANT: If this is a clear Gmail action request (like sending email, listing emails, searching), create the appropriate tool call immediately. Do not ask for clarification unless the recipient email is completely missing.

Available Composio tools: ${toolsInfo}

Respond with the appropriate JSON structure. Take action immediately when you have enough information.`;
    
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Gemini raw response:', text);
    
    // Try to parse JSON from the response
    try {
      // Multiple approaches to extract JSON
      let jsonString = '';
      
      // First, try to extract from markdown code blocks
      const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1];
      } else {
        // Try to find JSON object in the text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
        } else {
          // Fallback: assume the entire text is JSON
          jsonString = text;
        }
      }
      
      // Clean the JSON string
      // 1. Remove any leading/trailing whitespace
      jsonString = jsonString.trim();
      
      // 2. Replace literal newlines with escaped newlines in string values
      // This regex handles newlines within quoted strings
      jsonString = jsonString.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match) => {
        return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
      });
      
      const parsedResponse = JSON.parse(jsonString);
      return parsedResponse;
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON response:', parseError);
      return {
        reply: text,
        toolCalls: null
      };
    }
    
  } catch (error) {
    console.error('Gemini API error:', error);
    // Return fallback response
    return {
      reply: `I received your message: "${userMessage}". I'll help you with Gmail tasks, but I'm having trouble processing your request right now.`,
      toolCalls: null
    };
  }
};

export default {
  getGeminiModel,
  callGemini,
  SYSTEM_PROMPT
};