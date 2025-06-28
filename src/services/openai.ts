import OpenAI from 'openai';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ModelResponse {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  executionTime: number;
}

export interface PromptEvaluation {
  relevance: number;
  clarity: number;
  creativity: number;
  critique: string;
}

export class OpenAIService {
  private static client: OpenAI | null = null;

  static initialize(apiKey: string): void {
    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
    });
  }

  private static getClient(): OpenAI {
    if (!this.client) {
      // Try to get API key from window global or environment
      const apiKey = (window as any).__OPENAI_API_KEY__ || import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI client not initialized. Please set up your API key first.');
      }
      this.initialize(apiKey);
    }
    return this.client!;
  }

  static async runPrompt(
    prompt: string,
    model: string = 'gpt-3.5-turbo',
    systemMessage?: string
  ): Promise<ModelResponse> {
    const startTime = Date.now();
    
    try {
      const client = this.getClient();
      const messages: ChatMessage[] = [];
      
      if (systemMessage) {
        messages.push({ role: 'system', content: systemMessage });
      }
      
      messages.push({ role: 'user', content: prompt });

      const response = await client.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const executionTime = Date.now() - startTime;
      const choice = response.choices[0];
      
      if (!choice?.message?.content) {
        throw new Error('No response content received from OpenAI');
      }

      return {
        content: choice.message.content,
        usage: {
          prompt_tokens: response.usage?.prompt_tokens || 0,
          completion_tokens: response.usage?.completion_tokens || 0,
          total_tokens: response.usage?.total_tokens || 0,
        },
        model: response.model,
        executionTime,
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`Failed to run prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async evaluatePrompt(
    originalPrompt: string,
    aiOutput: string
  ): Promise<PromptEvaluation> {
    const evaluationPrompt = `You are an expert prompt engineer. Given the following prompt and its AI-generated output, score it from 1 to 10 in the following categories: Relevance, Clarity, Creativity. Then provide a 1-2 sentence critique.

Prompt: ${originalPrompt}
Output: ${aiOutput}

Respond in this JSON format:
{
  "relevance": 9,
  "clarity": 8,
  "creativity": 7,
  "critique": "Clear structure, but lacks originality."
}`;

    try {
      const client = this.getClient();
      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'user', content: evaluationPrompt }
        ],
        temperature: 0.3,
        max_tokens: 300,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No evaluation response received');
      }

      // Parse JSON response
      const evaluation = JSON.parse(content) as PromptEvaluation;
      
      // Validate the response structure
      if (
        typeof evaluation.relevance !== 'number' ||
        typeof evaluation.clarity !== 'number' ||
        typeof evaluation.creativity !== 'number' ||
        typeof evaluation.critique !== 'string'
      ) {
        throw new Error('Invalid evaluation response format');
      }

      return evaluation;
    } catch (error) {
      console.error('Evaluation Error:', error);
      // Return fallback evaluation
      return {
        relevance: 7,
        clarity: 7,
        creativity: 7,
        critique: 'Unable to evaluate prompt automatically. Please check your OpenAI API configuration.'
      };
    }
  }

  static async runMultipleModels(
    prompt: string,
    models: string[],
    systemMessage?: string
  ): Promise<Record<string, ModelResponse>> {
    const results: Record<string, ModelResponse> = {};
    
    // Run models in parallel for better performance
    const promises = models.map(async (model) => {
      try {
        const response = await this.runPrompt(prompt, model, systemMessage);
        return { model, response };
      } catch (error) {
        console.error(`Error running model ${model}:`, error);
        return {
          model,
          response: {
            content: `Error: Failed to run ${model}. ${error instanceof Error ? error.message : 'Unknown error'}`,
            usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
            model,
            executionTime: 0,
          }
        };
      }
    });

    const responses = await Promise.all(promises);
    
    responses.forEach(({ model, response }) => {
      results[model] = response;
    });

    return results;
  }

  static isConfigured(): boolean {
    return !!((window as any).__OPENAI_API_KEY__ || import.meta.env.VITE_OPENAI_API_KEY);
  }
}