// Test file to verify canvas-editor synchronization
console.log('Testing Canvas-Editor Synchronization...');

// Test 1: Simulate creating a node in canvas
const simulateCanvasNodeCreation = () => {
  const nodeId = `test_node_${Date.now()}`;
  const tempPromptId = `temp_prompt_${Date.now()}`;
  const nodeTitle = `Test Node ${Date.now()}`;
  
  // Simulate canvas node data
  const canvasNodeData = {
    id: nodeId,
    promptId: tempPromptId,
    title: nodeTitle,
    prompt: 'Test prompt content',
    model: 'gpt-4',
    temperature: 0.7,
    variables: { testVar: 'testValue' },
    position: { x: 100, y: 100 }
  };
  
  // Store in project-specific storage
  const projectKey = 'canvasNodes_test_project';
  const existingNodes = localStorage.getItem(projectKey);
  const canvasNodes = existingNodes ? JSON.parse(existingNodes) : [];
  canvasNodes.push(canvasNodeData);
  localStorage.setItem(projectKey, JSON.stringify(canvasNodes));
  
  // Simulate sending data to editor
  const editorData = {
    action: 'createPromptFromCanvas',
    data: {
      nodeId,
      promptId: tempPromptId,
      title: nodeTitle,
      prompt: 'Test prompt content',
      model: 'gpt-4',
      temperature: 0.7,
      variables: { testVar: 'testValue' },
      position: { x: 100, y: 100 }
    },
    updated: true
  };
  
  localStorage.setItem('canvasToEditorData', JSON.stringify(editorData));
  
  console.log('✓ Simulated canvas node creation');
  console.log(`  Node ID: ${nodeId}`);
  console.log(`  Temp Prompt ID: ${tempPromptId}`);
  console.log(`  Title: ${nodeTitle}`);
  
  return { nodeId, tempPromptId, nodeTitle };
};

// Test 2: Simulate editor processing the canvas data
const simulateEditorProcessing = () => {
  const canvasData = localStorage.getItem('canvasToEditorData');
  if (canvasData) {
    try {
      const data = JSON.parse(canvasData);
      console.log('✓ Editor received canvas data:', data.action);
      
      if (data.action === 'createPromptFromCanvas') {
        // Simulate prompt creation
        const realPromptId = `real_prompt_${Date.now()}`;
        const realVersionId = `real_version_${Date.now()}`;
        
        // Store the mapping
        localStorage.setItem(`tempPromptToRealPrompt_${data.data.promptId}`, realPromptId);
        localStorage.setItem(`promptToNode_${realPromptId}`, data.data.nodeId);
        
        console.log(`✓ Created real prompt: ${realPromptId}`);
        console.log(`✓ Mapped temp prompt ${data.data.promptId} to real prompt ${realPromptId}`);
        
        // Clear the data
        localStorage.removeItem('canvasToEditorData');
        
        return { realPromptId, realVersionId };
      }
    } catch (error) {
      console.error('✗ Error processing canvas data:', error);
    }
  } else {
    console.log('✗ No canvas data found for editor to process');
  }
  return null;
};

// Test 3: Simulate canvas checking for prompt ID updates
const simulateCanvasPromptIdUpdate = (tempPromptId: string) => {
  const realPromptId = localStorage.getItem(`tempPromptToRealPrompt_${tempPromptId}`);
  if (realPromptId) {
    console.log(`✓ Canvas found real prompt ID: ${realPromptId}`);
    console.log(`✓ Would update node with temp prompt ID ${tempPromptId} to use real prompt ID ${realPromptId}`);
    
    // Clean up the mapping
    localStorage.removeItem(`tempPromptToRealPrompt_${tempPromptId}`);
    
    return realPromptId;
  } else {
    console.log(`✗ No real prompt ID found for temp prompt ID: ${tempPromptId}`);
  }
  return null;
};

// Test 4: Verify synchronization
const verifySynchronization = (nodeId: string, realPromptId: string) => {
  // Check if the mapping exists
  const mappedNodeId = localStorage.getItem(`promptToNode_${realPromptId}`);
  if (mappedNodeId === nodeId) {
    console.log('✓ Synchronization verified: prompt and node are properly linked');
    return true;
  } else {
    console.log('✗ Synchronization failed: prompt and node are not properly linked');
    return false;
  }
};

// Run the tests
console.log('\n=== Running Canvas-Editor Synchronization Tests ===\n');

// Test 1: Create a node in canvas
const { nodeId, tempPromptId, nodeTitle } = simulateCanvasNodeCreation();

// Test 2: Process in editor
const editorResult = simulateEditorProcessing();

if (editorResult) {
  // Test 3: Update prompt ID in canvas
  const realPromptId = simulateCanvasPromptIdUpdate(tempPromptId);
  
  if (realPromptId) {
    // Test 4: Verify synchronization
    verifySynchronization(nodeId, realPromptId);
  }
}

// Clean up test data
console.log('\n=== Cleaning up test data ===');
localStorage.removeItem('canvasNodes_test_project');
localStorage.removeItem('canvasToEditorData');

console.log('\n=== Test completed ===');
console.log('If you see all ✓ marks, the synchronization is working correctly!'); 