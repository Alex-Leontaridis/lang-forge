// OpenRouter API Service
export async function callOpenRouterAPI(
  model: string,
  prompt: string,
  systemMessage?: string,
  temperature: number = 0.7,
  maxTokens: number = 1000
) {
  // Use specific key for GPT-4 models, otherwise use general OpenRouter key
  let apiKey: string;
  
  if (model.startsWith('gpt-4')) {
    apiKey = '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';
  } else {
    apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  }
  
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const messages = [];
  if (systemMessage) {
    messages.push({ role: 'system', content: systemMessage });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'PromptForge',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0]?.message?.content || '',
    usage: data.usage || null
  };
}
