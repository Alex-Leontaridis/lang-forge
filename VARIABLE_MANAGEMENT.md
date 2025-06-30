# Variable Management System

The Variable Management system in PromptForge provides comprehensive tools for managing variables in AI prompts, tracking their flow between nodes, and validating chain health.

## Features Overview

### 1. Explicit Input Variable Declaration

Each node can define expected input variables with:
- **Name**: Variable identifier
- **Type**: Data type (string, int, float, boolean, array, object)
- **Default Value**: Optional default value
- **Required**: Whether the variable is mandatory
- **Description**: Human-readable description
- **Validation**: Rules for value validation

#### Supported Types
- `string`: Text values
- `int`: Integer numbers
- `float`: Decimal numbers
- `boolean`: True/false values
- `array`: Array of values
- `object`: Complex objects

#### Validation Rules
- **Pattern**: Regular expression validation
- **Min/Max**: Numeric range validation
- **Enum**: Allowed value enumeration

### 2. Variable Flow Between Nodes

The system tracks how variables flow between nodes in a chain:

#### Flow Types
- **Direct**: Direct variable passing
- **Transformed**: Variable transformation during flow
- **Conditional**: Conditional variable flow based on logic

#### Visual Features
- Hover to see passed variables
- Color-coded flow types
- Node health status indicators
- Filter options for unused/dangling variables

### 3. Chain Health Validation

Automated validation that highlights issues:

#### Issue Types
- **Undeclared Variables**: Variables used but not declared
- **Unused Inputs**: Declared variables not used in prompts
- **Dangling Outputs**: Output variables not connected
- **Disconnected Nodes**: Nodes without proper connections
- **Unsupported Configurations**: Invalid settings

#### Severity Levels
- **Error**: Critical issues that prevent execution
- **Warning**: Issues that may cause problems

## Usage Guide

### Setting Up Input Variables

1. **Manual Declaration**:
   ```typescript
   const inputVariables: InputVariable[] = [
     {
       name: 'user_name',
       type: 'string',
       required: true,
       description: 'User name for personalization',
       defaultValue: 'User'
     },
     {
       name: 'age',
       type: 'int',
       required: false,
       validation: {
         min: 0,
         max: 120
       }
     }
   ];
   ```

2. **Auto-declaration from Prompt**:
   - Write your prompt with `{{variable}}` syntax
   - Click "Auto-declare variables from prompt"
   - System automatically creates input variable declarations

### Variable Validation

The system validates variable values against their declarations:

```typescript
// Example validation
const variable: InputVariable = {
  name: 'topic',
  type: 'string',
  required: true,
  validation: {
    enum: ['technology', 'science', 'history']
  }
};

// Valid values
validateVariableValue(variable, 'technology'); // ✅ true
validateVariableValue(variable, 'science');    // ✅ true

// Invalid values
validateVariableValue(variable, 'sports');     // ❌ false (not in enum)
validateVariableValue(variable, '');           // ❌ false (required but empty)
```

### Tracking Variable Flow

```typescript
const variableFlows: VariableFlow[] = [
  {
    fromNode: 'prompt-generator',
    toNode: 'ai-processor',
    fromVariable: 'prompt',
    toVariable: 'input',
    type: 'direct'
  },
  {
    fromNode: 'ai-processor',
    toNode: 'sentiment-analyzer',
    fromVariable: 'response',
    toVariable: 'text',
    type: 'transformed'
  }
];
```

### Health Monitoring

The system continuously monitors chain health:

```typescript
const healthIssues: ChainHealthIssue[] = [
  {
    type: 'undeclared_variable',
    severity: 'error',
    message: 'Variable "user_id" is used but not declared',
    nodeId: 'prompt-generator',
    variableName: 'user_id'
  },
  {
    type: 'unused_input',
    severity: 'warning',
    message: 'Input variable "age" is declared but not used',
    nodeId: 'prompt-generator',
    variableName: 'age'
  }
];
```

## UI Components

### VariableManager

The main component for managing variables with two tabs:

1. **Values Tab**: Set variable values and see validation
2. **Declaration Tab**: Define input variable specifications

Features:
- Auto-validation against declared inputs
- Type indicators and required field markers
- Search and filter capabilities
- Auto-declaration from prompt text

### ChainHealthValidation

