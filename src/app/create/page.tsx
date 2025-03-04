'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CodeEditor from '@/components/CodeEditor';
import CodePreview from '@/components/CodePreview';
import IDE from '@/components/IDE';
import { generateCode, GeneratedCode, GenerationOptions, Framework } from '@/services/aiService';
import { deployToHosting, DeploymentOptions, DeploymentResult, getAvailableProviders } from '@/services/deploymentService';
import DeviceSwitcher from '@/components/DeviceSwitcher';

// Define a type for conversation messages
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

// Define a type for version history
type VersionHistory = {
  id: string;
  timestamp: Date;
  prompt: string;
  code: GeneratedCode;
};

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export default function CreatePage() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';
  
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
      handleSubmit(new Event('submit') as any);
    }
  }, [initialPrompt]);

  // Thinking animation effect
  useEffect(() => {
    if (!isAiThinking) {
      setThinkingStage(0);
      setThinkingText('');
      return;
    }

    const thinkingMessages = [
      "Analyzing your request...",
      "Planning HTML/CSS/JS structure...",
      "Designing responsive layout...",
      "Implementing requested features...",
      "Optimizing code for performance..."
    ];

    // Start with first message
    setThinkingText(thinkingMessages[0]);
    
    // Progress through thinking stages
    const interval = setInterval(() => {
      setThinkingStage(prev => {
        const nextStage = prev + 1;
        if (nextStage < thinkingMessages.length) {
          setThinkingText(thinkingMessages[nextStage]);
          return nextStage;
        }
        return prev;
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isAiThinking]);

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
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const code = await response.json();
      console.log('Generated code:', code);
      setGeneratedCode(code);
      
      // Add to version history
      const newVersion: VersionHistory = {
        id: Date.now().toString(),
        timestamp: new Date(),
        prompt,
        code
      };
      
      setVersionHistory(prev => [...prev, newVersion]);
      
      // Add assistant response to conversation
      if (isRefining) {
        console.log('Adding assistant refinement response');
        addMessage('assistant', 'I\'ve updated your website based on your feedback.');
      } else {
        console.log('Adding assistant initial response');
        addMessage('assistant', 'I\'ve created your website based on your description. You can now refine it by sending additional requests.');
        setIsRefining(true);
      }
      
      // Clear the prompt input after generation
      setPrompt('');
      
    } catch (error) {
      console.error('Error generating code:', error);
      // Handle error state
      addMessage('assistant', 'Sorry, there was an error generating your code. Please try again.');
    } finally {
      setIsGenerating(false);
      setIsAiThinking(false);
    }
  };

  const handleRefinementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMessage.trim() || isGenerating) return;
    
    // Set the prompt to the current message and trigger the submit
    setPrompt(currentMessage);
    setCurrentMessage('');
    // Keep attachments for the API call in handleSubmit
    
    // Show AI thinking indicator
    setIsAiThinking(true);
    setThinkingStage(0);
    
    // Use setTimeout to ensure state is updated before handleSubmit is called
    setTimeout(() => {
      handleSubmit(e);
    }, 0);
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    // Add attachment info to the message if there are any
    let messageContent = content;
    if (role === 'user' && attachments.length > 0) {
      const attachmentText = attachments.map(a => 
        `[${a.type === 'image' ? '📷' : a.type === 'file' ? '📎' : '🔗'} ${a.name}]`
      ).join(' ');
      messageContent = `${content}\n${attachmentText}`;
    }
    
    // Generate a unique ID for this message
    const messageId = Date.now().toString();
    
    // For assistant messages, check if we've already added a response for the current request
    if (role === 'assistant') {
      // Check if there's already a message with the same content
      const existingMessage = messages.find(m => m.role === 'assistant' && m.content === messageContent);
      if (existingMessage) {
        console.log('Preventing duplicate assistant message with identical content');
        return;
      }
      
      // If this is the same response (based on content and timing), don't add it again
      if (lastResponseId && content === messages.find(m => m.id === lastResponseId)?.content) {
        console.log('Preventing duplicate assistant message with same content');
        return;
      }
      
      // Update the last response ID
      setLastResponseId(messageId);
    }
    
    const newMessage: Message = {
      id: messageId,
      role,
      content: messageContent,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
  };

  const handleDeploy = async () => {
    if (!generatedCode) return;
    
    setIsDeploying(true);
    
    // Reset the last response ID to prevent duplicate messages
    setLastResponseId(null);
    
    try {
      // Call the deployment service
      const options: DeploymentOptions = {
        provider: selectedProvider,
        projectName,
        isPublic: true,
      };
      
      const result = await deployToHosting(generatedCode, options);
      setDeploymentResult(result);
      
      // Show success notification
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 5000);
      
      // Add deployment message to conversation
      addMessage('assistant', `Your website has been successfully deployed to ${result.url}`);
      
    } catch (error) {
      console.error('Error deploying code:', error);
      // Handle error state
      addMessage('assistant', 'Sorry, there was an error deploying your website. Please try again.');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // For demo purposes, we'll just store the file name
    // In a real app, you would upload to a server and get a URL
    const file = files[0];
    setAttachments(prev => [...prev, {
      type,
      url: URL.createObjectURL(file), // Create a temporary URL
      name: file.name
    }]);
    
    // Reset the input
    e.target.value = '';
  };
  
  const handleAddLink = () => {
    const url = window.prompt('Enter the URL:');
    if (!url) return;
    
    try {
      new URL(url); // Validate URL
      setAttachments(prev => [...prev, {
        type: 'link',
        url,
        name: url.replace(/^https?:\/\//, '').split('/')[0] // Extract domain as name
      }]);
    } catch (e) {
      alert('Please enter a valid URL');
    }
  };
  
  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const newAttachments = [...prev];
      // Revoke object URL if it's a file or image
      if (newAttachments[index].type !== 'link') {
        URL.revokeObjectURL(newAttachments[index].url);
      }
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  };

  // Function to restore a previous version
  const restoreVersion = (version: VersionHistory) => {
    setIsRestoring(true);
    
    // Set the code from the selected version
    setGeneratedCode(version.code);
    
    // Reset the last response ID to prevent duplicate messages
    setLastResponseId(null);
    
    // Add a message to the conversation
    addMessage('assistant', `I've restored your website to the version from ${version.timestamp.toLocaleString()}.`);
    
    // Close the version history panel
    setShowVersionHistory(false);
    setIsRestoring(false);
  };

  // Update the CodeEditor component to handle framework-specific languages
  const getLanguageForEditor = (tab: string): "html" | "css" | "javascript" | "json" => {
    if (tab === 'html') return 'html';
    if (tab === 'css') return 'css';
    if (tab === 'javascript') return 'javascript';
    if (tab === 'packageJson') return 'json';
    return 'html';
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <Header />
      
      <main className="flex-grow flex flex-col">
        <div className="flex flex-col md:flex-row h-[calc(100vh-64px-64px)] max-h-screen">
          {/* Left sidebar - Prompt input and conversation */}
          <div className="w-full md:w-1/3 lg:w-1/4 border-r border-slate-800 flex flex-col h-full">
            <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold mb-2 bg-gradient-to-br from-slate-300 to-slate-500 bg-clip-text text-transparent">AI Website Builder</h2>
                
                {/* Version History Button */}
                {versionHistory.length > 0 && (
                  <button
                    onClick={() => setShowVersionHistory(!showVersionHistory)}
                    className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    History
                  </button>
                )}
              </div>
              <p className="text-slate-400 mb-2">
                {isRefining 
                  ? "Refine your website with additional requests" 
                  : "Describe your website and our AI will build it for you."}
              </p>
              
              {/* Framework selection */}
              {!isRefining && (
                <div className="mt-2">
                  <p className="text-xs text-slate-300 mb-1">
                    We'll create your website using modern HTML, CSS, and JavaScript
                  </p>
                </div>
              )}
              
              {/* Version History Panel */}
              {showVersionHistory && (
                <div 
                  ref={versionHistoryRef}
                  className="absolute left-0 right-0 mt-2 mx-4 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-50"
                >
                  <div className="p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold bg-gradient-to-br from-slate-300 to-slate-500 bg-clip-text text-transparent">Version History</h3>
                      <button
                        onClick={() => setShowVersionHistory(false)}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {versionHistory.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No versions yet</p>
                      ) : (
                        <ul className="space-y-2">
                          {versionHistory.map((version, index) => (
                            <li 
                              key={version.id}
                              className="border border-slate-700 rounded-md p-2 hover:bg-slate-700 transition-colors cursor-pointer"
                              onClick={() => restoreVersion(version)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-xs font-medium text-cyan-400">
                                    Version {index + 1}
                                    <span className="ml-2 text-slate-400">
                                      🌐 HTML/CSS/JS
                                    </span>
                                  </p>
                                  <p className="text-xs text-slate-300 truncate max-w-[200px]">
                                    {version.prompt}
                                  </p>
                                </div>
                                <span className="text-xs text-slate-400">
                                  {version.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Conversation history */}
            <div className="flex-grow overflow-y-auto p-4 bg-slate-900 flex flex-col min-h-[300px] h-[calc(100vh-400px)] relative">
              <div className="absolute inset-0 bg-cyan-500 opacity-5 blur-3xl rounded-full -top-20 -left-20 w-64 h-64 z-0"></div>
              <div className="absolute inset-0 bg-cyan-400 opacity-5 blur-2xl rounded-full -bottom-10 -right-10 w-64 h-64 z-0"></div>
              
              {isRefining && (
                <div className="mb-3 pb-2 border-b border-slate-800 relative z-10">
                  <h3 className="text-sm font-medium text-cyan-400 mb-1">Conversation History</h3>
                  <p className="text-xs text-slate-400">Previous messages are shown below</p>
                </div>
              )}
              <div className="flex-grow">
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {messages.map((message, index) => (
                        <motion.div 
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${index === messages.length - 1 ? 'animate-fadeIn' : ''}`}
                        >
                          {message.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mr-2 flex-shrink-0 shadow-lg shadow-slate-500/20">
                              <span className="text-white text-xs font-bold">AI</span>
                            </div>
                          )}
                          <div 
                            className={`max-w-[85%] rounded-lg p-3 ${
                              message.role === 'user' 
                                ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-md backdrop-blur-sm' 
                                : 'bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-700 text-slate-200 shadow-md backdrop-blur-sm'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {message.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center ml-2 flex-shrink-0 shadow-lg shadow-cyan-500/20">
                              <span className="text-white text-xs font-bold">You</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                      
                      {/* AI Thinking Indicator */}
                      {isAiThinking && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex justify-start animate-fadeIn"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mr-2 flex-shrink-0 shadow-lg shadow-slate-500/20">
                            <span className="text-white text-xs font-bold">AI</span>
                          </div>
                          <div className="max-w-[85%] rounded-lg p-3 bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-700 text-slate-200 shadow-md backdrop-blur-sm">
                            <div className="flex flex-col">
                              <div className="flex items-center mb-2">
                                <div className="mr-2 text-sm font-medium text-cyan-400">{thinkingText}</div>
                                <div className="flex space-x-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0ms' }}></div>
                                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '600ms' }}></div>
                                </div>
                              </div>
                              
                              {/* Progress indicators */}
                              <div className="space-y-2 text-xs text-slate-300">
                                {thinkingStage >= 1 && (
                                  <div className="flex items-center">
                                    <svg className="w-3 h-3 mr-1 text-cyan-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                    </svg>
                                    <span>Creating HTML structure</span>
                                  </div>
                                )}
                                
                                {thinkingStage >= 2 && (
                                  <div className="flex items-center">
                                    <svg className="w-3 h-3 mr-1 text-cyan-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                    </svg>
                                    <span>Implementing responsive design with modern CSS</span>
                                  </div>
                                )}
                                
                                {thinkingStage >= 3 && (
                                  <div className="flex items-center">
                                    <svg className="w-3 h-3 mr-1 text-cyan-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                    </svg>
                                    <span>Adding interactive elements and functionality</span>
                                  </div>
                                )}
                                
                                {thinkingStage >= 4 && (
                                  <div className="flex items-center">
                                    <svg className="w-3 h-3 mr-1 text-cyan-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                    </svg>
                                    <span>Finalizing and optimizing code</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-center py-8 relative z-10">
                    <div>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <p className="mb-2 text-slate-300">No conversation yet</p>
                      <p className="text-sm">Describe your website to get started</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Input area */}
            <div className="p-4 border-t border-slate-800 mt-auto bg-gradient-to-b from-slate-900 to-slate-800 relative">
              <div className="absolute inset-0 bg-cyan-500 opacity-5 blur-xl rounded-full -top-10 left-1/2 transform -translate-x-1/2 w-64 h-16 z-0"></div>
              {!isRefining ? (
                <form onSubmit={handleSubmit} className="mb-4">
                  <div className="mb-4">
                    <textarea
                      ref={textareaRef}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe your website in detail..."
                      className="input w-full min-h-[150px] resize-none bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:ring-cyan-500 relative z-10"
                      rows={6}
                    />
                    
                    {/* Attachments display */}
                    {attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {attachments.map((attachment, index) => (
                          <div key={index} className="bg-slate-700 rounded-md px-2 py-1 flex items-center text-xs text-slate-200">
                            <span className="mr-1">
                              {attachment.type === 'image' ? '📷' : attachment.type === 'file' ? '📎' : '🔗'}
                            </span>
                            <span className="truncate max-w-[150px]">{attachment.name}</span>
                            <button 
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="ml-2 text-slate-400 hover:text-slate-200"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Attachment options */}
                    <div className="mt-2 flex space-x-2">
                      <label className="btn-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded px-2 py-1 text-xs cursor-pointer flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Image
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, 'image')}
                          disabled={isGenerating}
                        />
                      </label>
                      
                      <label className="btn-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded px-2 py-1 text-xs cursor-pointer flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        File
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, 'file')}
                          disabled={isGenerating}
                        />
                      </label>
                      
                      <button
                        type="button"
                        className="btn-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded px-2 py-1 text-xs flex items-center"
                        onClick={handleAddLink}
                        disabled={isGenerating}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-400">
                      {isGenerating ? 'Generating...' : 'Be specific for better results'}
                    </div>
                    <button 
                      type="submit" 
                      className="btn bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white border-0 shadow-lg shadow-cyan-700/30"
                      disabled={isGenerating || !prompt.trim()}
                    >
                      {isGenerating ? 'Generating...' : 'Create Website'}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="mb-2 text-sm font-medium text-slate-300">
                    Conversation History
                  </div>
                  <form onSubmit={handleRefinementSubmit}>
                    <div className="flex items-stretch space-x-2">
                      <textarea
                        ref={textareaRef}
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        placeholder="Request changes or new features..."
                        className="input flex-grow resize-none bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:ring-cyan-500 relative z-10"
                        rows={2}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && !attachments.length) {
                            e.preventDefault();
                            handleRefinementSubmit(e);
                          }
                        }}
                      />
                      <button 
                        type="submit" 
                        className="btn px-4 flex items-center justify-center bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white border-0 shadow-lg shadow-cyan-700/30 relative z-10"
                        disabled={isGenerating || !currentMessage.trim()}
                      >
                        {isGenerating ? (
                          <span className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    
                    {/* Attachments display */}
                    {attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {attachments.map((attachment, index) => (
                          <div key={index} className="bg-slate-700 rounded-md px-2 py-1 flex items-center text-xs text-slate-200">
                            <span className="mr-1">
                              {attachment.type === 'image' ? '📷' : attachment.type === 'file' ? '📎' : '🔗'}
                            </span>
                            <span className="truncate max-w-[150px]">{attachment.name}</span>
                            <button 
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="ml-2 text-slate-400 hover:text-slate-200"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Attachment options */}
                    <div className="mt-2 flex space-x-2">
                      <label className="btn-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded px-2 py-1 text-xs cursor-pointer flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Image
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, 'image')}
                          disabled={isGenerating}
                        />
                      </label>
                      
                      <label className="btn-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded px-2 py-1 text-xs cursor-pointer flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        File
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, 'file')}
                          disabled={isGenerating}
                        />
                      </label>
                      
                      <button
                        type="button"
                        className="btn-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded px-2 py-1 text-xs flex items-center"
                        onClick={handleAddLink}
                        disabled={isGenerating}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Link
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
          
          {/* Right content - Preview/Code */}
          <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col bg-slate-950">
            {generatedCode ? (
              <>
                <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
                  <div className="flex justify-between items-center px-4">
                    <div className="flex h-12">
                      <button
                        className={`px-4 h-full flex items-center font-medium ${
                          activeTab === 'preview' 
                            ? 'text-cyan-400 border-b-2 border-cyan-500' 
                            : 'text-slate-400 hover:text-cyan-300'
                        }`}
                        onClick={() => setActiveTab('preview')}
                      >
                        Preview
                      </button>
                      <button
                        className={`px-4 h-full flex items-center font-medium ${
                          activeTab === 'code' 
                            ? 'text-cyan-400 border-b-2 border-cyan-500' 
                            : 'text-slate-400 hover:text-cyan-300'
                        }`}
                        onClick={() => setActiveTab('code')}
                      >
                        Code
                      </button>
                    </div>
                    
                    {/* Deployment options in header */}
                    {generatedCode && (
                      <div className="flex h-12 items-center gap-2">
                        <DeviceSwitcher 
                          currentDevice={currentDevice} 
                          onDeviceChange={setCurrentDevice} 
                        />
                        <div className="relative group" ref={deployMenuRef}>
                          <button 
                            className="btn bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white border-0 shadow-lg shadow-cyan-700/30 px-4 h-8 flex items-center"
                            onClick={() => setShowDeployOptions(!showDeployOptions)}
                          >
                            <span className="mr-2">Deploy</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          {showDeployOptions && (
                            <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-50">
                              <div className="p-3">
                                <h3 className="text-sm font-semibold mb-2 bg-gradient-to-br from-slate-300 to-slate-500 bg-clip-text text-transparent">Deployment Options</h3>
                                <div className="mb-3">
                                  <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Project Name
                                  </label>
                                  <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="input w-full bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:ring-cyan-500 text-sm py-1"
                                    placeholder="My Generated App"
                                  />
                                </div>
                                
                                <div className="mb-3">
                                  <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Hosting Provider
                                  </label>
                                  <div className="grid grid-cols-1 gap-1">
                                    {providers.map((provider) => (
                                      <button
                                        key={provider.id}
                                        onClick={() => setSelectedProvider(provider.id)}
                                        className={`p-1.5 border rounded-md flex items-center justify-between transition-all text-sm ${
                                          selectedProvider === provider.id
                                            ? 'border-cyan-600 bg-slate-700 text-cyan-400'
                                            : 'border-slate-600 hover:border-cyan-700 bg-slate-700'
                                        }`}
                                      >
                                        <div className="flex items-center">
                                          <div className="text-sm mr-2 text-cyan-400">
                                            {provider.id === 'vercel' && '▲'}
                                            {provider.id === 'netlify' && '◆'}
                                            {provider.id === 'github-pages' && '●'}
                                          </div>
                                          <div className="font-medium text-slate-300 text-xs">{provider.name}</div>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => {
                                    handleDeploy();
                                    setShowDeployOptions(false);
                                  }}
                                  disabled={isDeploying}
                                  className="btn bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white border-0 shadow-lg shadow-cyan-700/30 w-full text-sm py-1.5"
                                >
                                  {isDeploying ? 'Deploying...' : 'Deploy Website'}
                                </button>
                              </div>
                              
                              {deploymentResult && (
                                <div className="mt-1 p-3 bg-slate-700 border-t border-slate-600 rounded-b-md">
                                  <p className="text-cyan-400 font-medium mb-1 text-xs">Deployment Successful!</p>
                                  <a
                                    href={deploymentResult.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-300 text-xs hover:underline"
                                  >
                                    {deploymentResult.url}
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-grow bg-slate-950 relative">
                  <div className="absolute inset-0 bg-cyan-500 opacity-5 blur-3xl rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 z-0"></div>
                  <div className="h-[calc(100vh-130px)] m-4 flex flex-col">
                    {activeTab === 'preview' ? (
                      <div className="h-full w-full overflow-hidden rounded-lg border border-slate-800">
                        <CodePreview 
                          code={generatedCode.fullCode} 
                          height="100%" 
                          currentDevice={currentDevice}
                        />
                      </div>
                    ) : (
                      <div className="h-full flex flex-col">
                        <IDE 
                          initialCode={activeCodeTab === 'html' ? generatedCode.html : 
                                      activeCodeTab === 'css' ? generatedCode.css : 
                                      activeCodeTab === 'javascript' ? generatedCode.javascript : 
                                      activeCodeTab === 'packageJson' ? generatedCode.packageJson : ''}
                          initialLanguage={getLanguageForEditor(activeCodeTab)}
                          height="100%"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-grow flex items-center justify-center p-8">
                {isGenerating ? (
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
                    <p className="text-xl font-medium text-gray-700">Generating your website...</p>
                    <p className="text-gray-500 mt-2">This may take a few moments</p>
                  </div>
                ) : (
                  <div className="text-center max-w-md">
                    <div className="text-5xl mb-4">👨‍💻</div>
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">Describe Your Website</h2>
                    <p className="text-gray-500">
                      Enter a detailed description of the website you want to create in the form on the left, 
                      then click "Create Website" to generate your custom website.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Success notification */}
      {showSuccessNotification && (
        <div className="fixed bottom-4 right-4 bg-slate-800 border border-cyan-600 rounded-lg shadow-lg p-4 max-w-md animate-fadeIn z-50">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <svg className="h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium text-cyan-400">Deployment successful!</p>
              <p className="mt-1 text-sm text-slate-300">
                Your website has been deployed to:
              </p>
              {deploymentResult && (
                <a 
                  href={deploymentResult.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-1 text-sm text-cyan-300 hover:underline"
                >
                  {deploymentResult.url}
                </a>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-slate-800 rounded-md inline-flex text-slate-400 hover:text-slate-200"
                onClick={() => setShowSuccessNotification(false)}
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 