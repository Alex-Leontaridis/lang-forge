// Test file to verify API integration
import apiService from './services/apiService';

async function testAPI() {
  console.log('Testing API integration...');
  
  try {
    // Test GPT-3.5-turbo
    console.log('Testing GPT-3.5-turbo...');
    const result1 = await apiService.generateCompletion(
      'gpt-3.5-turbo',
      'Hello, how are you?',
      undefined,
      0.7
    );
    console.log('GPT-3.5-turbo response:', result1.content);
    console.log('Token usage:', result1.usage);
    
    // Test GPT-4
    console.log('\nTesting GPT-4...');
    const result2 = await apiService.generateCompletion(
      'gpt-4',
      'Explain quantum computing in simple terms.',
      undefined,
      0.7
    );
    console.log('GPT-4 response:', result2.content);
    console.log('Token usage:', result2.usage);
    
    // Test scoring
    console.log('\nTesting scoring...');
    const score = await apiService.evaluatePromptResponse(
      'Explain quantum computing in simple terms.',
      result2.content,
      0.3
    );
    console.log('Score:', score);
    
    console.log('\nAPI test completed successfully!');
  } catch (error) {
    console.error('API test failed:', error);
  }
}

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).testAPI = testAPI;
} else {
  // Node.js environment
  testAPI();
}

export default testAPI; 