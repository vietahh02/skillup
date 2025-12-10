export interface ConversationModel {
    message: string;
    conversationHistory: ConversationHistoryItem[];
    context?: string;
}

export interface ConversationHistoryItem {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatMessage {
    id: string;
    text: string;
    isBot: boolean;
    timestamp: Date;
    typing?: boolean;
}

export interface AiChatResponse {
    response: string;
    timestamp: string;
}


export interface AiChatRequest {
    totalUser: number
    totalCourse: number
    totalAnswer: number
    totalCorrectAnswer: number
    totalIncorrectAnswer: number
    totalSkippedAnswer: number
}
