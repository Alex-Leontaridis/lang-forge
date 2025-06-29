# API Integration Documentation

## Overview
This document describes the integration of multiple AI models into the PromptForge application using Groq and OpenRouter APIs.

## Current Status ✅
- **19 models** are connected to real APIs (8 Groq + 11 OpenRouter)
- **4 models** use mock responses (GPT-4, GPT-3.5, Claude 3, Gemini Pro)
- **API keys** are configured and ready to use
- **Variable auto-detection** is working properly
- **Prompt editor** is fully functional

## API Keys Configuration

### Groq API Key
```
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
```

### OpenRouter API Key
```
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
```

## Model Configuration

### Groq Models (8 models)
| Model ID | Display Name | Description |
|----------|--------------|-------------|
| `gemma2-9b-it` | Gemma 2 9B IT | Google Gemma 2 9B IT |
| `llama-3.1-8b-instant` | Llama 3.1 8B Instant | Meta Llama 3.1 8B Instant |
| `llama-3.3-70b-versatile` | Llama 3.3 70B Versatile | Meta Llama 3.3 70B Versatile |
| `meta-llama/llama-guard-4-12b` | Llama Guard 4 12B | Meta Llama Guard 4 12B |
| `whisper-large-v3` | Whisper Large v3 | OpenAI Whisper Large v3 |
| `whisper-large-v3-turbo` | Whisper Large v3 Turbo | OpenAI Whisper Large v3 Turbo |
| `distil-whisper-large-v3-en` | Distil Whisper Large v3 EN | Hugging Face Distil Whisper Large v3 EN |
| `qwen/qwen3-32b` | Qwen 3 32B | Alibaba Qwen 3 32B |

### OpenRouter Models (11 models)
| Model ID | Display Name | Description |
|----------|--------------|-------------|
| `qwen-qwq-32b` | Qwen QWQ 32B | Alibaba Qwen QWQ 32B |
| `google/gemini-2.5-pro-exp-03-25` | Gemini 2.5 Pro Exp | Google Gemini 2.5 Pro Exp |
| `google/gemini-2.0-flash-exp:free` | Gemini 2.0 Flash Exp | Google Gemini 2.0 Flash Exp |
| `google/gemma-3-12b-it:free` | Gemma 3 12B IT | Google Gemma 3 12B IT |
| `deepseek-r1-distill-llama-70b` | DeepSeek R1 Distill Llama 70B | DeepSeek R1 Distill Llama 70B |
| `deepseek/deepseek-r1-0528:free` | DeepSeek R1 0528 | DeepSeek R1 0528 |
| `deepseek/deepseek-r1-0528-qwen3-8b:free` | DeepSeek R1 0528 Qwen3 8B | DeepSeek R1 0528 Qwen3 8B |
| `deepseek/deepseek-v3-base:free` | DeepSeek V3 Base | DeepSeek V3 Base |
| `nvidia/llama-3.3-nemotron-super-49b-v1:free` | Llama 3.3 Nemotron Super 49B | Nvidia Llama 3.3 Nemotron Super 49B |
| `mistralai/mistral-small-3.2-24b-instruct:free` | Mistral Small 3.2 24B Instruct | Mistral Small 3.2 24B Instruct |
| `minimax/minimax-m1` | MiniMax M1 | MiniMax M1 |

### Mock Models (4 models)
| Model ID | Display Name | Description |
|----------|--------------|-------------|
| `gpt-4` | GPT-4 | OpenAI GPT-4 (Mock) |
| `gpt-3.5-turbo` | GPT-3.5 Turbo | OpenAI GPT-3.5 Turbo (Mock) |
| `claude-3` | Claude 3 | Anthropic Claude 3 (Mock) |
| `gemini-pro` | Gemini Pro | Google Gemini Pro (Mock) |

## Features

### ✅ Variable Auto-Detection
- Automatically detects variables in prompts using `{{variable}}` syntax
- Variables are automatically added to the Variable Manager
- Real-time preview with variable values replaced
- Support for multiple variables in a single prompt

### ✅ Prompt Editor
- Full text editing capabilities
- Variable syntax highlighting
- Real-time character count
- Preview mode with variables replaced
- Example variable suggestions

### ✅ API Integration
- Real API calls for 19 models
- Token usage tracking
- Error handling and fallback
- Response time measurement
- System message support

### ✅ Multi-Model Execution
- Run multiple models simultaneously
- Compare outputs across models
- Individual model selection
- Batch processing capabilities

## Usage Instructions

### 1. Writing Prompts with Variables
1. Open the Prompt Editor
2. Write your prompt using `{{variable}}` syntax
3. Variables are automatically detected and added to the Variable Manager
4. Set values for variables in the Variable Manager
5. Preview your prompt with variables replaced

### 2. Running Models
1. Select one or more models from the Multi-Model Runner
2. Click "Run Selected Models"
3. For real API models, you'll get actual AI responses
4. For mock models, you'll get simulated responses
5. View results, scores, and token usage

### 3. Testing API Integration
1. Start the development server: `npm run dev`
2. Navigate to the Editor tab
3. Write a prompt with variables: `Hello {{name}}, how are you today?`
4. Set the variable value in the Variable Manager
5. Select a real API model (e.g., `gemma2-9b-it`)
6. Click "Run" to test the API integration

## Error Handling

### API Errors
- Network errors are caught and displayed
- Rate limiting is handled gracefully
- Invalid API keys show appropriate error messages
- Fallback to mock responses for unsupported models

### Variable Errors
- Invalid variable syntax is ignored
- Missing variable values are left as placeholders
- Duplicate variables are handled automatically

## Security Notes

⚠️ **Important**: The API keys are currently hardcoded in the frontend for demonstration purposes. In a production environment:

1. **Never expose API keys in frontend code**
2. **Use environment variables** for API keys
3. **Implement proper backend authentication**
4. **Add rate limiting and usage monitoring**
5. **Use secure API key management services**

## Recent Fixes

### ✅ Fixed Issues
1. **Prompt Editor**: Users can now write in the prompt editor (fixed `handlePromptChange` function)
2. **Variable Detection**: Variables are automatically detected and added to the Variable Manager
3. **JSX Syntax**: Fixed unescaped `>` character in PromptNodeComponent
4. **API Keys**: Updated with the provided Groq and OpenRouter keys

### 🔧 Technical Improvements
- Improved variable detection logic in PromptEditor
- Enhanced error handling in API service
- Better state management for prompt updates
- Optimized variable change detection

## Testing

To test the integration:

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test variable detection**:
   - Write a prompt with variables like `Hello {{name}}, tell me about {{topic}}`
   - Check that variables appear in the Variable Manager

3. **Test API calls**:
   - Select a real API model (e.g., `gemma2-9b-it`)
   - Run the prompt and verify you get a real response

4. **Test error handling**:
   - Try invalid prompts or network issues
   - Verify error messages are displayed properly

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify API keys are correctly configured
3. Test with different models to isolate issues
4. Check network connectivity for API calls 