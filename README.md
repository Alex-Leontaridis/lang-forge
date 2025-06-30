# LangForge 🦜

The visual IDE for crafting prompts and building LangChain logic — all in one place. A powerful prompt engineering and testing platform with advanced version control, analytics, multi-model comparison, and comprehensive variable management capabilities.

## 🚀 Features

### ✨ Core Functionality
- **Advanced Prompt Editor** with syntax highlighting and variable support
- **Multi-Model Testing** across 20+ AI models (OpenAI, Groq, OpenRouter)
- **Real-time Prompt Scoring** with relevance, clarity, and creativity metrics
- **Comprehensive Variable Management** with explicit declarations and validation
- **Project Dashboard** for managing multiple projects and templates

### 🏠 Project Dashboard (NEW!)
- **Project Management** with status tracking (Draft, Testing, Exported)
- **Analytics Snapshot** showing total projects, versions, tokens, and performance
- **Template Library** with pre-built starter kits (QA Bot, Multi-Prompt Chain, etc.)
- **Project Actions** including open, duplicate, export, and delete
- **Search & Filter** capabilities for large project collections
- **LangChain Export Types** tracking (SequentialChain, LangGraph, Custom)

### 🔄 Variable Management System (NEW!)
- **Explicit Input Variable Declaration** with types, validation, and defaults
- **Variable Flow Visualization** between nodes with hover details
- **Chain Health Validation** with automated issue detection
- **Auto-validation** of prompt text against declared inputs
- **Type Safety** with string, int, float, boolean, array, and object types
- **Validation Rules** including patterns, ranges, and enums
- **Health Monitoring** with error and warning severity levels

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
cd langforge

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

### Variable Management (NEW!)

1. **Explicit Variable Declaration**
   - Switch to "Declaration" tab in Variable Manager
   - Define input variables with types (string, int, float, boolean, array, object)
   - Set validation rules (patterns, ranges, enums)
   - Mark required fields and set default values

2. **Auto-declaration from Prompt**
   - Write prompts using `{{variable}}` syntax
   - Click "Auto-declare variables from prompt"
   - System automatically creates input variable declarations

3. **Variable Validation**
   - Real-time validation against declared inputs
   - Type checking and constraint validation
   - Visual indicators for validation issues

4. **Chain Health Monitoring**
   - View health issues in the Chain Health panel
   - Identify undeclared variables, unused inputs, and dangling outputs
   - Get severity-based warnings and errors

5. **Variable Flow Tracking**
   - Visualize how variables flow between nodes
   - Hover to see detailed flow information
   - Filter by flow types (direct, transformed, conditional)

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

### Using the Project Dashboard

1. **Accessing the Dashboard**
   - After login/signup, you'll be redirected to the dashboard
   - View analytics snapshot with key metrics
   - Manage all your projects from one central location

2. **Analytics Overview**
   - **Total Projects**: Number of projects you've created
   - **Prompt Versions**: Total versions across all projects
   - **Tokens This Month**: Current month's token usage
   - **Top Prompt Score**: Best performing prompt score
   - **Most Used Model**: Your preferred AI model

3. **Project Management**
   - **Create New Project**: Click "+ New Project" button
   - **Search Projects**: Use the search bar to find specific projects
   - **Filter by Status**: Filter by Draft, Testing, or Exported status
   - **Project Actions**: Open, duplicate, export, or delete projects

4. **Using Templates**
   - Browse pre-built templates in the right sidebar
   - Filter by category (LangChain, LangGraph, Chat, Tools, QA, Summarizer)
   - Choose complexity level (Beginner, Intermediate, Advanced)
   - Click "Load Template" to create a new project from template

5. **Project Status Tracking**
   - **Draft**: Work in progress projects
   - **Testing**: Projects being tested with multiple models
   - **Exported**: Completed projects ready for production

6. **Export Types**
   - **SequentialChain**: Linear prompt chains
   - **LangGraph**: Complex workflows with conditional logic
   - **Custom**: Custom implementations
   - **None**: Projects not yet exported

## 🔧 Development

### Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx   # Project dashboard (NEW!)
│   ├── Analytics.tsx   # Analytics dashboard
│   ├── VersionControl.tsx # Version management
│   ├── VersionComparison.tsx # Version comparison
│   ├── VariableManager.tsx # Variable management (NEW!)
│   ├── ChainHealthValidation.tsx # Health monitoring (NEW!)
│   ├── VariableFlowVisualization.tsx # Flow tracking (NEW!)
│   └── ...
├── hooks/              # Custom React hooks
│   └── usePromptVersions.ts # Version management logic
├── services/           # API services
│   └── apiService.ts   # Multi-provider API integration
├── types/              # TypeScript type definitions
└── ...
```

### Key Components

- **`Dashboard`**: Project management and analytics overview (NEW!)
- **`usePromptVersions`**: Manages version state with localStorage persistence
- **`VersionControl`**: Complete version management interface
- **`VersionComparison`**: Side-by-side version analysis
- **`Analytics`**: Comprehensive analytics dashboard
- **`VariableManager`**: Advanced variable management with validation
- **`ChainHealthValidation`**: Automated health monitoring
- **`VariableFlowVisualization`**: Visual variable flow tracking
- **`apiService`**: Multi-provider API integration

### Adding New Features

1. **New Model Support**
   - Add model configuration to `MODEL_CONFIG` in `apiService.ts`
   - Update model list in `PromptForge.tsx`

2. **New Analytics Metrics**
   - Extend the `Analytics.tsx` component
   - Add new chart types as needed

3. **Enhanced Variable Features**
   - Extend variable types in `types/index.ts`
   - Add new validation rules to `VariableManager.tsx`
   - Update health monitoring in `ChainHealthValidation.tsx`

4. **Dashboard Enhancements**
   - Add new project templates in `Dashboard.tsx`
   - Extend analytics metrics for project overview
   - Add new project status types and export formats

## 🎯 Best Practices

### Project Management
- Use descriptive project names and descriptions
- Update project status as you progress (Draft → Testing → Exported)
- Use templates for common use cases to save time
- Regularly review and clean up old projects

### Variable Management
- Use explicit variable declarations for better validation
- Choose appropriate data types for your variables
- Set reasonable validation rules (min/max values, enums)
- Use descriptive variable names and descriptions
- Regularly check chain health for issues

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
- Validate variable usage with the health monitoring system

## 🧪 Testing

Run the variable management tests to verify functionality:

```bash
npx tsx src/test-variable-management.ts
```

This comprehensive test suite validates:
- Input variable declaration and validation
- Output variable tracking
- Variable flow between nodes
- Chain health monitoring
- Auto-declaration from prompts
- Type safety and validation rules

## 📚 Documentation

For detailed information about the Variable Management system, see:
- [Variable Management Documentation](VARIABLE_MANAGEMENT.md)
- [API Integration Guide](API_INTEGRATION.md)
- [Fixes Summary](FIXES_SUMMARY.md)

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

**LangForge 🦜** - The visual IDE for crafting prompts and building LangChain logic.