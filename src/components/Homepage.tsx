import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  ArrowRight, 
  Sparkles, 
  Target, 
  Beaker, 
  Palette, 
  Code, 
  GitBranch, 
  BarChart3, 
  TestTube, 
  Layers, 
  Workflow,
  Bot,
  Activity,
  Shield,
  GitCompare,
  Eye,
  Brain,
  Cpu,
  Network,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';

const Homepage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-semibold text-black">🦜 LangForge</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-black transition-colors">Features</a>
            <a href="#about" className="text-gray-600 hover:text-black transition-colors">About</a>
            <Link 
              to="/auth" 
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center space-x-2"
            >
              <span>Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">Visual IDE for LangChain & Prompt Engineering</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-black mb-8 leading-tight">
            Build smarter LangChain workflows.
            <span className="text-gray-600"> No code. No clutter.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
            The visual IDE for crafting prompts and building LangChain logic — all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/auth" 
              className="group bg-black text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
            >
              <span>Start Building</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="bg-gray-50 border border-gray-200 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Build Smarter Section */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              <Beaker className="inline w-8 h-8 mr-3" />
              Build Smarter with 🦜 LangForge
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              🦜 LangForge is your unified workspace for creating, testing, and refining prompt-powered applications.
              Whether you're building with LangChain, LangGraph, or custom agents, 🦜 LangForge gives you the precision of code with the clarity of visual design.
            </p>
          </div>
        </div>
      </section>

      {/* Two Views Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              <Palette className="inline w-8 h-8 mr-3" />
              Two Views, One Engine
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-black mb-4">Canvas</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Drag-and-drop chain builder. Design your prompt flow, add memory, create branching logic — visually.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-black mb-4">Editor</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                A code-like prompt editor with syntax highlighting, variable tracking, and real-time testing.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-6 py-3">
              <GitBranch className="w-5 h-5 text-green-700" />
              <span className="text-green-700 font-medium">Synced Instantly</span>
            </div>
            <p className="text-gray-600 mt-4">
              Canvas and Editor stay in perfect sync. Edit anywhere — update everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* New Features Section */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              <Sparkles className="inline w-8 h-8 mr-3" />
              Advanced Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful tools to build, test, and optimize your LangChain workflows:
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Multi-Model Runner</h3>
              <p className="text-gray-600 leading-relaxed">
                Test your prompts across multiple AI models simultaneously. Compare outputs, performance, and costs.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Live Chain Visualization</h3>
              <p className="text-gray-600 leading-relaxed">
                Watch your chain execute in real-time with live metrics, token usage, and execution flow.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <Network className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Variable Flow Visualization</h3>
              <p className="text-gray-600 leading-relaxed">
                Visualize how variables flow between nodes with dependency tracking and health validation.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Chain Health Validation</h3>
              <p className="text-gray-600 leading-relaxed">
                Automatic detection of issues like undeclared variables, unused inputs, and disconnected nodes.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <GitCompare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Version Comparison</h3>
              <p className="text-gray-600 leading-relaxed">
                Compare different versions of your prompts and chains with detailed diff views and rollback.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Conditional Logic</h3>
              <p className="text-gray-600 leading-relaxed">
                Build complex branching logic with conditional connections based on outputs, scores, and variables.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LangChain Support Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              <GitBranch className="inline w-8 h-8 mr-3" />
              Built for LangChain & LangGraph
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              🦜 LangForge natively supports LangChain and LangGraph structures:
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">PromptTemplates</h3>
              <p className="text-gray-600 leading-relaxed">
                ChatPromptTemplates, Message nodes, and all LangChain prompt structures.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <Workflow className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Chain Flows</h3>
              <p className="text-gray-600 leading-relaxed">
                SequentialChain, SimpleSequentialChain, and LangGraph flows.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Memory & Tools</h3>
              <p className="text-gray-600 leading-relaxed">
                Memory, tools, and multi-prompt logic support.
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold text-black mb-4">
                <Brain className="inline w-6 h-6 mr-2" />
                Exports clean, production-ready Python and JS for Langchain
              </h3>
              <p className="text-gray-600">
                No hacks. No guesswork. Just valid, runnable code — every time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Smarter Prompt Engineering Section */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              <CheckCircle className="inline w-8 h-8 mr-3" />
              Smarter Prompt Engineering
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Each prompt is testable, trackable, and evaluated with:
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <TestTube className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-black mb-4">Auto-Generated Tests</h3>
              <p className="text-gray-600 leading-relaxed">
                GPT-4 writes and runs smart tests to validate your prompts' behavior.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-black mb-4">PromptScore</h3>
              <p className="text-gray-600 leading-relaxed">
                AI-based scoring on clarity, relevance, and creativity.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-black mb-4">Analytics Dashboard</h3>
              <p className="text-gray-600 leading-relaxed">
                Track token usage, response time, pass/fail rates, and version trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              <Sparkles className="inline w-8 h-8 mr-3" />
              Start From Templates or Build from Scratch
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">One-click LangGraph templates</h3>
              <p className="text-gray-600 leading-relaxed">
                For agents, QA bots, or workflows.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Save reusable components</h3>
              <p className="text-gray-600 leading-relaxed">
                Save reusable prompts and chain components.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <GitBranch className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Version control & history</h3>
              <p className="text-gray-600 leading-relaxed">
                Version control, diff viewer, and rollback history.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-xl text-gray-600">
              Perfect for rapid prototyping and robust production development.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white border border-gray-200 rounded-2xl p-12">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Ready to forge better LangChain applications?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who are already building amazing things with 🦜 LangForge.
            </p>
            <Link 
              to="/auth" 
              className="inline-flex items-center space-x-2 bg-black text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-all duration-300"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-lg font-semibold text-black">🦜 LangForge</span>
            </div>
                          <p className="text-gray-600">&copy; 2025 🦜 LangForge. Built with AI in mind.</p>
          </div>
          
          {/* Disclaimer */}
          <div className="border-t border-gray-200 pt-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-4xl mx-auto">
              <p className="text-sm text-yellow-800 text-center">
                <strong>Disclaimer:</strong> 🦜 LangForge is not affiliated with, endorsed by, or connected to LangChain, LangGraph, or any of their associated companies or products. 🦜 LangForge is an independent tool designed to work with LangChain and LangGraph frameworks.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;