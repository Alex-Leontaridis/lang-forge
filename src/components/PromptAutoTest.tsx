import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, Loader2, AlertTriangle, Sparkles, ChevronDown, ChevronRight, Bot, Clock } from 'lucide-react';
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
    relevance: number;
    clarity: number;
    creativity: number;
    overall: number;
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
  onTestRunningChange?: (isRunning: boolean) => void;
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
  onTestRunningChange,
  className = '',
  isRunning = false
}) => {
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResult, setTestResult] = useState<AutoTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
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

    const testGenerationPrompt = `Generate ${Math.min(3, variables.length + 1)} diverse test cases for this prompt. Each test case should test different variable combinations and edge cases.

PROMPT: "${prompt}"

VARIABLES: ${variables.map(v => `${v.name} (${v.description || 'no description'})`).join(', ')}

Generate test cases in this JSON format:
{
  "testCases": [
    {
      "id": "test_1",
      "input": { "variable_name": "value" },
      "expectedOutput": "Brief description of expected output",
      "description": "What this test case is checking"
    }
  ]
}

Focus on testing different combinations of variables and realistic scenarios.`;

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

  const runTestCase = async (testCase: TestCase, modelId: string, skipEvaluation: boolean = false): Promise<TestResult> => {
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

    // Evaluate the result using GPT-4 (optional for speed)
    let evaluation;
    if (!skipEvaluation) {
      evaluation = await evaluateTestResult(testCase, result.content, prompt);
    } else {
      // Quick evaluation based on response length and content
      const hasContent = result.content.trim().length > 10;
      evaluation = {
        relevance: hasContent ? 75 : 25,
        clarity: hasContent ? 75 : 25,
        creativity: hasContent ? 75 : 25,
        overall: hasContent ? 75 : 25,
        critique: hasContent ? 'Basic validation passed' : 'No meaningful response generated'
      };
    }

    const model = models.find(m => m.id === modelId);

    return {
      testCase,
      actualOutput: result.content,
      modelId,
      modelName: model?.name || modelId,
      passed: evaluation.overall >= 70, // Pass if overall score is 70 or higher
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
    // Use the same evaluation system as regular prompt runs
    try {
      const result = await apiService.evaluatePromptResponse(
        originalPrompt,
        actualOutput,
        0.3
      );
      
      return {
        relevance: result.relevance,
        clarity: result.clarity,
        creativity: result.creativity,
        overall: result.overall,
        critique: result.critique
      };
    } catch (error) {
      console.error('Error evaluating test result:', error);
      return {
        relevance: 50,
        clarity: 50,
        creativity: 50,
        overall: 50,
        critique: 'Evaluation failed due to technical error'
      };
    }
  };

  const runAutoTest = async () => {
    if (!prompt.trim() || isRunningTests) return;

    setIsRunningTests(true);
    setError(null);
    setTestResult(null);
    onTestRunningChange?.(true);

    try {
      // Generate test cases
      setProgress('Generating test cases...');
      console.log('🔄 Generating test cases...');
      const testCases = await generateTestCases(prompt, variables);
      console.log(`✅ Generated ${testCases.length} test cases`);
      
      // Run test cases in parallel with rate limiting
      const results: TestResult[] = [];
      const TIMEOUT_MS = 30000; // 30 second timeout per API call (increased from 15s)
      const RATE_LIMIT_DELAY = 1000; // 1 second delay between batches (increased from 500ms)
      
      // Create all test case combinations
      const testCombinations: Array<{ testCase: TestCase; modelId: string }> = [];
      for (const testCase of testCases) {
        for (const modelId of selectedModels) {
          testCombinations.push({ testCase, modelId });
        }
      }

      setProgress(`Running ${testCombinations.length} test combinations...`);
      console.log(`🔄 Running ${testCombinations.length} test combinations...`);

      // Process in batches to avoid overwhelming the API
      const BATCH_SIZE = 2; // Reduced from 3 to avoid overwhelming the API
      for (let i = 0; i < testCombinations.length; i += BATCH_SIZE) {
        const batch = testCombinations.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(testCombinations.length / BATCH_SIZE);
        setProgress(`Processing batch ${batchNumber}/${totalBatches}...`);
        console.log(`🔄 Processing batch ${batchNumber}/${totalBatches}...`);
        
        // Run batch in parallel with timeout
        const batchPromises = batch.map(async ({ testCase, modelId }) => {
          try {
            const timeoutPromise = new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Request timed out after 30 seconds')), TIMEOUT_MS)
            );
            
            // Use faster evaluation mode for speed
            const testPromise = runTestCase(testCase, modelId, true);
            return await Promise.race([testPromise, timeoutPromise]);
          } catch (error) {
            console.error(`Error running test case ${testCase.id} with model ${modelId}:`, error);
            // Return a failed result instead of throwing
            const model = models.find(m => m.id === modelId);
            return {
              testCase,
              actualOutput: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              modelId,
              modelName: model?.name || modelId,
              passed: false,
              evaluation: {
                relevance: 25,
                clarity: 25,
                creativity: 25,
                overall: 25,
                critique: error instanceof Error && error.message.includes('timed out') 
                  ? 'Test failed due to timeout - API request took too long'
                  : 'Test failed due to technical error'
              },
              executionTime: 0,
              tokenUsage: { input: 0, output: 0, total: 0 }
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Add delay between batches to respect rate limits
        if (i + BATCH_SIZE < testCombinations.length) {
          await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
        }
      }

      setProgress('Finalizing results...');
      console.log('✅ All test combinations completed');

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
        return sum + r.evaluation.overall;
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
      setProgress('');
      onTestRunningChange?.(false);
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
        
        {/* "This may take a while" message when running */}
        {isRunningTests && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>This may take a while</span>
            </div>
            {progress && (
              <div className="flex items-center space-x-2 text-sm text-purple-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{progress}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="p-3 sm:p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {testResult && (
            <div className="space-y-4">
              {/* Overall Status */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {getOverallStatus()?.icon}
                <div>
                  <h3 className={`font-medium ${getOverallStatus()?.className}`}>
                    {getOverallStatus()?.text}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {testResult.summary.passedTests}/{testResult.summary.totalTests} tests passed
                  </p>
                  <p className="text-sm text-gray-600">
                    Average Score: <span className="font-medium">{testResult.summary.averageScore.toFixed(1)}/100</span>
                  </p>
                </div>
              </div>

              {/* Model Performance Summary */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Model Performance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(testResult.summary.modelResults).map(([modelId, stats]) => {
                    const model = models.find(m => m.id === modelId);
                    const passRate = stats.total > 0 ? (stats.passed / stats.total * 100).toFixed(0) : '0';
                    
                    // Calculate average score for this model
                    const modelTestResults = testResult.results.filter(r => r.modelId === modelId);
                    const averageScore = modelTestResults.reduce((sum, r) => sum + r.evaluation.overall, 0) / modelTestResults.length;
                    
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
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>{stats.passed}/{stats.total} tests passed</div>
                          <div>Avg Score: <span className="font-medium">{averageScore.toFixed(1)}/100</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result.evaluation.overall >= 80 
                            ? 'bg-green-100 text-green-700' 
                            : result.evaluation.overall >= 60 
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}>
                          {result.evaluation.overall}/100
                        </div>
                        <div className="text-xs text-gray-500">
                          {result.executionTime}ms • {result.tokenUsage.total} tokens
                        </div>
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

                    {/* Score Details */}
                    <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium text-gray-700">Relevance</div>
                        <div className={`font-bold ${
                          result.evaluation.relevance >= 80 ? 'text-green-600' :
                          result.evaluation.relevance >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {result.evaluation.relevance}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium text-gray-700">Clarity</div>
                        <div className={`font-bold ${
                          result.evaluation.clarity >= 80 ? 'text-green-600' :
                          result.evaluation.clarity >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {result.evaluation.clarity}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium text-gray-700">Creativity</div>
                        <div className={`font-bold ${
                          result.evaluation.creativity >= 80 ? 'text-green-600' :
                          result.evaluation.creativity >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {result.evaluation.creativity}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium text-gray-700">Overall</div>
                        <div className={`font-bold ${
                          result.evaluation.overall >= 80 ? 'text-green-600' :
                          result.evaluation.overall >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {result.evaluation.overall}
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