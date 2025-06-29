# PromptForge

A powerful prompt engineering and testing platform with visual prompt chaining capabilities.

## Features

### 🎯 **Real API Integration**
- **OpenAI Models**: Direct integration with GPT-4 and GPT-3.5-turbo using OpenAI API
- **Groq Models**: Fast inference with Gemma, Llama, and other models via Groq API
- **OpenRouter Models**: Access to 100+ models from various providers
- **Real Token Usage**: Accurate token counting and cost tracking

### 🤖 **AI-Powered Scoring**
- **GPT-4 Evaluation**: Uses GPT-4 as the system LLM to evaluate prompt responses
- **Consistent Algorithm**: Same evaluation criteria applied to all responses
- **Multi-dimensional Scoring**: Relevance, Clarity, and Creativity metrics
- **Detailed Critiques**: Constructive feedback for prompt improvement

### 🔧 **Advanced Controls**
- **Temperature Control**: Adjustable creativity levels (0-2) with visual slider
- **System Messages**: Custom system prompts for consistent behavior
- **Variable Management**: Dynamic content with {{variable}} syntax
- **Conditional Logic**: Branching workflows based on response scores

### 📊 **Visual Prompt Chaining**
- **Canvas Interface**: Drag-and-drop prompt workflow builder
- **Live Visualization**: Real-time execution tracking
- **Conditional Branches**: If/then logic based on response quality
- **Export Options**: Generate code for LangChain, OpenAI SDK, and more

### 📈 **Analytics & Comparison**
- **Version Control**: Track prompt evolution over time
- **Multi-Model Testing**: Compare responses across different AI models
- **Performance Metrics**: Execution time and token usage statistics
- **Score Tracking**: Historical performance analysis

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Open http://localhost:5173 (or the port shown in terminal)
   - Start with the Editor tab for basic prompt testing
   - Use the Canvas tab for visual prompt chaining

## API Configuration

The application uses the following API keys (configured in `src/services/apiService.ts`):

- **OpenAI API**: For GPT-4 and GPT-3.5-turbo models
- **Groq API**: For fast inference models
- **OpenRouter API**: For access to 100+ models

⚠️ **Security Note**: In production, these API keys should be stored securely on the backend.

## Usage

### Basic Prompt Testing
1. Navigate to the **Editor** tab
2. Enter your prompt in the main text area
3. Select models to test from the Multi-Model Runner
4. Click "Run Selected" to execute
5. View responses, scores, and token usage

### Visual Prompt Chaining
1. Navigate to the **Canvas** tab
2. Add prompt nodes by clicking "Add Node"
3. Configure each node with prompts, models, and temperature
4. Connect nodes to create workflows
5. Add conditional logic based on response scores
6. Run the entire chain to see the flow in action

### Advanced Features
- **Variables**: Use `{{variable_name}}` in prompts for dynamic content
- **System Messages**: Set consistent behavior across all models
- **Temperature**: Adjust creativity from focused (0) to creative (2)
- **Conditions**: Use `{{score}} > 7` for conditional branching

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: React hooks and local state
- **API Integration**: Custom service layer for multiple providers
- **Visual Flow**: ReactFlow for canvas functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
