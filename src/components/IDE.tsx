'use client';

import { useState, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import { getFiles, createFile, updateFileContent } from '@/services/fileService';
import { FileNode } from './FileTree';

type IDEProps = {
  initialCode?: string;
  initialLanguage?: string;
  height?: string;
  width?: string;
  className?: string;
};

export default function IDE({
  initialCode = '',
  initialLanguage = 'javascript',
  height = '100%',
  width = '100%',
  className = '',
}: IDEProps) {
  const [files, setFiles] = useState<FileNode[]>([]);
  
  // Initialize the IDE with the generated code if provided
  useEffect(() => {
    if (initialCode && initialLanguage) {
      // Create initial files if they don't exist
      const loadedFiles = getFiles();
      
      if (loadedFiles.length === 0) {
        // Create a basic project structure
        createFile('/', 'folder', 'src');
        
        // Create files based on the language
        if (initialLanguage === 'html') {
          const file = createFile('/src', 'file', 'index.html');
          updateFileContent(file.path, initialCode);
        } else if (initialLanguage === 'css') {
          const file = createFile('/src', 'file', 'styles.css');
          updateFileContent(file.path, initialCode);
        } else if (initialLanguage === 'javascript') {
          const file = createFile('/src', 'file', 'main.js');
          updateFileContent(file.path, initialCode);
        } else if (initialLanguage === 'json') {
          const file = createFile('/', 'file', 'package.json');
          updateFileContent(file.path, initialCode);
        }
      }
      
      setFiles(getFiles());
    }
  }, [initialCode, initialLanguage]);
  
  return (
    <div className={`h-full w-full ${className}`} style={{ height, width }}>
      <CodeEditor 
        height={height}
        width={width}
      />
    </div>
  );
} 