'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-slate-950/50 backdrop-blur-md border-b border-slate-800">
      <div className="w-full">
        <div className="flex justify-between h-16 px-0 lg:px-0">
          {/* Logo */}
          <div className="flex items-center pl-4">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">SmartBotz</span>
            </Link>
          </div>

          {/* Navigation Links - Center */}
          <div className="hidden md:flex items-center justify-center space-x-8">
            <Link 
              href="/create" 
              className="border-transparent text-slate-200 hover:text-cyan-400 hover:border-cyan-400 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
            >
              Create
            </Link>
            <Link 
              href="/ide" 
              className="border-transparent text-slate-200 hover:text-cyan-400 hover:border-cyan-400 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
            >
              IDE
            </Link>
            <Link 
              href="/examples" 
              className="border-transparent text-slate-200 hover:text-cyan-400 hover:border-cyan-400 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
            >
              Examples
            </Link>
            <Link 
              href="/docs" 
              className="border-transparent text-slate-200 hover:text-cyan-400 hover:border-cyan-400 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
            >
              Docs
            </Link>
          </div>

          {/* Right side - Login/Signup */}
          <div className="hidden md:flex items-center space-x-4 pr-4">
            <Link 
              href="/login" 
              className="text-slate-200 hover:text-cyan-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white rounded-lg font-medium shadow-lg shadow-cyan-500/20"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden pr-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-slate-900/50 backdrop-blur-md"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="/create" 
              className="text-slate-200 hover:bg-slate-800 hover:text-cyan-400 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Create
            </Link>
            <Link 
              href="/ide" 
              className="text-slate-200 hover:bg-slate-800 hover:text-cyan-400 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              IDE
            </Link>
            <Link 
              href="/examples" 
              className="text-slate-200 hover:bg-slate-800 hover:text-cyan-400 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Examples
            </Link>
            <Link 
              href="/docs" 
              className="text-slate-200 hover:bg-slate-800 hover:text-cyan-400 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Docs
            </Link>
          </div>
          
          <div className="pt-4 pb-3 border-t border-slate-800">
            <div className="px-2 space-y-1">
              <Link 
                href="/login" 
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link 
                href="/signup" 
                className="block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/20"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
} 