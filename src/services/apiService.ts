// API Service for PromptForge
// Handles calls to OpenAI, Groq and OpenRouter APIs

interface APIConfig {
  openaiApiKey: string;
  groqApiKey: string;
  openRouterApiKey: string;
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
  // OpenAI models (using direct OpenAI API)
  'gpt-4': { provider: 'openai', modelId: 'gpt-4' },
  'gpt-3.5-turbo': { provider: 'openai', modelId: 'gpt-3.5-turbo' },
  
  // Groq models
  'gemma2-9b-it': { provider: 'groq', modelId: 'gemma2-9b-it' },
  'llama-3.1-8b-instant': { provider: 'groq', modelId: 'llama-3.1-8b-instant' },
  'llama-3.3-70b-versatile': { provider: 'groq', modelId: 'llama-3.3-70b-versatile' },
  'meta-llama/llama-guard-4-12b': { provider: 'groq', modelId: 'meta-llama/llama-guard-4-12b' },
  'whisper-large-v3': { provider: 'groq', modelId: 'whisper-large-v3' },
  'whisper-large-v3-turbo': { provider: 'groq', modelId: 'whisper-large-v3-turbo' },
  'distil-whisper-large-v3-en': { provider: 'groq', modelId: 'distil-whisper-large-v3-en' },
  'qwen/qwen3-32b': { provider: 'groq', modelId: 'qwen/qwen3-32b' },
  
  // OpenRouter models
  'qwen-qwq-32b': { provider: 'openrouter', modelId: 'alibaba/qwen-qwq-32b' },
  'google/gemini-2.5-pro-exp-03-25': { provider: 'openrouter', modelId: 'google/gemini-2.5-pro-exp-03-25' },
  'google/gemini-2.0-flash-exp:free': { provider: 'openrouter', modelId: 'google/gemini-2.0-flash-exp:free' },
  'google/gemma-3-12b-it:free': { provider: 'openrouter', modelId: 'google/gemma-3-12b-it:free' },
  'deepseek-r1-distill-llama-70b': { provider: 'openrouter', modelId: 'deepseek-r1-distill-llama-70b' },
  'deepseek/deepseek-r1-0528:free': { provider: 'openrouter', modelId: 'deepseek/deepseek-r1-0528:free' },
  'deepseek/deepseek-r1-0528-qwen3-8b:free': { provider: 'openrouter', modelId: 'deepseek/deepseek-r1-0528-qwen3-8b:free' },
  'deepseek/deepseek-v3-base:free': { provider: 'openrouter', modelId: 'deepseek/deepseek-v3-base:free' },
  'nvidia/llama-3.3-nemotron-super-49b-v1:free': { provider: 'openrouter', modelId: 'nvidia/llama-3.3-nemotron-super-49b-v1:free' },
  'mistralai/mistral-small-3.2-24b-instruct:free': { provider: 'openrouter', modelId: 'mistralai/mistral-small-3.2-24b-instruct:free' },
  'minimax/minimax-m1': { provider: 'openrouter', modelId: 'minimax/minimax-m1' },
  
  // Default to OpenRouter for other models
  'default': { provider: 'openrouter', modelId: 'openai/gpt-4' }
};

// API Keys - In production, these should be stored securely on the backend
const OPENAI_API_KEY = 'sk-proj-yLhnoBJKOYaAYK4LOMqHT3BlbkFJLAto2uubebwFHilfUAPM';
const GROQ_API_KEY = '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';
const OPENROUTER_API_KEY = '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';

class APIService {
  private config: APIConfig;

  constructor(config: APIConfig) {
    this.config = config;
  }

  private getModelConfig(modelId: string) {
    return MODEL_CONFIG[modelId as keyof typeof MODEL_CONFIG] || MODEL_CONFIG.default;
  }

  private async callOpenAIAPI(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async callGroqAPI(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async callOpenRouterAPI(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'PromptForge',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
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

      if (modelConfig.provider === 'openai') {
        response = await this.callOpenAIAPI(request);
      } else if (modelConfig.provider === 'groq') {
        response = await this.callGroqAPI(request);
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
  openaiApiKey: OPENAI_API_KEY,
  groqApiKey: GROQ_API_KEY,
  openRouterApiKey: OPENROUTER_API_KEY,
});

export default apiService;
export { APIService, MODEL_CONFIG }; 