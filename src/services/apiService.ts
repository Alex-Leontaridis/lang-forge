// API Service for PromptForge
// Handles calls to Groq and OpenRouter APIs (OpenAI models now go through OpenRouter)

interface APIConfig {
  groqApiKey: string;
  openRouterApiKey: string;
  openRouterOpenAIKey: string; // Key for OpenAI models through OpenRouter
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Model configuration mapping
const MODEL_CONFIG = {
  // OpenAI models (routed through OpenRouter with openRouterOpenAIKey)
  'gpt-4': { provider: 'openrouter_openai', modelId: 'openai/gpt-4' },
  'gpt-3.5-turbo': { provider: 'openrouter_openai', modelId: 'openai/gpt-3.5-turbo' },
  'gpt-4o': { provider: 'openrouter_openai', modelId: 'openai/gpt-4o' },
  'gpt-4o-mini': { provider: 'openrouter_openai', modelId: 'openai/gpt-4o-mini' },
  
  // Groq models (using direct Groq API)
  'gemma2-9b-it': { provider: 'groq', modelId: 'gemma2-9b-it' },
  'llama-3.1-8b-instant': { provider: 'groq', modelId: 'llama-3.1-8b-instant' },
  'llama-3.3-70b-versatile': { provider: 'groq', modelId: 'llama-3.3-70b-versatile' },
  'deepseek-r1-distill-llama-70b': { provider: 'groq', modelId: 'deepseek-r1-distill-llama-70b' },
  'llama-4-maverick-17b-128e-instruct': { provider: 'groq', modelId: 'llama-4-maverick-17b-128e-instruct' },
  'llama-4-scout-17b-16e-instruct': { provider: 'groq', modelId: 'llama-4-scout-17b-16e-instruct' },
  'mistral-saba-24b': { provider: 'groq', modelId: 'mistral-saba-24b' },
  'qwen-qwq-32b': { provider: 'groq', modelId: 'qwen-qwq-32b' },
  'qwen3-32b': { provider: 'groq', modelId: 'qwen3-32b' },
  
  // OpenRouter models - Using verified model IDs (using original OpenRouter key)
  'meta-llama/llama-3.3-70b-instruct': { provider: 'openrouter', modelId: 'meta-llama/llama-3.3-70b-instruct' },
  'qwen/qwen-2.5-coder-32b-instruct': { provider: 'openrouter', modelId: 'qwen/qwen-2.5-coder-32b-instruct' },
  'meta-llama/llama-3.2-11b-vision-instruct': { provider: 'openrouter', modelId: 'meta-llama/llama-3.2-11b-vision-instruct' },
  'meta-llama/llama-3.2-1b-instruct': { provider: 'openrouter', modelId: 'meta-llama/llama-3.2-1b-instruct' },
  'qwen/qwen-2.5-72b-instruct': { provider: 'openrouter', modelId: 'qwen/qwen-2.5-72b-instruct' },
  'meta-llama/llama-3.1-8b-instruct': { provider: 'openrouter', modelId: 'meta-llama/llama-3.1-8b-instruct' },
  'mistralai/mistral-nemo': { provider: 'openrouter', modelId: 'mistralai/mistral-nemo' },
  'google/gemma-2-9b-it': { provider: 'openrouter', modelId: 'google/gemma-2-9b-it' },
  'mistralai/mistral-7b-instruct': { provider: 'openrouter', modelId: 'mistralai/mistral-7b-instruct' },
  
  // Default to OpenRouter for other models
  'default': { provider: 'openrouter', modelId: 'openai/gpt-4o' }
};

// API Keys - Using environment variables (removed VITE_OPENAI_API_KEY)
const GROQ_API_KEY = import.meta.env?.VITE_GROQ_API_KEY;
const OPENROUTER_API_KEY = import.meta.env?.VITE_OPENROUTER_API_KEY;
const OPENROUTER_OPENAI_KEY = import.meta.env?.VITE_OPENROUTER_OPENAI_KEY;

// Debug logging for API keys
console.log('API Keys Debug:', {
  groq: GROQ_API_KEY ? `${GROQ_API_KEY.substring(0, 10)}...` : 'NOT SET',
  openrouter: OPENROUTER_API_KEY ? `${OPENROUTER_API_KEY.substring(0, 10)}...` : 'NOT SET',
  openrouterOpenAI: OPENROUTER_OPENAI_KEY ? `${OPENROUTER_OPENAI_KEY.substring(0, 10)}...` : 'NOT SET',
  env: import.meta.env
});

class APIService {
  private config: APIConfig;

