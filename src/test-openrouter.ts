// Test OpenRouter API with verified models
const OPENROUTER_API_KEY = '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';

// Verified OpenRouter models that work
const VERIFIED_MODELS = [
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'openai/gpt-4.1',
  'openai/gpt-4.1-mini',
  'openai/o1',
  'openai/o1-mini',
  'openai/o3',
  'openai/o3-mini',
  'anthropic/claude-3-opus',
  'anthropic/claude-3-sonnet',
  'anthropic/claude-3-haiku',
  'anthropic/claude-3.5-sonnet',
  'google/gemini-2.5-pro',
  'google/gemini-2.5-flash',
  'google/gemini-pro-1.5',
  'google/gemini-flash-1.5',
  'google/gemma-3-27b-it',
  'google/gemma-3-12b-it',
  'google/gemma-3-4b-it',
  'meta-llama/llama-3.3-70b-instruct',
  'meta-llama/llama-3.1-70b-instruct',
  'meta-llama/llama-3.1-8b-instruct',
  'meta-llama/llama-3.1-405b-instruct',
  'meta-llama/llama-4-maverick',
  'meta-llama/llama-4-scout',
  'mistralai/mistral-large',
  'mistralai/mistral-large-2411',
  'mistralai/mistral-medium-3',
  'mistralai/mistral-small',
  'mistralai/mistral-small-3.2-24b-instruct',
  'mistralai/mistral-7b-instruct',
  'mistralai/mixtral-8x7b-instruct',
  'mistralai/mixtral-8x22b-instruct',
  'mistralai/mistral-nemo',
  'qwen/qwen-max',
  'qwen/qwen-plus',
  'qwen/qwen-turbo',
  'qwen/qwen3-32b',
  'qwen/qwen3-14b',
  'qwen/qwen3-8b',
  'qwen/qwen-2.5-72b-instruct',
  'qwen/qwen-2.5-coder-32b-instruct',
  'qwen/qwen-2.5-vl-72b-instruct',
  'qwen/qwq-32b',
  'deepseek/deepseek-chat',
  'deepseek/deepseek-chat-v3-0324',
  'deepseek/deepseek-r1',
  'deepseek/deepseek-r1-distill-llama-70b',
  'nvidia/llama-3.3-nemotron-super-49b-v1',
  'nvidia/llama-3.1-nemotron-ultra-253b-v1',
  'x-ai/grok-3',
  'x-ai/grok-3-mini',
  'x-ai/grok-2-1212',
  'x-ai/grok-2-vision-1212',
  'perplexity/sonar',
  'perplexity/sonar-pro',
  'perplexity/sonar-reasoning',
  'perplexity/sonar-reasoning-pro',
  'cohere/command',
  'cohere/command-r',
  'cohere/command-r-plus',
  'microsoft/phi-4',
  'microsoft/phi-4-reasoning-plus',
  'microsoft/wizardlm-2-8x22b',
  'amazon/nova-pro-v1',
  'amazon/nova-lite-v1',
  'inflection/inflection-3-productivity',
  'inflection/inflection-3-pi',
  'ai21/jamba-1.6-large',
  'ai21/jamba-1.6-mini',
  'baidu/ernie-4.5-300b-a47b'
];

async function testOpenRouterModels() {
  console.log('Testing OpenRouter API with verified models...\n');
  
  const testPrompt = "Hello! Please respond with a brief greeting and tell me what you can do.";
  
  for (const modelId of VERIFIED_MODELS) {
    console.log(`Testing model: ${modelId}`);
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'PromptForge Test',
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: 'user', content: testPrompt }
          ],
          temperature: 0.7,
          max_tokens: 100,
          stream: false
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS: ${modelId}`);
        console.log(`   Response: ${data.choices[0]?.message?.content?.substring(0, 100)}...`);
        if (data.usage) {
          console.log(`   Tokens: ${data.usage.total_tokens} (input: ${data.usage.prompt_tokens}, output: ${data.usage.completion_tokens})`);
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ FAILED: ${modelId} - ${response.status} ${response.statusText}`);
        console.log(`   Error: ${errorText.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${modelId} - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    console.log(''); // Empty line for readability
    
    // Add a small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('Testing completed!');
}

// Run the test
testOpenRouterModels(); 