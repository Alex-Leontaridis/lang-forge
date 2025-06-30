import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, Loader2, AlertTriangle, Sparkles, ChevronDown, ChevronRight, Bot } from 'lucide-react';
import { Variable, Model } from '../types';
import apiService from '../services/apiService';

export interface TestCase {
  id: string;
  input: Record<string, string>;
  expectedOutput: string;
  description: string;
}

export interface TestResult {
  testCase: TestCase;
  actualOutput: string;
  modelId: string;
  modelName: string;
  passed: boolean;
  evaluation: {
    followsInstructions: boolean;
    toneStyleAligned: boolean;
    constraintsRespected: boolean;
    overallPassed: boolean;
    critique: string;
  };
  executionTime: number;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
}

export interface AutoTestResult {
  prompt: string;
  testCases: TestCase[];
  results: TestResult[];
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    overallPassed: boolean;
    averageScore: number;
    modelResults: Record<string, { passed: number; failed: number; total: number }>;
  };
}

interface PromptAutoTestProps {
  prompt: string;
  variables: Variable[];
  models: Model[];
  selectedModels?: string[];
  temperature?: number;
  onTestComplete?: (result: AutoTestResult) => void;
  className?: string;
  isRunning?: boolean;
}

const PromptAutoTest: React.FC<PromptAutoTestProps> = ({
  prompt,
  variables,
  models,
  selectedModels = ['gpt-4'],
  temperature = 0.3,
  onTestComplete,
  className = '',
  isRunning = false
}) => {
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResult, setTestResult] = useState<AutoTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const generateTestCases = async (prompt: string, variables: Variable[]): Promise<TestCase[]> => {
    const systemMessage = `You are an expert QA engineer specializing in generating comprehensive test cases for AI prompts. Your goal is to create realistic test scenarios that validate the prompt's effectiveness.

TEST CASE GENERATION PRINCIPLES:
1. COVERAGE: Test different variable combinations and edge cases
2. REALISM: Use realistic, practical input values
3. DIVERSITY: Include various scenarios to test robustness
4. VALIDATION: Each test case should have clear expected outcomes
5. VARIABLES: Generate appropriate values for all {{variable}} placeholders

Generate 3-5 test cases that cover different scenarios and variable combinations.`;

    const testGenerationPrompt = `Generate test cases for this prompt:

PROMPT:
${prompt}

VARIABLES:
${variables.map(v => `- ${v.name}: ${v.description || 'No description'}`).join('\n')}

Generate test cases in this JSON format:
{
  "testCases": [
    {
      "id": "test_1",
      "input": {"variable1": "value1", "variable2": "value2"},
      "expectedOutput": "Expected output description",
      "description": "What this test case validates"
    }
  ]
}

Only return the JSON, no additional text.`;

    try {
      const result = await apiService.generateCompletion(
        'gpt-4',
        testGenerationPrompt,
        systemMessage,
        temperature,
        1500
      );

      const parsed = JSON.parse(result.content.trim());
      return parsed.testCases || [];
    } catch (error) {
      console.error('Error generating test cases:', error);
      // Fallback to basic test cases
      return generateFallbackTestCases(prompt, variables);
    }
  };

  const generateFallbackTestCases = (prompt: string, variables: Variable[]): TestCase[] => {
    const testCases: TestCase[] = [];
    
    // Create basic test cases with sample values
    const sampleValues = {
      name: ['John', 'Alice', 'Bob'],
      topic: ['technology', 'science', 'history'],
      context: ['professional', 'casual', 'academic'],
      style: ['formal', 'informal', 'creative']
    };

    for (let i = 0; i < Math.min(3, variables.length + 1); i++) {
      const input: Record<string, string> = {};
      variables.forEach(variable => {
        const sampleArray = sampleValues[variable.name as keyof typeof sampleValues];
        if (sampleArray) {
          input[variable.name] = sampleArray[i % sampleArray.length];
        } else {
          input[variable.name] = `test_value_${i + 1}`;
        }
      });

      testCases.push({
        id: `test_${i + 1}`,
        input,
        expectedOutput: 'Expected output based on prompt instructions',
        description: `Test case ${i + 1} with ${Object.keys(input).join(', ')} variables`
      });
    }

    return testCases;
  };

  const runTestCase = async (testCase: TestCase, modelId: string): Promise<TestResult> => {
    // Replace variables in prompt with test case values
    let testPrompt = prompt;
    Object.entries(testCase.input).forEach(([key, value]) => {
      testPrompt = testPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });

    const startTime = Date.now();
    
    // Run the prompt with the test case input
    const result = await apiService.generateCompletion(
      modelId,
      testPrompt,
      '',
      temperature,
      1000
    );

    const executionTime = Date.now() - startTime;

    // Evaluate the result using GPT-4
    const evaluation = await evaluateTestResult(testCase, result.content, prompt);

    const model = models.find(m => m.id === modelId);

    return {
      testCase,
      actualOutput: result.content,
      modelId,
      modelName: model?.name || modelId,
      passed: evaluation.overallPassed,
      evaluation,
      executionTime,
      tokenUsage: result.usage ? {
        input: result.usage.prompt_tokens,
        output: result.usage.completion_tokens,
        total: result.usage.total_tokens
      } : { input: 0, output: 0, total: 0 }
    };
  };

  const evaluateTestResult = async (
    testCase: TestCase, 
    actualOutput: string, 
    originalPrompt: string
  ) => {
    const systemMessage = `You are an expert prompt evaluator. Your task is to assess whether an AI output meets the requirements specified in the original prompt.

EVALUATION CRITERIA:
1. FOLLOWS INSTRUCTIONS: Does the output follow the explicit instructions in the prompt?
2. TONE/STYLE ALIGNED: Is the tone and style appropriate for the intended purpose?
3. CONSTRAINTS RESPECTED: Are any constraints or requirements in the prompt respected?

Rate each criterion as true/false and provide a brief critique.`;

    const evaluationPrompt = `Evaluate this AI output against the original prompt:

ORIGINAL PROMPT:
${originalPrompt}

TEST CASE INPUT:
${JSON.stringify(testCase.input, null, 2)}

EXPECTED OUTPUT:
${testCase.expectedOutput}

ACTUAL OUTPUT:
${actualOutput}

Evaluate and respond in this JSON format:
{
  "followsInstructions": true/false,
  "toneStyleAligned": true/false,
  "constraintsRespected": true/false,
  "overallPassed": true/false,
  "critique": "Brief explanation of the evaluation"
}

Only return the JSON, no additional text.`;

    try {
      const result = await apiService.generateCompletion(
        'gpt-4',
        evaluationPrompt,
        systemMessage,
        0.1,
        500
      );

      const parsed = JSON.parse(result.content.trim());
      return {
        followsInstructions: parsed.followsInstructions || false,
        toneStyleAligned: parsed.toneStyleAligned || false,
        constraintsRespected: parsed.constraintsRespected || false,
        overallPassed: parsed.overallPassed || false,
        critique: parsed.critique || 'Evaluation failed'
      };
    } catch (error) {
      console.error('Error evaluating test result:', error);
      return {
        followsInstructions: false,
        toneStyleAligned: false,
        constraintsRespected: false,
        overallPassed: false,
        critique: 'Evaluation failed due to technical error'
      };
    }
  };

  const runAutoTest = async () => {
    if (!prompt.trim() || isRunningTests) return;

    setIsRunningTests(true);
    setError(null);
    setTestResult(null);

    try {
      // Generate test cases
      const testCases = await generateTestCases(prompt, variables);
      
      // Run each test case with each selected model
      const results: TestResult[] = [];
      for (const testCase of testCases) {
        for (const modelId of selectedModels) {
          const result = await runTestCase(testCase, modelId);
          results.push(result);
        }
      }

      // Calculate summary with model-specific results
      const modelResults: Record<string, { passed: number; failed: number; total: number }> = {};
      
      selectedModels.forEach(modelId => {
        const modelTestResults = results.filter(r => r.modelId === modelId);
        const passed = modelTestResults.filter(r => r.passed).length;
        const total = modelTestResults.length;
        modelResults[modelId] = {
          passed,
          failed: total - passed,
          total
        };
      });

      const passedTests = results.filter(r => r.passed).length;
      const totalTests = results.length;
      const averageScore = results.reduce((sum, r) => {
        const score = (r.evaluation.followsInstructions ? 1 : 0) +
                     (r.evaluation.toneStyleAligned ? 1 : 0) +
                     (r.evaluation.constraintsRespected ? 1 : 0);
        return sum + (score / 3);
      }, 0) / totalTests;

      const summary = {
        totalTests,
        passedTests,
        failedTests: totalTests - passedTests,
        overallPassed: passedTests === totalTests,
        averageScore: Math.round(averageScore * 100) / 100,
        modelResults
      };

      const autoTestResult: AutoTestResult = {
        prompt,
        testCases,
        results,
        summary
      };

      setTestResult(autoTestResult);
      onTestComplete?.(autoTestResult);
    } catch (error) {
      console.error('Error running auto test:', error);
      setError('Failed to run auto test. Please try again.');
    } finally {
      setIsRunningTests(false);
    }
  };

  const getOverallStatus = () => {
    if (!testResult) return null;
    
    if (testResult.summary.overallPassed) {
      return { icon: <CheckCircle className="w-5 h-5 text-green-500" />, text: 'All Tests Passed', className: 'text-green-600' };
    } else if (testResult.summary.passedTests > 0) {
      return { icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />, text: 'Partial Pass', className: 'text-yellow-600' };
    } else {
      return { icon: <XCircle className="w-5 h-5 text-red-500" />, text: 'All Tests Failed', className: 'text-red-600' };
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-left"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            <span className="font-semibold text-gray-900 text-sm sm:text-base">Auto-Test</span>
            <span className="text-xs sm:text-sm text-gray-500">({selectedModels.length} models)</span>
          </button>
          
          <button
            onClick={runAutoTest}
            disabled={isRunningTests || isRunning}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors text-sm sm:text-base"
          >
            {isRunningTests ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{isRunningTests ? 'Running...' : 'Run Auto-Test'}</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 sm:p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {testResult && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {getOverallStatus()?.icon}
                <div>
                  <p className={`font-medium ${getOverallStatus()?.className}`}>
                    {getOverallStatus()?.text}
                  </p>
                  <p className="text-sm text-gray-600">
                    {testResult.summary.passedTests}/{testResult.summary.totalTests} tests passed
                    {testResult.summary.averageScore > 0 && (
                      <span> • Average score: {testResult.summary.averageScore}/1.0</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Model Results Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(testResult.summary.modelResults).map(([modelId, stats]) => {
                  const model = models.find(m => m.id === modelId);
                  const passRate = stats.total > 0 ? (stats.passed / stats.total * 100).toFixed(0) : '0';
                  
                  return (
                    <div key={modelId} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Bot className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-sm">{model?.name || modelId}</span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          stats.passed === stats.total 
                            ? 'bg-green-100 text-green-700' 
                            : stats.passed > 0 
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}>
                          {passRate}%
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {stats.passed}/{stats.total} tests passed
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Test Results */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Detailed Test Results</h4>
                {testResult.results.map((result, index) => (
                  <div key={`${result.testCase.id}-${result.modelId}`} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h5 className="font-medium text-sm">Test {Math.floor(index / selectedModels.length) + 1} - {result.modelName}</h5>
                        {result.passed ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.executionTime}ms • {result.tokenUsage.total} tokens
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Input:</p>
                        <pre className="bg-gray-50 p-2 rounded text-gray-600 overflow-x-auto">
                          {JSON.stringify(result.testCase.input, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Output:</p>
                        <div className="bg-gray-50 p-2 rounded text-gray-600 max-h-20 overflow-y-auto">
                          {result.actualOutput}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 p-2 bg-blue-50 rounded">
                      <p className="text-xs text-blue-800">{result.evaluation.critique}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!testResult && !isRunningTests && (
            <div className="text-center py-8 text-gray-500">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Click "Run Auto-Test" to generate and run test cases with {selectedModels.length} models</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromptAutoTest; 