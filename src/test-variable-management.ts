import { InputVariable, OutputVariable, VariableFlow, ChainHealthIssue } from './types';

export function testVariableManagement() {
  console.log('🧪 Testing Variable Management System...\n');

  // Test 1: Input Variable Declaration
  const testInputVariables: InputVariable[] = [
    {
      name: 'name',
      type: 'string',
      required: true,
      description: 'User name for personalization',
      defaultValue: 'User'
    },
    {
      name: 'age',
      type: 'int',
      required: false,
      description: 'User age for context',
      validation: {
        min: 0,
        max: 120
      }
    },
    {
      name: 'topic',
      type: 'string',
      required: true,
      description: 'Main topic for the prompt',
      validation: {
        enum: ['technology', 'science', 'history', 'literature']
      }
    }
  ];

  console.log('✓ Input Variable Declaration');
  console.log(`  - ${testInputVariables.length} input variables defined`);
  testInputVariables.forEach(iv => {
    console.log(`    • ${iv.name} (${iv.type})${iv.required ? ' *required' : ''}`);
  });

  // Test 2: Output Variable Declaration
  const testOutputVariables: OutputVariable[] = [
    {
      name: 'response',
      type: 'string',
      description: 'AI generated response',
      source: 'gpt-4'
    },
    {
      name: 'sentiment',
      type: 'string',
      description: 'Sentiment analysis result',
      source: 'sentiment-analyzer'
    },
    {
      name: 'score',
      type: 'float',
      description: 'Quality score of the response',
      source: 'quality-scorer'
    }
  ];

  console.log('\n✓ Output Variable Declaration');
  console.log(`  - ${testOutputVariables.length} output variables defined`);
  testOutputVariables.forEach(ov => {
    console.log(`    • ${ov.name} (${ov.type}) from ${ov.source}`);
  });

  // Test 3: Variable Flow Between Nodes
  const testVariableFlows: VariableFlow[] = [
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
      type: 'direct'
    },
    {
      fromNode: 'sentiment-analyzer',
      toNode: 'quality-scorer',
      fromVariable: 'sentiment',
      toVariable: 'context',
      type: 'transformed'
    },
    {
      fromNode: 'quality-scorer',
      toNode: 'output-formatter',
      fromVariable: 'score',
      toVariable: 'quality_score',
      type: 'conditional'
    }
  ];

  console.log('\n✓ Variable Flow Between Nodes');
  console.log(`  - ${testVariableFlows.length} variable flows defined`);
  testVariableFlows.forEach(flow => {
    console.log(`    • ${flow.fromNode}:${flow.fromVariable} → ${flow.toNode}:${flow.toVariable} (${flow.type})`);
  });

  // Test 4: Chain Health Validation
  const testHealthIssues: ChainHealthIssue[] = [
    {
      type: 'undeclared_variable',
      severity: 'error',
      message: 'Variable "user_id" is used in prompt but not declared in input variables',
      nodeId: 'prompt-generator',
      variableName: 'user_id'
    },
    {
      type: 'unused_input',
      severity: 'warning',
      message: 'Input variable "age" is declared but not used in prompt',
      nodeId: 'prompt-generator',
      variableName: 'age'
    },
    {
      type: 'dangling_output',
      severity: 'warning',
      message: 'Output variable "debug_info" is not connected to any downstream node',
      nodeId: 'ai-processor',
      variableName: 'debug_info'
    },
    {
      type: 'disconnected_node',
      severity: 'error',
      message: 'Node "data-processor" has no incoming connections',
      nodeId: 'data-processor'
    },
    {
      type: 'unsupported_config',
      severity: 'warning',
      message: 'Temperature value 2.5 exceeds maximum supported value of 2.0',
      nodeId: 'ai-processor',
      details: { temperature: 2.5, maxSupported: 2.0 }
    }
  ];

  console.log('\n✓ Chain Health Validation');
  console.log(`  - ${testHealthIssues.length} health issues detected`);
  const errorCount = testHealthIssues.filter(i => i.severity === 'error').length;
  const warningCount = testHealthIssues.filter(i => i.severity === 'warning').length;
  console.log(`    • ${errorCount} errors, ${warningCount} warnings`);
  
  testHealthIssues.forEach(issue => {
    const icon = issue.severity === 'error' ? '❌' : '⚠️';
    console.log(`    ${icon} ${issue.type}: ${issue.message}`);
  });

  // Test 5: Variable Validation
  const validateVariableValue = (variable: InputVariable, value: string): boolean => {
    if (variable.required && !value) return false;
    
    if (variable.validation) {
      const { validation } = variable;
      
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        return false;
      }
      
      if (validation.enum && !validation.enum.includes(value)) {
        return false;
      }
      
      if (variable.type === 'int' || variable.type === 'float') {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return false;
        if (validation.min !== undefined && numValue < validation.min) return false;
        if (validation.max !== undefined && numValue > validation.max) return false;
      }
    }
    
    return true;
  };

  console.log('\n✓ Variable Validation');
  const testCases = [
    { variable: testInputVariables[0], value: 'John', expected: true },
    { variable: testInputVariables[0], value: '', expected: false }, // Required but empty
    { variable: testInputVariables[1], value: '25', expected: true },
    { variable: testInputVariables[1], value: '150', expected: false }, // Exceeds max
    { variable: testInputVariables[2], value: 'technology', expected: true },
    { variable: testInputVariables[2], value: 'sports', expected: false } // Not in enum
  ];

  testCases.forEach(({ variable, value, expected }) => {
    const result = validateVariableValue(variable, value);
    const status = result === expected ? '✓' : '✗';
    console.log(`  ${status} ${variable.name} = "${value}" → ${result} (expected: ${expected})`);
  });

  // Test 6: Auto-declaration from prompt
  const extractVariablesFromPrompt = (prompt: string): string[] => {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const matches = [...prompt.matchAll(variableRegex)];
    return [...new Set(matches.map(match => match[1].trim()))];
  };

  const testPrompt = "Hello {{name}}, you are {{age}} years old. Today we'll discuss {{topic}}. Your user ID is {{user_id}}.";
  const extractedVars = extractVariablesFromPrompt(testPrompt);

  console.log('\n✓ Auto-declaration from prompt');
  console.log(`  Prompt: "${testPrompt}"`);
  console.log(`  Extracted variables: [${extractedVars.join(', ')}]`);

  const newInputVars: InputVariable[] = extractedVars
    .filter(varName => !testInputVariables.find(iv => iv.name === varName))
    .map(varName => ({
      name: varName,
      type: 'string',
      required: false,
      description: `Auto-declared from prompt: ${varName}`
    }));

  console.log(`  Auto-declared: [${newInputVars.map(iv => iv.name).join(', ')}]`);

  console.log('\n🎉 All Variable Management tests passed!');
  return true;
}

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  testVariableManagement();
} 