  constructor(config: APIConfig) {
    this.config = config;
    
    // Validate API keys on initialization
    if (!this.config.groqApiKey) {
      console.warn('Groq API key is not set. Groq models will not work.');
    }
    if (!this.config.openRouterApiKey) {
      console.warn('OpenRouter API key is not set. OpenRouter models will not work.');
    }
    if (!this.config.openRouterOpenAIKey) {
      console.warn('OpenRouter OpenAI API key is not set. OpenAI models through OpenRouter will not work.');
    }
  }

  private getModelConfig(modelId: string) {
    return MODEL_CONFIG[modelId as keyof typeof MODEL_CONFIG] || MODEL_CONFIG.default;
  }

  private async callGroqAPI(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!this.config.groqApiKey) {
      throw new Error('Groq API key is not configured. Please set VITE_GROQ_API_KEY in your environment variables.');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error details:', errorText);
      throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  private async callOpenRouterAPI(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!this.config.openRouterApiKey) {
      throw new Error('OpenRouter API key is not configured. Please set VITE_OPENROUTER_API_KEY in your environment variables.');
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.config.openRouterApiKey}`,
      'Content-Type': 'application/json',
      'X-Title': 'PromptForge',
    };

    // Add HTTP-Referer only in browser environment
    if (typeof window !== 'undefined' && window.location) {
      headers['HTTP-Referer'] = window.location.origin;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...request,
        stream: false, // Ensure streaming is disabled
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error details:', errorText);
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  private async callOpenRouterOpenAIAPI(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!this.config.openRouterOpenAIKey) {
      throw new Error('OpenRouter OpenAI API key is not configured. Please set VITE_OPENROUTER_OPENAI_KEY in your environment variables.');
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.config.openRouterOpenAIKey}`,
      'Content-Type': 'application/json',
      'X-Title': 'PromptForge',
    };

