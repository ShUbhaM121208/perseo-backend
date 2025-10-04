export declare const getGeminiModel: () => import("@google/generative-ai").GenerativeModel;
export declare const callGemini: (userMessage: string, availableTools: any[]) => Promise<any>;
declare const _default: {
    getGeminiModel: () => import("@google/generative-ai").GenerativeModel;
    callGemini: (userMessage: string, availableTools: any[]) => Promise<any>;
    SYSTEM_PROMPT: string;
};
export default _default;
