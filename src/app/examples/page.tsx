'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LampContainer from '@/components/LampContainer';

type Example = {
  title: string;
  description: string;
  prompt: string;
  image: string;
  tags: string[];
};

const examples: Example[] = [
  {
    title: 'Portfolio Website',
    description: 'A modern portfolio with dark mode, animations, and responsive design.',
    prompt: 'Create a personal portfolio website with a home page, about section, projects gallery, and contact form. Use a minimalist design with dark mode support.',
    image: '/examples/portfolio.png',
    tags: ['Next.js', 'React', 'Tailwind CSS', 'Dark Mode']
  },
  {
    title: 'E-commerce Store',
    description: 'A full-featured online store with product catalog and cart.',
    prompt: 'Build an e-commerce website for selling electronics with product listings, shopping cart, and checkout process.',
    image: '/examples/ecommerce.png',
    tags: ['Next.js', 'React', 'Stripe', 'Shopping Cart']
  },
  {
    title: 'Blog Platform',
    description: 'A modern blog with markdown support and dark mode.',
    prompt: 'Create a blog platform with markdown support, categories, search, and dark mode.',
    image: '/examples/blog.png',
    tags: ['Next.js', 'MDX', 'Dark Mode', 'Search']
  }
];

export default function ExamplesPage() {
  const [selectedExample, setSelectedExample] = useState<Example | null>(null);

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
            Example Projects
          </h1>
          <p className="mt-4 text-lg text-slate-200 max-w-2xl">
            Explore what you can build with our AI-powered code generation.
            Click on any example to view the prompt and try it yourself.
          </p>
        </motion.div>
      </LampContainer>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto px-4 pb-16"
      >
        {examples.map((example, index) => (
          <motion.div
            key={example.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 * index, duration: 0.5 }}
            className="group relative"
            onClick={() => setSelectedExample(example)}
          >
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg overflow-hidden hover:border-cyan-500/50 transition-colors cursor-pointer">
              <div className="aspect-video relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
                <img 
                  src={example.image} 
                  alt={example.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{example.title}</h3>
                <p className="text-slate-200 mb-4">{example.description}</p>
                <div className="flex flex-wrap gap-2">
                  {example.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-2 py-1 text-xs rounded-full bg-slate-800 text-cyan-400 border border-cyan-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Example Modal */}
      {selectedExample && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          onClick={() => setSelectedExample(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-2xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-4">{selectedExample.title}</h2>
            <p className="text-slate-200 mb-4">{selectedExample.description}</p>
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold text-cyan-400 mb-2">Prompt:</h3>
              <p className="text-slate-200">{selectedExample.prompt}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => window.location.href = `/create?prompt=${encodeURIComponent(selectedExample.prompt)}`}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white rounded-lg font-medium shadow-lg shadow-cyan-500/20"
              >
                Try This Example
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <Footer />
    </main>
  );
} 