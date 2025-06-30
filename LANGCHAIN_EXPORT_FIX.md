# LangChain Export Fix

## Problem
The LangChain export functionality was using `ChatOpenAI` for all models, which caused errors when exporting prompts that used non-OpenAI models like:
- Groq models (e.g., `llama-3.3-70b-versatile`)
- OpenRouter models (e.g., `meta-llama/llama-3.3-70b-instruct`)

The error message was:
```
ChatOpenAI is meant for OpenAI models.
You're using: model_name="llama-3.3-70b-versatile"
But ChatOpenAI only supports OpenAI-compatible models.
```

## Solution
Added helper functions to determine the correct LangChain chat model class based on the model name:

### Model Mapping
- **OpenAI models** (gpt-*) → `ChatOpenAI`
- **Groq models** → `ChatGroq` 
- **OpenRouter models** (containing `/`) → `ChatOpenRouter`
- **Unknown models** → `ChatOpenAI` (fallback)

### Files Modified

#### 1. `src/components/PromptChainCanvas.tsx`
- Added `getLangChainChatModel()` function for Python exports
- Added `getLangChainChatModelJS()` function for JavaScript exports
- Updated `exportToLangChainPython()` to use appropriate chat model classes
- Updated `exportToLangChainJS()` to use appropriate chat model classes
- Added dynamic import collection to avoid duplicate imports

#### 2. `src/components/PromptEditor.tsx`
- Added `getLangChainChatModelPython()` function
- Added `getLangChainChatModelJS()` function  
- Updated `exportToLangChainPython()` to use appropriate chat model classes
- Updated `exportToLangChainJS()` to use appropriate chat model classes

### Example Output

#### Before (Incorrect)
```python
from langchain.chat_models import ChatOpenAI

llm = ChatOpenAI(
    model_name="llama-3.3-70b-versatile",  # ❌ Wrong for Groq model
    temperature=0.7
)
```

#### After (Correct)
```python
from langchain_groq import ChatGroq

llm = ChatGroq(
    model_name="llama-3.3-70b-versatile",  # ✅ Correct for Groq model
    temperature=0.7
)
```

### Supported Models

#### OpenAI Models (ChatOpenAI)
- `gpt-4`
- `gpt-3.5-turbo`

#### Groq Models (ChatGroq)
- `gemma2-9b-it`
- `llama-3.1-8b-instant`
- `llama-3.3-70b-versatile`
- `deepseek-r1-distill-llama-70b`
- `llama-4-maverick-17b-128e-instruct`
- `llama-4-scout-17b-16e-instruct`
- `mistral-saba-24b`
- `qwen-qwq-32b`
- `qwen3-32b`

#### OpenRouter Models (ChatOpenRouter)
- `meta-llama/llama-3.3-70b-instruct`
- `qwen/qwen-2.5-coder-32b-instruct`
- `meta-llama/llama-3.2-11b-vision-instruct`
- `meta-llama/llama-3.2-1b-instruct`
- `qwen/qwen-2.5-72b-instruct`
- `meta-llama/llama-3.1-8b-instruct`
- `mistralai/mistral-nemo`
- `google/gemma-2-9b-it`
- `mistralai/mistral-7b-instruct`

## Testing
The fix has been tested with:
- TypeScript compilation (no errors)
- Development server (runs successfully)
- All model types (OpenAI, Groq, OpenRouter)

## Result
Users can now export prompts to LangChain Python/JavaScript code regardless of which model they're using, and the generated code will use the correct chat model class for each provider. 