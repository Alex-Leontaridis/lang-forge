import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Sparkles, Target, Beaker } from 'lucide-react';

const Homepage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-black">PromptForge</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-black transition-colors">Features</a>
            <a href="#about" className="text-gray-600 hover:text-black transition-colors">About</a>
            <Link 
              to="/app" 
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center space-x-2"
            >
              <span>Launch App</span>
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
            <span className="text-sm font-medium text-gray-700">AI-Powered Prompt Engineering</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-black mb-8 leading-tight">
            Craft Perfect
            <span className="text-gray-600"> AI Prompts</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
            Write, test, and refine AI prompts with confidence. Get instant feedback with our PromptScore evaluation system and unlock the full potential of AI.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/app" 
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

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Everything you need to master AI prompts
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed for prompt engineers, developers, and AI enthusiasts.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-black mb-4">Smart Editor</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced prompt editor with variable support. Use placeholders like {"{{name}}"} and {"{{topic}}"} for dynamic prompts.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <Beaker className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-black mb-4">PromptScore</h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant feedback on your prompts with AI-powered scoring for relevance, clarity, and creativity.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-black mb-4">Multi-Model</h3>
              <p className="text-gray-600 leading-relaxed">
                Test your prompts across different AI models including GPT-3.5 and GPT-4 for optimal results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Ready to forge better prompts?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of developers and AI enthusiasts who are already building amazing things with PromptForge.
            </p>
            <Link 
              to="/app" 
              className="inline-flex items-center space-x-2 bg-black text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-all duration-300"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-black">PromptForge</span>
          </div>
          <p className="text-gray-600">&copy; 2025 PromptForge. Built with AI in mind.</p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;