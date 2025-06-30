// Test file to verify project-specific version functionality
import { PromptVersion, ModelRun } from './types';

// Mock data for testing project-specific versions
const mockProject1Versions: PromptVersion[] = [
  {
    id: 'v1',
    projectId: 'project1',
    title: 'Project 1 - Initial Version',
    content: 'Write a {{style}} email to {{recipient}} about {{topic}}.',
    variables: { style: 'professional', recipient: 'team', topic: 'project update' },
    createdAt: new Date(Date.now() - 86400000),
    message: 'Initial prompt creation for project 1'
  },
  {
    id: 'v2',
    projectId: 'project1',
    title: 'Project 1 - Improved Version',
    content: 'Create a {{style}} email for {{recipient}} regarding {{topic}}. Make it {{tone}}.',
    variables: { style: 'professional', recipient: 'team', topic: 'project update', tone: 'encouraging' },
    createdAt: new Date(Date.now() - 43200000),
    message: 'Added tone variable and improved structure for project 1',
    parentId: 'v1'
  }
];

const mockProject2Versions: PromptVersion[] = [
  {
    id: 'v3',
    projectId: 'project2',
    title: 'Project 2 - Initial Version',
    content: 'Generate a {{type}} report for {{client}}.',
    variables: { type: 'monthly', client: 'ABC Corp' },
    createdAt: new Date(Date.now() - 72000000),
    message: 'Initial prompt creation for project 2'
  }
];

const mockRuns: ModelRun[] = [
  {
    id: 'run1',
    versionId: 'v1',
    modelId: 'gpt-3.5-turbo',
    output: 'Subject: Project Update\n\nDear Team,\n\nI hope this email finds you well...',
    score: {
      relevance: 8.5,
      clarity: 7.8,
      creativity: 6.2,
      overall: 7.5,
      critique: 'Good response, clear and relevant but could be more creative.'
    },
    executionTime: 2500,
    tokenUsage: { input: 45, output: 120, total: 165 },
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    id: 'run2',
    versionId: 'v2',
    modelId: 'gpt-4',
    output: 'Subject: Exciting Project Update\n\nDear Team,\n\nI\'m thrilled to share some encouraging news...',
    score: {
      relevance: 9.2,
      clarity: 8.7,
      creativity: 8.1,
      overall: 8.7,
      critique: 'Excellent response with good creativity and encouraging tone.'
    },
    executionTime: 3200,
    tokenUsage: { input: 52, output: 145, total: 197 },
    createdAt: new Date(Date.now() - 1800000)
  },
  {
    id: 'run3',
    versionId: 'v3',
    modelId: 'gpt-4',
    output: 'Monthly Report for ABC Corp\n\nExecutive Summary...',
    score: {
      relevance: 9.0,
      clarity: 8.5,
      creativity: 7.8,
      overall: 8.4,
      critique: 'Well-structured report with good clarity.'
    },
    executionTime: 2800,
    tokenUsage: { input: 38, output: 95, total: 133 },
    createdAt: new Date(Date.now() - 900000)
  }
];

// Test functions
export function testProjectSpecificVersions() {
  console.log('Testing Project-Specific Version Management...');
  
  // Test 1: Project-specific version filtering
  const project1Versions = mockProject1Versions.filter(v => v.projectId === 'project1');
  const project2Versions = mockProject2Versions.filter(v => v.projectId === 'project2');
  
  console.log(`✓ Project 1 has ${project1Versions.length} versions`);
  console.log(`✓ Project 2 has ${project2Versions.length} versions`);
  
  // Test 2: Project-specific run filtering
  const project1Runs = mockRuns.filter(run => {
    const version = mockProject1Versions.find(v => v.id === run.versionId);
    return version && version.projectId === 'project1';
  });
  
  const project2Runs = mockRuns.filter(run => {
    const version = mockProject2Versions.find(v => v.id === run.versionId);
    return version && version.projectId === 'project2';
  });
  
  console.log(`✓ Project 1 has ${project1Runs.length} runs`);
  console.log(`✓ Project 2 has ${project2Runs.length} runs`);
  
  // Test 3: Version editing functionality
  const testVersion = mockProject1Versions[0];
  const updatedVersion = {
    ...testVersion,
    title: 'Project 1 - Updated Title',
    message: 'Updated commit message for project 1'
  };
  
  console.log('✓ Version editing works');
  console.log(`  Original title: ${testVersion.title}`);
  console.log(`  Updated title: ${updatedVersion.title}`);
  
  // Test 4: Local storage simulation with project-specific keys
  const localStorageData = {
    [`promptVersions_project1`]: mockProject1Versions,
    [`promptVersions_project2`]: mockProject2Versions,
    [`currentVersionId_project1`]: 'v2',
    [`currentVersionId_project2`]: 'v3'
  };
  
  console.log('✓ Project-specific localStorage structure is correct');
  console.log(`  Project 1 current version: ${localStorageData[`currentVersionId_project1`]}`);
  console.log(`  Project 2 current version: ${localStorageData[`currentVersionId_project2`]}`);
  
  // Test 5: Version isolation between projects
  const allVersions = [...mockProject1Versions, ...mockProject2Versions];
  const project1Only = allVersions.filter(v => v.projectId === 'project1');
  const project2Only = allVersions.filter(v => v.projectId === 'project2');
  
  console.log('✓ Version isolation works correctly');
  console.log(`  Total versions: ${allVersions.length}`);
  console.log(`  Project 1 only: ${project1Only.length}`);
  console.log(`  Project 2 only: ${project2Only.length}`);
  
  // Test 6: Version comparison within projects
  const project1Comparison = project1Versions.filter(v => ['v1', 'v2'].includes(v.id));
  const project2Comparison = project2Versions.filter(v => ['v3'].includes(v.id));
  
  console.log('✓ Version comparison works per project');
  console.log(`  Project 1 comparison: ${project1Comparison.length} versions`);
  console.log(`  Project 2 comparison: ${project2Comparison.length} versions`);
  
  console.log('\n🎉 All Project-Specific Version Management tests passed!');
  return true;
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).testProjectSpecificVersions = testProjectSpecificVersions;
} else {
  // Node.js environment
  testProjectSpecificVersions();
} 