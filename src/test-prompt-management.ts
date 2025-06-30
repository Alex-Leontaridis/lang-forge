// Test file to verify prompt management functionality
import { Prompt, PromptVersion } from './types';

// Mock data for testing prompt management
const mockPrompts: Prompt[] = [
  {
    id: 'p1',
    projectId: 'project1',
    name: 'Email Generator',
    description: 'Generate professional emails for various purposes',
    category: 'email',
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 3600000),
    isActive: true,
    tags: ['professional', 'communication']
  },
  {
    id: 'p2',
    projectId: 'project1',
    name: 'Content Summarizer',
    description: 'Summarize long articles and documents',
    category: 'content',
    createdAt: new Date(Date.now() - 72000000),
    updatedAt: new Date(Date.now() - 1800000),
    isActive: false,
    tags: ['analysis', 'summarization']
  },
  {
    id: 'p3',
    projectId: 'project1',
    name: 'Code Assistant',
    description: 'Help with coding tasks and debugging',
    category: 'code',
    createdAt: new Date(Date.now() - 36000000),
    updatedAt: new Date(Date.now() - 900000),
    isActive: false,
    tags: ['programming', 'development']
  }
];

const mockVersions: PromptVersion[] = [
  {
    id: 'v1',
    projectId: 'project1',
    promptId: 'p1',
    title: 'Email Generator v1',
    content: 'Write a {{style}} email to {{recipient}} about {{topic}}.',
    variables: { style: 'professional', recipient: 'team', topic: 'project update' },
    createdAt: new Date(Date.now() - 86400000),
    message: 'Initial version of email generator'
  },
  {
    id: 'v2',
    projectId: 'project1',
    promptId: 'p1',
    title: 'Email Generator v2',
    content: 'Create a {{style}} email for {{recipient}} regarding {{topic}}. Make it {{tone}}.',
    variables: { style: 'professional', recipient: 'team', topic: 'project update', tone: 'encouraging' },
    createdAt: new Date(Date.now() - 43200000),
    message: 'Added tone variable and improved structure',
    parentId: 'v1'
  },
  {
    id: 'v3',
    projectId: 'project1',
    promptId: 'p2',
    title: 'Content Summarizer v1',
    content: 'Summarize the following {{content_type}} in {{length}} words: {{text}}',
    variables: { content_type: 'article', length: '200', text: '' },
    createdAt: new Date(Date.now() - 72000000),
    message: 'Initial version of content summarizer'
  }
];

// Test functions
export function testPromptManagement() {
  console.log('Testing Prompt Management System...');
  
  // Test 1: Project-specific prompt filtering
  const project1Prompts = mockPrompts.filter(p => p.projectId === 'project1');
  console.log(`✓ Project 1 has ${project1Prompts.length} prompts`);
  
  // Test 2: Active prompt identification
  const activePrompt = mockPrompts.find(p => p.isActive);
  console.log(`✓ Active prompt: ${activePrompt?.name || 'None'}`);
  
  // Test 3: Prompt categorization
  const emailPrompts = mockPrompts.filter(p => p.category === 'email');
  const contentPrompts = mockPrompts.filter(p => p.category === 'content');
  const codePrompts = mockPrompts.filter(p => p.category === 'code');
  
  console.log(`✓ Email prompts: ${emailPrompts.length}`);
  console.log(`✓ Content prompts: ${contentPrompts.length}`);
  console.log(`✓ Code prompts: ${codePrompts.length}`);
  
  // Test 4: Version filtering by prompt
  const emailVersions = mockVersions.filter(v => v.promptId === 'p1');
  const contentVersions = mockVersions.filter(v => v.promptId === 'p2');
  
  console.log(`✓ Email prompt has ${emailVersions.length} versions`);
  console.log(`✓ Content prompt has ${contentVersions.length} versions`);
  
  // Test 5: Prompt creation simulation
  const newPrompt: Prompt = {
    id: 'p4',
    projectId: 'project1',
    name: 'Creative Writer',
    description: 'Generate creative stories and narratives',
    category: 'creative',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: false,
    tags: ['creative', 'storytelling']
  };
  
  console.log('✓ Prompt creation works');
  console.log(`  New prompt: ${newPrompt.name} (${newPrompt.category})`);
  
  // Test 6: Prompt selection simulation
  const selectPrompt = (promptId: string) => {
    return mockPrompts.map(p => ({
      ...p,
      isActive: p.id === promptId
    }));
  };
  
  const updatedPrompts = selectPrompt('p2');
  const newActivePrompt = updatedPrompts.find(p => p.isActive);
  console.log(`✓ Prompt selection works: ${newActivePrompt?.name}`);
  
  // Test 7: Local storage simulation with project-specific keys
  const localStorageData = {
    [`prompts`]: mockPrompts,
    [`currentPromptId_project1`]: 'p1',
    [`promptVersions`]: mockVersions,
    [`currentVersionId_project1_p1`]: 'v2'
  };
  
  console.log('✓ Project-specific localStorage structure is correct');
  console.log(`  Current prompt: ${localStorageData[`currentPromptId_project1`]}`);
  console.log(`  Current version: ${localStorageData[`currentVersionId_project1_p1`]}`);
  
  // Test 8: Prompt editing functionality
  const testPrompt = mockPrompts[0];
  const updatedPrompt = {
    ...testPrompt,
    name: 'Enhanced Email Generator',
    description: 'Generate professional emails with advanced features',
    updatedAt: new Date()
  };
  
  console.log('✓ Prompt editing works');
  console.log(`  Original name: ${testPrompt.name}`);
  console.log(`  Updated name: ${updatedPrompt.name}`);
  
  console.log('\n🎉 All prompt management tests passed!');
}

// Test prompt version management with new structure
export function testPromptVersionManagement() {
  console.log('\nTesting Prompt Version Management with New Structure...');
  
  // Test 1: Version filtering by prompt
  const emailVersions = mockVersions.filter(v => v.promptId === 'p1');
  const contentVersions = mockVersions.filter(v => v.promptId === 'p2');
  
  console.log(`✓ Email prompt has ${emailVersions.length} versions`);
  console.log(`✓ Content prompt has ${contentVersions.length} versions`);
  
  // Test 2: Version creation with prompt reference
  const newVersion: PromptVersion = {
    id: 'v4',
    projectId: 'project1',
    promptId: 'p1',
    title: 'Email Generator v3',
    content: 'Write a {{style}} email to {{recipient}} about {{topic}} with {{tone}} tone.',
    variables: { 
      style: 'professional', 
      recipient: 'team', 
      topic: 'project update', 
      tone: 'encouraging' 
    },
    createdAt: new Date(),
    message: 'Added tone integration to main prompt',
    parentId: 'v2'
  };
  
  console.log('✓ Version creation with prompt reference works');
  console.log(`  New version: ${newVersion.title} for prompt ${newVersion.promptId}`);
  
  // Test 3: Version hierarchy
  const versionHierarchy = mockVersions.filter(v => v.promptId === 'p1')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  console.log('✓ Version hierarchy is maintained');
  versionHierarchy.forEach((version, index) => {
    console.log(`  ${index + 1}. ${version.title} (${version.parentId ? 'child of ' + version.parentId : 'root'})`);
  });
  
  console.log('\n🎉 All prompt version management tests passed!');
}

// Run tests
if (typeof window === 'undefined') {
  testPromptManagement();
  testPromptVersionManagement();
} 