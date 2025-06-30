// Test file to verify model selection functionality
import apiService from './services/apiService';

const testModels = [
  'gpt-4',
  'gpt-3.5-turbo',
  'meta/llama-3.3-70b-instruct',
  'qwen2.5-coder-32b-instruct',
  'meta/llama-3.2-11b-vision-instruct',
  'meta/llama-3.2-1b-instruct',
  'qwen2.5-72b-instruct',
  'meta/llama-3.1-8b-instruct',
  'mistral/mistral-nemo',
  'google/gemma-2-9b',
  'mistral/mistral-7b-instruct',
  'mistralai/mistral-small-3',
  'google/gemini-2.0-flash-experimental',
  'cognitivecomputations/dolphin-3.0-mistral-24b',
  'qwen/qwen2.5-vl-72b-instruct',
  'deepseek/deepseek-r1-distill-qwen-14b',
  'deepseek/deepseek-r1-distill-llama-70b',
  'deepseek/deepseek-r1',
  'deepseek/deepseek-v3',
  'gemma2-9b-it',
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
  'deepseek-r1-distill-llama-70b',
  'llama-4-maverick-17b-128e-instruct',
  'llama-4-scout-17b-16e-instruct',
  'mistral-saba-24b',
  'qwen-qwq-32b',
  'qwen3-32b'
];

async function testModelSelection() {
  console.log('Testing model selection functionality...');
  
  const testPrompt = 'Write a short poem about artificial intelligence.';
  
  for (const model of testModels) {
    try {
      console.log(`\nTesting model: ${model}`);
      
      const result = await apiService.generateCompletion(
        model,
        testPrompt,
        undefined,
        0.7,
        500
      );
      
      console.log(`✅ ${model} - Success`);
      console.log(`Response: ${result.content.substring(0, 100)}...`);
      console.log(`Token usage: ${result.usage?.total_tokens || 'N/A'}`);
      
    } catch (error) {
      console.log(`❌ ${model} - Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  console.log('\nModel selection test completed!');
}

// Test model data structure
function testModelData() {
  console.log('Testing model data structure...');
  
  const models = [
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct' },
    { id: 'qwen2.5-coder-32b-instruct', name: 'Qwen2.5 Coder 32B Instruct' },
    { id: 'meta/llama-3.2-11b-vision-instruct', name: 'Llama 3.2 11B Vision Instruct' },
    { id: 'meta/llama-3.2-1b-instruct', name: 'Llama 3.2 1B Instruct' },
    { id: 'qwen2.5-72b-instruct', name: 'Qwen2.5 72B Instruct' },
    { id: 'meta/llama-3.1-8b-instruct', name: 'Llama 3.1 8B Instruct' },
    { id: 'mistral/mistral-nemo', name: 'Mistral Nemo' },
    { id: 'google/gemma-2-9b', name: 'Gemma 2 9B' },
    { id: 'mistral/mistral-7b-instruct', name: 'Mistral 7B Instruct' },
    { id: 'mistralai/mistral-small-3', name: 'Mistral Small 3' },
    { id: 'google/gemini-2.0-flash-experimental', name: 'Gemini 2.0 Flash Experimental' },
    { id: 'cognitivecomputations/dolphin-3.0-mistral-24b', name: 'Dolphin 3.0 Mistral 24B' },
    { id: 'qwen/qwen2.5-vl-72b-instruct', name: 'Qwen 2.5 VL 72B Instruct' },
    { id: 'deepseek/deepseek-r1-distill-qwen-14b', name: 'DeepSeek R1 Distill Qwen 14B' },
    { id: 'deepseek/deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill Llama 70B' },
    { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1' },
    { id: 'deepseek/deepseek-v3', name: 'DeepSeek V3' },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile' },
    { id: 'llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick 17B 128E Instruct' },
    { id: 'llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B 16E Instruct' },
    { id: 'mistral-saba-24b', name: 'Mistral Saba 24B' },
    { id: 'qwen-qwq-32b', name: 'Qwen QWQ 32B' },
    { id: 'qwen3-32b', name: 'Qwen3 32B' },
  ];
  
  console.log('Available models:');
  models.forEach(model => {
    console.log(`- ${model.name} - ${model.id}`);
  });
  
  console.log('\nModel data structure test completed!');
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).testModelSelection = testModelSelection;
  (window as any).testModelData = testModelData;
} else {
  // Node.js environment
  testModelData();
  // testModelSelection(); // Uncomment to test actual API calls
}

export { testModelSelection, testModelData }; 