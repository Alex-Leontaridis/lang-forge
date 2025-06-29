# PromptForge

A powerful prompt engineering and testing platform with advanced version control, analytics, and multi-model comparison capabilities.

## 🚀 Features

### ✨ Core Functionality
- **Advanced Prompt Editor** with syntax highlighting and variable support
- **Multi-Model Testing** across 20+ AI models (OpenAI, Groq, OpenRouter)
- **Real-time Prompt Scoring** with relevance, clarity, and creativity metrics
- **Variable Management** with dynamic prompt templating

### 🔄 Version Control System (100% Functional)
- **Complete Version History** with persistent storage
- **Version Comparison** with side-by-side analysis
- **Version Management** with create, duplicate, and delete operations
- **Branching Support** with parent-child relationships
- **Search & Filter** capabilities for large version sets
- **Local Storage Persistence** - your work is automatically saved

### 📊 Analytics Dashboard (Fully Working)
- **Performance Metrics** across all versions and models
- **Score Trends** over time with detailed breakdowns
- **Model Comparison** charts and statistics
- **Execution Time Analysis** for optimization
- **Token Usage Tracking** for cost management
- **Failure Rate Monitoring** for quality assurance
- **Interactive Charts** using Recharts library

### 🎯 Advanced Features
- **Prompt Chain Canvas** for complex workflows
- **System Message Support** for context setting
- **Real-time API Integration** with multiple providers
- **Responsive Design** for desktop and mobile
- **Export & Import** capabilities (coming soon)

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Hooks + Local Storage
- **APIs**: OpenAI, Groq, OpenRouter

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd prompt-forge

# Install dependencies
npm install

# Start development server
npm run dev
```

### API Configuration

The application comes pre-configured with API keys for demonstration. For production use, update the keys in `src/services/apiService.ts`:

```typescript
const OPENAI_API_KEY = 'your-openai-key';
const GROQ_API_KEY = 'your-groq-key';
const OPENROUTER_API_KEY = 'your-openrouter-key';
```

## 📖 Usage Guide

### Creating and Managing Versions

1. **Create a New Version**
   - Click "Create New Version" in the Version History panel
   - Enter a title and optional commit message
   - The new version will be created with current prompt and variables

2. **Version Comparison**
   - Select multiple versions using the checkboxes
   - View side-by-side comparison with scores and metrics
   - Analyze performance differences between versions

3. **Version Actions**
   - **Duplicate**: Create a copy of any version
   - **Delete**: Remove versions (prevents deletion of last version)
   - **Search**: Filter versions by title or message

### Using the Analytics Dashboard

1. **Navigate to Analytics Tab**
   - View comprehensive metrics across all versions
   - Analyze performance trends over time
   - Compare model performance

2. **Key Metrics**
   - **Total Versions**: Number of prompt versions created
   - **Total Runs**: Number of model executions
   - **Avg Response Time**: Average execution time across all runs
   - **Total Tokens**: Cumulative token usage for cost tracking

3. **Charts Available**
   - **PromptScore Over Time**: Track score improvements across versions
   - **Model Performance Comparison**: Compare different AI models
   - **Execution Time**: Monitor performance optimization
   - **Token Usage**: Track cost and efficiency
   - **Failure Rate**: Identify problematic prompts
   - **Version Score Comparison**: Overall performance comparison

### Working with Variables

1. **Adding Variables**
   - Use `{{variableName}}` syntax in your prompts
   - Add variables through the Variable Manager
   - Set default values for testing

2. **Dynamic Testing**
   - Change variable values to test different scenarios
   - Variables are automatically replaced in prompts
   - Each version maintains its own variable set

### Multi-Model Testing

1. **Select Models**
   - Choose from 20+ available models
   - Mix different providers (OpenAI, Groq, OpenRouter)
   - Run multiple models simultaneously

2. **Compare Results**
   - View outputs from all selected models
   - Compare scores and performance metrics
   - Identify the best model for your use case

## 🔧 Development

### Project Structure

```
src/
├── components/          # React components
│   ├── Analytics.tsx   # Analytics dashboard
│   ├── VersionControl.tsx # Version management
│   ├── VersionComparison.tsx # Version comparison
│   └── ...
├── hooks/              # Custom React hooks
│   └── usePromptVersions.ts # Version management logic
├── services/           # API services
│   └── apiService.ts   # Multi-provider API integration
├── types/              # TypeScript type definitions
└── ...
```

### Key Components

- **`usePromptVersions`**: Manages version state with localStorage persistence
- **`VersionControl`**: Complete version management interface
- **`VersionComparison`**: Side-by-side version analysis
- **`Analytics`**: Comprehensive analytics dashboard
- **`apiService`**: Multi-provider API integration

### Adding New Features

1. **New Model Support**
   - Add model configuration to `MODEL_CONFIG` in `apiService.ts`
   - Update model list in `PromptForge.tsx`

2. **New Analytics Metrics**
   - Extend the `Analytics.tsx` component
   - Add new chart types as needed

3. **Enhanced Version Features**
   - Extend the `PromptVersion` type in `types/index.ts`
   - Update version management logic in `usePromptVersions.ts`

## 🎯 Best Practices

### Version Management
- Use descriptive version titles and commit messages
- Create versions frequently to track improvements
- Compare versions regularly to identify best performers
- Use the search feature for large version sets

### Analytics Usage
- Monitor failure rates to identify problematic prompts
- Track token usage for cost optimization
- Use execution time data to optimize performance
- Compare model performance for your specific use cases

### Prompt Engineering
- Start with simple prompts and iterate
- Use variables for dynamic content
- Test across multiple models
- Leverage system messages for context

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Open an issue on GitHub
- Check the documentation
- Review the code examples

---

**PromptForge** - Empowering prompt engineers with advanced tools and analytics.
