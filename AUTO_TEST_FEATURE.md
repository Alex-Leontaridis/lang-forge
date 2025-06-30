# Prompt Auto-Test Feature

## Overview

The Prompt Auto-Test feature automatically generates test cases for AI prompts, runs them using selected models, and evaluates the results using GPT-4. This helps ensure prompt quality and reliability across different scenarios.

## Features

### 🧪 Automatic Test Case Generation
- Generates 3-5 realistic test cases based on prompt content and variables
- Creates diverse scenarios to test prompt robustness
- Uses appropriate values for all `{{variable}}` placeholders

### 🚀 Multi-Model Testing
- Runs test cases using the selected model (default: GPT-4)
- Supports all available models in the system
- Configurable temperature settings

### 📊 GPT-4 Evaluation
Each test result is evaluated by GPT-4 on three criteria:
1. **Follows Instructions**: Does the output follow explicit prompt instructions?
2. **Tone/Style Aligned**: Is the tone and style appropriate for the intended purpose?
3. **Constraints Respected**: Are any constraints or requirements in the prompt respected?

### 🏆 Pass/Fail Badges
- **✅ Test Passed**: Green badge when all tests pass
- **❌ Test Failed**: Red badge when any test fails
- **⚠️ Partial Pass**: Yellow badge when some tests pass

## Usage

### In Prompt Editor

1. Write your prompt with variables using `{{variable}}` syntax
2. Click the **"Auto-Test"** button in the header
3. The system will:
   - Generate test cases automatically
   - Run each test case with your selected model
   - Evaluate results using GPT-4
   - Display comprehensive results

### In Prompt Chain Canvas

1. Create or select a prompt node
2. Click the **Sparkles** icon (⚡) in the node header
3. The auto-test component will appear below the prompt
4. Click **"Run Auto-Test"** to start testing
5. Results are saved to the node and displayed as badges

## Test Case Examples

### Input Prompt
```
Write a professional email to {{recipient}} about {{topic}} in a {{tone}} tone.
```

### Generated Test Cases
1. **Formal Business Email**
   - Input: `{recipient: "john.doe@company.com", topic: "project update", tone: "formal"}`
   - Expected: Professional email with formal tone

2. **Friendly Collaboration Email**
   - Input: `{recipient: "sarah.smith@startup.com", topic: "collaboration proposal", tone: "friendly"}`
   - Expected: Professional but friendly email

3. **Executive Communication**
   - Input: `{recipient: "ceo@enterprise.com", topic: "budget approval", tone: "formal"}`
   - Expected: Formal executive-level communication

## Evaluation Criteria

### Follows Instructions (Boolean)
- Checks if the output adheres to explicit instructions in the prompt
- Evaluates completeness and accuracy of response

### Tone/Style Aligned (Boolean)
- Assesses if the tone matches the intended purpose
- Considers context and audience appropriateness

### Constraints Respected (Boolean)
- Verifies that any constraints or requirements are followed
- Checks for format, length, or style requirements

### Overall Pass/Fail
- All three criteria must pass for overall success
- Provides detailed critique for improvement

## Technical Implementation

### Components
- `PromptAutoTest.tsx`: Main auto-test component
- Integrated into `PromptEditor.tsx` and `PromptNodeComponent.tsx`
- Uses existing `apiService.ts` for API calls

### API Integration
- Uses GPT-4 for test case generation
- Uses GPT-4 for result evaluation
- Supports all available models for test execution

### State Management
- Test results are stored in component state
- Results are persisted to node data in canvas
- Badges update automatically based on results

## Benefits

1. **Quality Assurance**: Ensures prompts work across different scenarios
2. **Time Saving**: Automated testing vs manual test case creation
3. **Consistency**: Standardized evaluation criteria
4. **Debugging**: Detailed feedback for prompt improvement
5. **Confidence**: Visual indicators of prompt reliability

## Future Enhancements

- Custom test case templates
- Batch testing across multiple prompts
- Performance metrics and trends
- Integration with version control
- Export test results and reports

## Troubleshooting

### Common Issues
1. **No test cases generated**: Ensure prompt has content and variables
2. **Evaluation failures**: Check API connectivity and GPT-4 availability
3. **Slow performance**: Test cases run sequentially to avoid rate limits

### Best Practices
1. Use clear, specific instructions in prompts
2. Define variables with descriptive names
3. Test with realistic variable values
4. Review evaluation critiques for improvements 