'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LampContainer from '@/components/LampContainer';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      // Navigate to create page with the prompt as a query parameter
      router.push(`/create?prompt=${encodeURIComponent(prompt)}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-slate-950">
      <Header />
      
      <LampContainer>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="text-center"
        >
          <h1 className="bg-gradient-to-br from-white to-slate-200 py-4 bg-clip-text text-transparent text-4xl md:text-7xl font-bold tracking-tight">
            Build Apps with <br /> Natural Language
          </h1>
          <p className="mt-4 text-lg text-slate-200 max-w-2xl">
            Describe what you want, and we'll generate the code, preview it, and deploy it for you.
            No coding skills required.
          </p>
          
          <div className="mt-8 max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., I want a personal portfolio website with a home page, about section, projects gallery, and contact form. Use a minimalist design with blue and white colors."
                className="w-full p-4 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent min-h-[150px] resize-none text-white placeholder-slate-400"
                rows={6}
              />
              <div className="mt-4 flex justify-center">
                <button 
                  type="submit" 
                  className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white rounded-lg font-medium shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!prompt.trim()}
                >
                  Generate Code
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Link 
              href="/examples" 
              className="px-8 py-3 bg-slate-900/50 backdrop-blur-md text-slate-300 border border-slate-800 rounded-lg font-medium hover:bg-slate-800/50 transition-colors"
            >
              View Examples
            </Link>
          </div>
        </motion.div>
      </LampContainer>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto px-4 pb-16"
      >
        <FeatureCard 
          title="Describe" 
          description="Use natural language to describe the app you want to build."
          icon="💬"
        />
        <FeatureCard 
          title="Preview" 
          description="See your app come to life in real-time as you refine your description."
          icon="👁️"
        />
        <FeatureCard 
          title="Deploy" 
          description="Publish your app with one click to share it with the world."
          icon="🚀"
        />
      </motion.div>
      
      <Footer />
    </main>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg p-6 hover:bg-slate-800/80 transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-slate-200">{description}</p>
    </div>
  );
} 