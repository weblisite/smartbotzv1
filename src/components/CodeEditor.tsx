'use client';

import { useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { FiSave, FiPlay, FiRefreshCw } from 'react-icons/fi';
import FileTree, { FileNode } from './FileTree';
import { getFiles, getFileByPath, updateFileContent, createFile, renameFile, deleteFile } from '@/services/fileService';

type CodeEditorProps = {
  initialCode?: string;
  initialLanguage?: string;
  height?: string;
  width?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
};

export default function CodeEditor({
  initialCode = '',
  initialLanguage = 'javascript',
  height = '100%',
  width = '100%',
  readOnly = false,
  onChange,
}: CodeEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [isDirty, setIsDirty] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const editorRef = useRef<any>(null);
  
  // Monaco editor needs to be mounted client-side only
  useEffect(() => {
    setMounted(true);
    
    // Load files from the file service
    const loadedFiles = getFiles();
    setFiles(loadedFiles);
    
    // Select the first file by default if available
    if (loadedFiles.length > 0) {
      const firstFile = findFirstFile(loadedFiles);
      if (firstFile) {
        handleFileSelect(firstFile);
      }
    }
  }, []);
  
  // Find the first file in the file tree
  const findFirstFile = (nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.type === 'file') {
        return node;
      }
      if (node.type === 'folder' && node.children && node.children.length > 0) {
        const found = findFirstFile(node.children);
        if (found) return found;
      }
    }
    return null;
  };
  
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
  };
  
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      setIsDirty(true);
      
      if (onChange) {
        onChange(value);
      }
    }
  };
  
  const handleFileSelect = (file: FileNode) => {
    // Check if there are unsaved changes
    if (isDirty && selectedFile) {
      const confirmSave = confirm('You have unsaved changes. Do you want to save them before switching files?');
      if (confirmSave) {
        saveFile();
      }
    }
    
    if (file.type === 'file') {
      setSelectedFile(file);
      setCode(file.content || '');
      setLanguage(file.language || 'plaintext');
      setIsDirty(false);
    }
  };
  
  const handleFileCreate = (parentPath: string, type: 'file' | 'folder') => {
    const name = prompt(`Enter a name for the new ${type}:`);
    if (name && name.trim()) {
      const newFile = createFile(parentPath, type, name.trim());
      setFiles(getFiles());
      
      if (type === 'file') {
        handleFileSelect(newFile);
      }
    }
  };
  
  const handleFileRename = (file: FileNode, newName: string) => {
    if (renameFile(file.path, newName)) {
      setFiles(getFiles());
      
      // If the renamed file is the selected file, update the selected file
      if (selectedFile && selectedFile.path === file.path) {
        const updatedFile = getFileByPath(file.path.replace(file.name, newName));
        if (updatedFile) {
          setSelectedFile(updatedFile);
        }
      }
    }
  };
  
  const handleFileDelete = (file: FileNode) => {
    if (deleteFile(file.path)) {
      setFiles(getFiles());
      
      // If the deleted file is the selected file, select another file
      if (selectedFile && selectedFile.path === file.path) {
        const firstFile = findFirstFile(getFiles());
        if (firstFile) {
          handleFileSelect(firstFile);
        } else {
          setSelectedFile(null);
          setCode('');
          setLanguage('plaintext');
        }
      }
    }
  };
  
  const saveFile = () => {
    if (selectedFile && isDirty) {
      updateFileContent(selectedFile.path, code);
      setIsDirty(false);
      
      // Refresh the file list to reflect any changes
      setFiles(getFiles());
    }
  };
  
  const runCode = () => {
    // Save any unsaved changes first
    if (isDirty) {
      saveFile();
    }
    
    // Create a blob URL for the HTML content
    if (files.length > 0) {
      // Find the HTML file (assuming it's index.html)
      const htmlFile = findFileByName(files, 'index.html');
      if (htmlFile && htmlFile.content) {
        // Create a blob with the HTML content
        const htmlBlob = new Blob([htmlFile.content], { type: 'text/html' });
        const url = URL.createObjectURL(htmlBlob);
        
        // Open the preview in a new tab
        window.open(url, '_blank');
      }
    }
  };
  
  const findFileByName = (nodes: FileNode[], name: string): FileNode | null => {
    for (const node of nodes) {
      if (node.type === 'file' && node.name === name) {
        return node;
      }
      if (node.type === 'folder' && node.children) {
        const found = findFileByName(node.children, name);
        if (found) return found;
      }
    }
    return null;
  };
  
  // Define editor options
  const options = {
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    fontSize: 14,
    readOnly,
    wordWrap: 'on' as const,
    automaticLayout: true,
    lineNumbers: 'on' as const,
    scrollbar: {
      vertical: 'auto' as const,
      horizontal: 'auto' as const,
    },
  };
  
  // Define theme
  const theme = 'vs-dark';
  
  if (!mounted) {
    return (
      <div 
        className="bg-gray-800 text-gray-300 rounded-md p-4 overflow-auto"
        style={{ height }}
      >
        <pre className="text-sm">{code}</pre>
      </div>
    );
  }
  
  return (
    <div className="flex h-full" style={{ width }}>
      {/* File Tree */}
      <FileTree 
        files={files}
        onFileSelect={handleFileSelect}
        onFileCreate={handleFileCreate}
        onFileRename={handleFileRename}
        onFileDelete={handleFileDelete}
        selectedFile={selectedFile}
        className="w-64"
      />
      
      {/* Editor */}
      <div className="flex-grow flex flex-col">
        <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
          <div className="flex space-x-2 items-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-sm text-slate-300 truncate ml-4">
              {selectedFile ? selectedFile.path : 'No file selected'}
              {isDirty && <span className="ml-2 text-yellow-400">•</span>}
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={saveFile}
              disabled={!isDirty || !selectedFile}
              className={`p-1.5 rounded-md ${isDirty ? 'text-cyan-400 hover:bg-slate-700' : 'text-slate-500'}`}
              title="Save"
            >
              <FiSave size={16} />
            </button>
            <button 
              onClick={runCode}
              className="p-1.5 rounded-md text-green-400 hover:bg-slate-700"
              title="Run"
            >
              <FiPlay size={16} />
            </button>
          </div>
        </div>
        <div className="flex-grow">
          {selectedFile ? (
            <Editor
              height="100%"
              language={language}
              value={code}
              theme={theme}
              options={options}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-slate-900 text-slate-400">
              <p>Select a file to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 