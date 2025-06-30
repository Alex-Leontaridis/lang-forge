# Model Selection Feature

## Overview

The model selection feature allows users to choose from a variety of AI models for each prompt node in their chain. This provides flexibility to use different models for different tasks based on their strengths and capabilities.

## Available Models

The system includes models from multiple providers:

### OpenAI
- **GPT-4** - Advanced language model for complex reasoning
- **GPT-3.5** - Fast and cost-effective for general tasks
- **Whisper Large v3** - Speech-to-text transcription
- **Whisper Large v3 Turbo** - Fast speech-to-text transcription

### Google
- **Gemini 2.5 Pro Exp** - Advanced multimodal model
- **Gemini 2.0 Flash Exp** - Fast and efficient model
- **Gemma 2 9B IT** - Instruction-tuned model
- **Gemma 3 12B IT** - Larger instruction-tuned model

### Meta
- **Llama 3.1 8B Instant** - Fast inference model
- **Llama 3.3 70B Versatile** - High-capability model
- **Llama Guard 4 12B** - Safety-focused model

### DeepSeek
- **DeepSeek R1 0528** - Advanced reasoning model
- **DeepSeek R1 0528 Qwen3 8B** - Hybrid model
- **DeepSeek V3 Base** - Base model for fine-tuning
- **DeepSeek R1 Distill Llama 70B** - Distilled model

### Other Providers
- **Qwen QWQ 32B** (Alibaba) - Large language model
- **Qwen 3 32B** (Alibaba) - Advanced language model
- **Distil Whisper Large v3 EN** (Hugging Face) - Distilled speech model
- **Llama 3.3 Nemotron Super 49B** (NVIDIA) - High-performance model
- **Mistral Small 3.2 24B Instruct** (Mistral) - Instruction-tuned model
- **MiniMax M1** (MiniMax) - Multimodal model

## How to Use

### Selecting a Model

1. **Navigate to the Prompt Chain Canvas** (`/canvas`)
2. **Add a prompt node** or select an existing one
3. **Click the dropdown** in the node header (shows current model)
4. **Select a model** from the list
5. **Run the node** to test with the selected model

### Features

- **Simple native HTML select** - Clean and familiar interface
- **All model names** - Easy to browse through available options
- **Immediate selection** - No complex interactions required
- **Responsive design** - Works well in the node interface

## Technical Implementation

### Model Data Structure

Each model is defined with:
```typescript
{
  id: string;           // Unique model identifier
  name: string;         // Display name
}
```

### State Management

- Model selection is stored in the node's data
- Changes are propagated through the `onUpdate` callback
- Simple onChange handler updates the model immediately

### Error Handling

- Invalid model IDs default to the first available model
- API errors are handled gracefully with user feedback

## Best Practices

1. **Choose appropriate models** for specific tasks
2. **Consider cost and speed** when selecting models
3. **Test different models** to find the best fit
4. **Use specialized models** for specific domains (e.g., Whisper for speech)
5. **Monitor performance** and adjust model selection as needed

## Future Enhancements

- Model performance metrics
- Cost estimation per model
- Model comparison tools
- Custom model integration
- Model-specific parameter optimization 