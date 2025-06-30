// Script to check OpenRouter balance
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const OPENROUTER_API_KEY = process.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_OPENAI_KEY = process.env.VITE_OPENROUTER_OPENAI_KEY;

async function checkBalance(apiKey, keyName) {
  if (!apiKey) {
    console.log(`❌ ${keyName}: No API key found`);
    return;
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ ${keyName}: Error ${response.status} - ${errorText}`);
      return;
    }

    const data = await response.json();
    
    console.log(`\n✅ ${keyName}:`);
    console.log(`   Key: ${apiKey.substring(0, 10)}...`);
    
    // OpenRouter API response structure
    if (data.data) {
      const keyData = data.data;
      console.log(`   Balance: $${keyData.credits || 'N/A'}`);
      console.log(`   Usage: $${keyData.usage || 'N/A'}`);
      
      if (keyData.credits && keyData.usage) {
        const remaining = keyData.credits - keyData.usage;
        console.log(`   Remaining: $${remaining.toFixed(4)}`);
        const percentage = ((remaining / keyData.credits) * 100).toFixed(1);
        console.log(`   Usage Percentage: ${percentage}% remaining`);
      }
    } else {
      console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    }

  } catch (error) {
    console.log(`❌ ${keyName}: Error - ${error.message}`);
  }
}

async function main() {
  console.log('🔍 Checking OpenRouter API Key Balances...\n');
  
  await checkBalance(OPENROUTER_API_KEY, 'Original OpenRouter Key');
  await checkBalance(OPENROUTER_OPENAI_KEY, 'OpenRouter OpenAI Key');
  
  console.log('\n📊 Summary:');
  console.log('- Original Key: Used for non-OpenAI models (Llama, Mistral, etc.)');
  console.log('- OpenAI Key: Used for GPT-4 and GPT-3.5-turbo models');
}

main().catch(console.error); 