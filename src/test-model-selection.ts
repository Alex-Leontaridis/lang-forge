// Test file to verify model selection functionality
import apiService from './services/apiService';

const testModels = [
  'gpt-4',
  'gpt-3.5-turbo',
  'gemma2-9b-it',
  'google/gemini-2.5-pro-exp-03-25',
  'llama-3.1-8b-instant',
  'deepseek/deepseek-r1-0528:free',
  'minimax/minimax-m1'
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
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5' },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
    { id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek R1 0528' },
    { id: 'minimax/minimax-m1', name: 'MiniMax M1' },
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