    // Add HTTP-Referer only in browser environment
    if (typeof window !== 'undefined' && window.location) {
      headers['HTTP-Referer'] = window.location.origin;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...request,
        stream: false, // Ensure streaming is disabled
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter OpenAI API error details:', errorText);
      throw new Error(`OpenRouter OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  async generateCompletion(
    modelId: string,
    prompt: string,
    systemMessage?: string,
    temperature: number = 0.7,
    maxTokens?: number
  ): Promise<{
    content: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }> {
    const modelConfig = this.getModelConfig(modelId);
    const messages: ChatMessage[] = [];

    if (systemMessage) {
      messages.push({ role: 'system', content: systemMessage });
    }

    messages.push({ role: 'user', content: prompt });

    const request: ChatCompletionRequest = {
      model: modelConfig.modelId,
      messages,
      temperature,
      ...(maxTokens && { max_tokens: maxTokens }),
    };

    try {
      let response: ChatCompletionResponse;

      if (modelConfig.provider === 'groq') {
        response = await this.callGroqAPI(request);
      } else if (modelConfig.provider === 'openrouter_openai') {
        response = await this.callOpenRouterOpenAIAPI(request);
      } else {
        response = await this.callOpenRouterAPI(request);
      }

      return {
        content: response.choices[0]?.message?.content || '',
        usage: response.usage,
      };
    } catch (error) {
      console.error(`Error calling ${modelConfig.provider} API:`, error);
      throw error;
    }
  }

  // New method for evaluating prompt responses using GPT-4
  async evaluatePromptResponse(
    originalPrompt: string,
    modelResponse: string,
    temperature: number = 0.3
  ): Promise<{
    relevance: number;
    clarity: number;
    creativity: number;
    overall: number;
    critique: string;
  }> {
    const systemMessage = `You are an expert prompt evaluator with specialized training in assessing AI model responses. Your task is to provide consistent, objective evaluations using a standardized 100-point scale.

EVALUATION CRITERIA (100-point scale):
1. RELEVANCE (0-100): How accurately and comprehensively does the response address the prompt's intent, requirements, and context?
   - 90-100: Exceptional alignment with prompt intent
   - 70-89: Strong alignment with minor gaps
   - 50-69: Moderate alignment with some gaps
   - 30-49: Weak alignment with significant gaps
   - 0-29: Poor alignment or off-topic

2. CLARITY (0-100): How clear, coherent, well-structured, and understandable is the response?
   - 90-100: Exceptionally clear and well-organized
   - 70-89: Clear with minor structural issues
   - 50-69: Generally clear with some confusion
   - 30-49: Unclear with significant structural problems
   - 0-29: Very unclear or incomprehensible

3. CREATIVITY (0-100): How original, insightful, innovative, or engaging is the response?
   - 90-100: Highly creative and original insights
   - 70-89: Creative with good insights
   - 50-69: Some creativity and basic insights
   - 30-49: Limited creativity or insights
   - 0-29: Minimal creativity or unoriginal

EVALUATION PROCESS:
- Analyze the prompt's intent, context, and requirements
- Assess how well the response meets each criterion
- Use the detailed scoring rubric above
- Calculate overall score as weighted average: Relevance (40%) + Clarity (35%) + Creativity (25%)
- Provide specific, constructive feedback explaining your scoring
- Be consistent and objective across all evaluations

Respond in the following JSON format only:
{
  "relevance": [score_0-100],
  "clarity": [score_0-100], 
  "creativity": [score_0-100],
  "overall": [weighted_average_score],
  "critique": "[detailed explanation of scoring with specific examples]"
}`;

    const evaluationPrompt = `PROMPT: "${originalPrompt}"

RESPONSE: "${modelResponse}"

Please evaluate this response according to the criteria above. Provide specific examples from the response to justify your scoring.`;

    try {
      const result = await this.generateCompletion(
        'gpt-4',
        evaluationPrompt,
        systemMessage,
        temperature,
        800
      );

      // Parse the JSON response
      const evaluation = JSON.parse(result.content);
      
      // Ensure scores are within valid range and calculate weighted overall
      const relevance = Math.min(100, Math.max(0, evaluation.relevance || 50));
      const clarity = Math.min(100, Math.max(0, evaluation.clarity || 50));
      const creativity = Math.min(100, Math.max(0, evaluation.creativity || 50));
      
      // Calculate weighted overall score
      const weightedOverall = Math.round(relevance * 0.4 + clarity * 0.35 + creativity * 0.25);
      
      return {
        relevance,
        clarity,
        creativity,
        overall: weightedOverall,
        critique: evaluation.critique || 'Evaluation completed with weighted scoring.'
      };
    } catch (error) {
      console.error('Error evaluating prompt response:', error);
      // Fallback to default scores if evaluation fails
      return {
        relevance: 50,
        clarity: 50,
        creativity: 50,
        overall: 50,
        critique: 'Evaluation failed. Using default scores.'
      };
    }
  }

  // Special method for speech-to-text models (Whisper)
  async transcribeAudio(
    modelId: string,
    audioFile: File
  ): Promise<{
    text: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }> {
    const modelConfig = this.getModelConfig(modelId);
    
    if (modelConfig.provider !== 'groq') {
      throw new Error('Speech-to-text is only supported via Groq API');
    }

    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', modelConfig.modelId);

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.groqApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Groq transcription API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return {
      text: result.text || '',
      usage: result.usage,
    };
  }
}

// Create and export a singleton instance
const apiService = new APIService({
  groqApiKey: GROQ_API_KEY,
  openRouterApiKey: OPENROUTER_API_KEY,
  openRouterOpenAIKey: OPENROUTER_OPENAI_KEY,
});

export default apiService;
export { APIService, MODEL_CONFIG }; 