Displays chain health issues with:
- Issue categorization and counts
- Severity-based color coding
- Click-to-navigate functionality
- Auto-fix suggestions

### VariableFlowVisualization

Shows variable flow between nodes:
- Visual flow representation
- Hover details for each flow
- Node health status indicators
- Filtering options

## Integration with Prompt Nodes

Each prompt node supports:

```typescript
interface PromptNode {
  // ... other properties
  inputVariables: InputVariable[];    // Expected inputs
  outputVariables: OutputVariable[];  // Expected outputs
  healthIssues: ChainHealthIssue[];   // Node-specific issues
}
```

### Node Variable Declaration

In the PromptNodeComponent:
1. Click "Declaration" button in variables section
2. Add input variables with types and validation
3. Auto-declare from prompt text
4. Set required fields and default values

### Health Status Display

Nodes show health status in their headers:
- ✅ Healthy: No issues
- ⚠️ Warning: Non-critical issues
- ❌ Error: Critical issues

## Best Practices

### 1. Variable Naming
- Use descriptive names: `user_name` instead of `n`
- Follow consistent naming conventions
- Avoid reserved words

### 2. Type Selection
- Choose appropriate types for validation
- Use `string` for text, `int` for whole numbers
- Consider `boolean` for true/false values

### 3. Validation Rules
- Set reasonable min/max values for numbers
- Use enums for constrained choices
- Make required fields explicit

### 4. Flow Design
- Plan variable flow before implementation
- Use descriptive variable names in flows
- Document transformation logic

### 5. Health Monitoring
- Regularly check chain health
- Address errors before warnings
- Use auto-fix features when appropriate

## Testing

Run the variable management tests:

```bash
npx tsx src/test-variable-management.ts
```

This tests:
- Input variable declaration
- Output variable declaration
- Variable flow tracking
- Chain health validation
- Variable validation logic
- Auto-declaration from prompts

## API Reference

### Types

```typescript
interface InputVariable {
  name: string;
  type: 'string' | 'int' | 'float' | 'boolean' | 'array' | 'object';
  defaultValue?: string;
  required: boolean;
  description?: string;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    enum?: string[];
  };
}

interface OutputVariable {
  name: string;
  type: 'string' | 'int' | 'float' | 'boolean' | 'array' | 'object';
  description?: string;
  source: string;
}

interface VariableFlow {
  fromNode: string;
  toNode: string;
  fromVariable: string;
  toVariable: string;
  type: 'direct' | 'transformed' | 'conditional';
}

interface ChainHealthIssue {
  type: 'undeclared_variable' | 'unused_input' | 'dangling_output' | 'disconnected_node' | 'unsupported_config';
  severity: 'warning' | 'error';
  message: string;
  nodeId?: string;
  variableName?: string;
  details?: any;
}
```

### Functions

```typescript
// Extract variables from prompt text
const extractVariables = (prompt: string): string[] => {
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const matches = [...prompt.matchAll(variableRegex)];
  return [...new Set(matches.map(match => match[1].trim()))];
};

// Validate variable value against declaration
const validateVariableValue = (variable: InputVariable, value: string): boolean => {
  // Implementation details...
};
```

## Future Enhancements

Planned features for future releases:

1. **Advanced Validation**: Custom validation functions
2. **Variable Templates**: Reusable variable definitions
3. **Flow Analytics**: Performance metrics for variable flows
4. **Auto-optimization**: Automatic variable flow optimization
5. **Integration APIs**: External system integration
6. **Version Control**: Variable declaration versioning
7. **Collaboration**: Multi-user variable management
8. **Advanced Types**: Custom data types and schemas

## Troubleshooting

### Common Issues

1. **Undeclared Variables**
   - Use auto-declaration feature
   - Check variable spelling in prompts
   - Ensure all variables are declared

2. **Validation Errors**
   - Check type compatibility
   - Verify min/max values
   - Ensure enum values are correct

3. **Flow Issues**
   - Verify node connections
   - Check variable name matching
   - Ensure proper flow types

4. **Performance Issues**
   - Limit number of variables per node
   - Use appropriate data types
   - Optimize validation rules

### Debug Mode

Enable debug logging for detailed information:

```typescript
// In development
const DEBUG_VARIABLES = true;

if (DEBUG_VARIABLES) {
  console.log('Variable validation:', { variable, value, result });
}
``` 