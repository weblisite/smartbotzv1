'use client';

import { useState, useEffect, useRef } from 'react';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

type CodePreviewProps = {
  code: string;
  height?: string;
  currentDevice: DeviceType;
};

const deviceWidths = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px'
};

export default function CodePreview({ code, height = '500px', currentDevice }: CodePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (code) {
      // Create a blob URL for the preview
      const blob = new Blob([code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setLoading(false);
      
      // Clean up the URL when the component unmounts or code changes
      return () => {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
      };
    }
  }, [code]);
  
  // Adjust iframe height based on content
  useEffect(() => {
    const adjustIframeHeight = () => {
      if (iframeRef.current) {
        try {
          // Try to get the scroll height of the iframe content
          const iframe = iframeRef.current;
          const contentWindow = iframe.contentWindow;
          
          if (!contentWindow) return;
          
          const iframeDocument = iframe.contentDocument || contentWindow.document;
          
          if (iframeDocument && iframeDocument.body) {
            // Set minimum height to ensure visibility
            const contentHeight = Math.max(
              iframeDocument.body.scrollHeight,
              iframeDocument.documentElement.scrollHeight,
              500 // Minimum height in pixels
            );
            
            // Add some buffer to avoid scrollbars
            iframe.style.height = `${contentHeight + 50}px`;
          }
        } catch (e) {
          console.error('Error adjusting iframe height:', e);
        }
      }
    };
    
    // Add load event listener to iframe
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', adjustIframeHeight);
      
      // Also set a timeout to adjust height after content has likely rendered
      const timeoutId = setTimeout(adjustIframeHeight, 1000);
      
      return () => {
        iframe.removeEventListener('load', adjustIframeHeight);
        clearTimeout(timeoutId);
      };
    }
  }, [previewUrl]);
  
  return (
    <div className="h-full w-full relative flex flex-col">
      {loading || !previewUrl ? (
        <div className="flex h-full w-full items-center justify-center bg-slate-900 rounded-lg">
          <div className="text-center">
            <div className="mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-cyan-500"></div>
            <p className="text-sm text-slate-400">Preparing preview...</p>
          </div>
        </div>
      ) : (
        <div className="relative flex-1 w-full rounded-lg overflow-hidden flex justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 to-purple-900/10 pointer-events-none z-10 opacity-50"></div>
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl"></div>
          <div 
            className={`h-full transition-all duration-300 ${
              currentDevice !== 'desktop' ? 'border-x border-slate-700 shadow-lg' : ''
            }`}
            style={{ width: deviceWidths[currentDevice] }}
          >
            <iframe
              ref={iframeRef}
              src={previewUrl}
              className="h-full w-full border-0 bg-white rounded-lg"
              sandbox="allow-scripts allow-same-origin"
              scrolling="auto"
            />
          </div>
        </div>
      )}
    </div>
  );
} 