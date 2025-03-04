'use client';

import { useState, useEffect } from 'react';
import { FiFolder, FiFolderPlus, FiFile, FiChevronRight, FiChevronDown, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';

export type FileNode = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  language?: string;
  path: string;
  isOpen?: boolean;
  isNew?: boolean;
  isEditing?: boolean;
};

type FileTreeProps = {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  onFileCreate: (parentPath: string, type: 'file' | 'folder') => void;
  onFileRename: (file: FileNode, newName: string) => void;
  onFileDelete: (file: FileNode) => void;
  selectedFile?: FileNode | null;
  className?: string;
};

export default function FileTree({
  files,
  onFileSelect,
  onFileCreate,
  onFileRename,
  onFileDelete,
  selectedFile,
  className = '',
}: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');

  useEffect(() => {
    // Initialize expanded state for folders
    const initialExpandedState: Record<string, boolean> = {};
    const initializeExpandedState = (nodes: FileNode[]) => {
      nodes.forEach(node => {
        if (node.type === 'folder') {
          initialExpandedState[node.path] = node.isOpen || false;
          if (node.children) {
            initializeExpandedState(node.children);
          }
        }
      });
    };
    
    initializeExpandedState(files);
    setExpandedFolders(initialExpandedState);
  }, [files]);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleFileClick = (file: FileNode) => {
    if (file.type === 'folder') {
      toggleFolder(file.path);
    } else {
      onFileSelect(file);
    }
  };

  const startRenaming = (file: FileNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFile(file.id);
    setNewFileName(file.name);
  };

  const handleRename = (file: FileNode, e: React.FormEvent) => {
    e.preventDefault();
    if (newFileName.trim() && newFileName !== file.name) {
      onFileRename(file, newFileName);
    }
    setEditingFile(null);
  };

  const handleDelete = (file: FileNode, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${file.name}?`)) {
      onFileDelete(file);
    }
  };

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map(node => {
      const isFolder = node.type === 'folder';
      const isExpanded = expandedFolders[node.path];
      const isSelected = selectedFile?.id === node.id;
      const isEditing = editingFile === node.id;
      
      return (
        <div key={node.id} style={{ paddingLeft: `${level * 16}px` }}>
          <div 
            className={`flex items-center py-1 px-2 rounded-md cursor-pointer group hover:bg-slate-800 ${isSelected ? 'bg-slate-800 text-cyan-400' : 'text-slate-300'}`}
            onClick={() => handleFileClick(node)}
          >
            <div className="mr-1 text-slate-500">
              {isFolder ? (
                isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />
              ) : null}
            </div>
            
            <div className="mr-2 text-slate-400">
              {isFolder ? (
                isExpanded ? <FiFolder size={14} /> : <FiFolder size={14} />
              ) : (
                <FiFile size={14} />
              )}
            </div>
            
            {isEditing ? (
              <form onSubmit={(e) => handleRename(node, e)} className="flex-grow">
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  autoFocus
                  onBlur={(e) => handleRename(node, e)}
                  className="bg-slate-700 text-slate-200 text-sm py-0 px-1 rounded w-full"
                />
              </form>
            ) : (
              <span className="text-sm flex-grow truncate">{node.name}</span>
            )}
            
            {!isEditing && (
              <div className="hidden group-hover:flex ml-2">
                <button 
                  onClick={(e) => startRenaming(node, e)} 
                  className="p-1 text-slate-400 hover:text-cyan-400"
                >
                  <FiEdit2 size={12} />
                </button>
                <button 
                  onClick={(e) => handleDelete(node, e)} 
                  className="p-1 text-slate-400 hover:text-red-400"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            )}
          </div>
          
          {isFolder && isExpanded && node.children && (
            <div>
              {renderFileTree(node.children, level + 1)}
              <div 
                className="flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-slate-800 text-slate-400"
                style={{ paddingLeft: `${(level + 1) * 16}px` }}
                onClick={(e) => {
                  e.stopPropagation();
                  onFileCreate(node.path, 'file');
                }}
              >
                <div className="mr-2">
                  <FiPlus size={14} />
                </div>
                <span className="text-sm">New File</span>
              </div>
              <div 
                className="flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-slate-800 text-slate-400"
                style={{ paddingLeft: `${(level + 1) * 16}px` }}
                onClick={(e) => {
                  e.stopPropagation();
                  onFileCreate(node.path, 'folder');
                }}
              >
                <div className="mr-2">
                  <FiFolderPlus size={14} />
                </div>
                <span className="text-sm">New Folder</span>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className={`bg-slate-900 border-r border-slate-800 overflow-y-auto ${className}`}>
      <div className="p-2 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
        <h3 className="text-sm font-medium text-slate-300">Files</h3>
        <div className="flex">
          <button 
            onClick={() => onFileCreate('/', 'file')}
            className="p-1 text-slate-400 hover:text-cyan-400"
            title="New File"
          >
            <FiFile size={14} />
          </button>
          <button 
            onClick={() => onFileCreate('/', 'folder')}
            className="p-1 text-slate-400 hover:text-cyan-400"
            title="New Folder"
          >
            <FiFolder size={14} />
          </button>
        </div>
      </div>
      <div className="p-2">
        {renderFileTree(files)}
      </div>
    </div>
  );
} 