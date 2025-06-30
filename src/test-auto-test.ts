// Test file to demonstrate the Prompt Auto-Test functionality
// This file shows how the auto-test feature works

import { TestCase, TestResult, AutoTestResult } from './components/PromptAutoTest';

// Example test case generation
const examplePrompt = `Write a professional email to {{recipient}} about {{topic}} in a {{tone}} tone.`;

const exampleVariables = [
  { name: 'recipient', value: 'john.doe@company.com' },
  { name: 'topic', value: 'project update' },
  { name: 'tone', value: 'formal' }
];

// Example test cases that would be generated
const exampleTestCases: TestCase[] = [
  {
    id: 'test_1',
    input: {
      recipient: 'john.doe@company.com',
      topic: 'project update',
      tone: 'formal'
    },
    expectedOutput: 'A formal professional email about project updates',
    description: 'Tests formal tone with business context'
  },
  {
    id: 'test_2',
    input: {
      recipient: 'sarah.smith@startup.com',
      topic: 'collaboration proposal',
      tone: 'friendly'
    },
    expectedOutput: 'A friendly professional email about collaboration',
    description: 'Tests friendly tone with partnership context'
  },
  {
    id: 'test_3',
    input: {
      recipient: 'ceo@enterprise.com',
      topic: 'budget approval',
      tone: 'formal'
    },
    expectedOutput: 'A formal professional email about budget matters',
    description: 'Tests formal tone with executive communication'
  }
];

// Example test results
const exampleTestResults: TestResult[] = [
  {
    testCase: exampleTestCases[0],
    actualOutput: 'Dear John Doe,\n\nI hope this email finds you well. I am writing to provide you with an update on our ongoing project...',
    passed: true,
    evaluation: {
      followsInstructions: true,
      toneStyleAligned: true,
      constraintsRespected: true,
      overallPassed: true,
      critique: 'Excellent formal tone and professional structure. Follows email conventions perfectly.'
    },
    executionTime: 1250,
    tokenUsage: { input: 45, output: 120, total: 165 }
  },
  {
    testCase: exampleTestCases[1],
    actualOutput: 'Hi Sarah!\n\nI wanted to reach out about an exciting collaboration opportunity...',
    passed: true,
    evaluation: {
      followsInstructions: true,
      toneStyleAligned: true,
      constraintsRespected: true,
      overallPassed: true,
      critique: 'Perfect friendly tone while maintaining professionalism. Great balance.'
    },
    executionTime: 980,
    tokenUsage: { input: 42, output: 95, total: 137 }
  },
  {
    testCase: exampleTestCases[2],
    actualOutput: 'Dear CEO,\n\nI am writing to request your approval for the proposed budget allocation...',
    passed: true,
    evaluation: {
      followsInstructions: true,
      toneStyleAligned: true,
      constraintsRespected: true,
      overallPassed: true,
      critique: 'Appropriate formal tone for executive communication. Clear and concise.'
    },
    executionTime: 1100,
    tokenUsage: { input: 38, output: 105, total: 143 }
  }
];

// Example complete auto-test result
const exampleAutoTestResult: AutoTestResult = {
  prompt: examplePrompt,
  testCases: exampleTestCases,
  results: exampleTestResults,
  summary: {
    totalTests: 3,
    passedTests: 3,
    failedTests: 0,
    overallPassed: true,
    averageScore: 1.0
  }
};

console.log('Prompt Auto-Test Example:');
console.log('========================');
console.log('Prompt:', examplePrompt);
console.log('Variables:', exampleVariables);
console.log('Test Cases Generated:', exampleTestCases.length);
console.log('All Tests Passed:', exampleAutoTestResult.summary.overallPassed);
console.log('Average Score:', exampleAutoTestResult.summary.averageScore);

// Example of how the badges would appear:
console.log('\nBadge Display:');
console.log('✅ Test Passed - All tests passed successfully');
console.log('❌ Test Failed - Some tests failed (if any had failed)');

export {
  examplePrompt,
  exampleVariables,
  exampleTestCases,
  exampleTestResults,
  exampleAutoTestResult
}; 