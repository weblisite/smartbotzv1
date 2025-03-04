'use client';

import { useState } from 'react';
import IDE from '@/components/IDE';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function IDEPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      
      <div className="flex-grow flex flex-col">
        <div className="p-4 bg-slate-900 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-slate-200">Web IDE</h1>
          <p className="text-slate-400">Create and edit web projects with our integrated development environment</p>
        </div>
        
        <div className="flex-grow">
          <IDE height="calc(100vh - 200px)" />
        </div>
      </div>
      
      <Footer />
    </main>
  );
} 