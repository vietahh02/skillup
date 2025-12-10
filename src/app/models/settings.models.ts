/**
 * System Settings Models
 * Super simple version - only AI API Key
 */

export interface AiKeySettings {
  apiKey: string;  // Masked: ****...abc123
}

export interface UpdateAiKeyRequest {
  apiKey: string;
}
