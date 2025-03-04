'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CodeEditor from '@/components/CodeEditor';
import CodePreview from '@/components/CodePreview';
import IDE from '@/components/IDE';
import { generateCode, GeneratedCode, GenerationOptions, Framework } from '@/services/aiService';
import { deployToHosting, DeploymentOptions, DeploymentResult, getAvailableProviders } from '@/services/deploymentService';
import DeviceSwitcher from '@/components/DeviceSwitcher';

// Define types
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type VersionHistory = {
  id: string;
  timestamp: Date;
  prompt: string;
  code: GeneratedCode;
};

type DeviceType = 'desktop' | 'tablet' | 'mobile';

type CreatePageContentProps = {
  initialPrompt?: string;
};

export default function CreatePageContent({ 
  initialPrompt = '' 
}: CreatePageContentProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'css' | 'javascript' | 'packageJson'>('html');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [projectName, setProjectName] = useState('My Generated App');
  const [selectedProvider, setSelectedProvider] = useState<'vercel' | 'netlify' | 'github-pages'>('vercel');
  const [showDeployOptions, setShowDeployOptions] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<Framework>('vanilla');
  
  // Conversation state
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [attachments, setAttachments] = useState<{type: 'image' | 'file' | 'link', url: string, name: string}[]>([]);
  const [lastResponseId, setLastResponseId] = useState<string | null>(null);
  
  // Version history state
  const [versionHistory, setVersionHistory] = useState<VersionHistory[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const deployMenuRef = useRef<HTMLDivElement>(null);
  const versionHistoryRef = useRef<HTMLDivElement>(null);
  const providers = getAvailableProviders();
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [thinkingStage, setThinkingStage] = useState(0);
  const [thinkingText, setThinkingText] = useState('');
  const initialGenerationTriggered = useRef(false);
  const [currentDevice, setCurrentDevice] = useState<DeviceType>('desktop');

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt, currentMessage]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle click outside for deployment dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (deployMenuRef.current && !deployMenuRef.current.contains(event.target as Node)) {
        setShowDeployOptions(false);
      }
      if (versionHistoryRef.current && !versionHistoryRef.current.contains(event.target as Node) && showVersionHistory) {
        setShowVersionHistory(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVersionHistory]);

  // Generate code on initial load if prompt is provided
  useEffect(() => {
    if (initialPrompt && !generatedCode && !isGenerating && messages.length === 0 && !initialGenerationTriggered.current) {
      console.log('Triggering initial code generation from URL prompt');
      initialGenerationTriggered.current = true;
      const dummyEvent = new Event('submit') as any;
      handleSubmit(dummyEvent);
    }
  }, [initialPrompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setAttachments([]);
    
    // Reset the last response ID when starting a new request
    setLastResponseId(null);
    
    // Add user message to conversation if we're refining
    if (isRefining) {
      console.log('Adding user message for refinement:', prompt);
      addMessage('user', prompt);
    } else {
      // Initialize conversation with first prompt
      console.log('Initializing conversation with first prompt:', prompt);
      setMessages([{
        id: Date.now().toString(),
        role: 'user',
        content: prompt,
        timestamp: new Date()
      }]);
    }
    
    // Show AI thinking indicator
    setIsAiThinking(true);
    setThinkingStage(0);
    
    try {
      // Options for code generation
      const options: Partial<GenerationOptions> = {
        type: 'website',
        framework: selectedFramework,
        features: ['responsive', 'contact-form'],
        style: {
          colorScheme: 'blue',
          layout: 'modern',
        },
      };
      
      // Call the API route instead of directly using the aiService
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt, 
          options,
          conversation: isRefining ? messages : [] // Send conversation history if refining
        }),
      });
      
      // Rest of the existing handleSubmit logic would continue here
      // Placeholder for now
      console.log('Generation response:', response);
      
    } catch (error) {
      console.error('Code generation error:', error);
      setIsGenerating(false);
      setIsAiThinking(false);
    }
  };

  // Placeholder for other methods like addMessage

  return (
    <div>
      <h1>Create Page</h1>
      {initialPrompt && <p>Initial Prompt: {initialPrompt}</p>}
      <form onSubmit={handleSubmit}>
        <textarea 
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your code generation prompt"
        />
        <button type="submit">Generate Code</button>
      </form>
      {/* Rest of your page content */}
    </div>
  );
}
