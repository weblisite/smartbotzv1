import { v4 as uuidv4 } from 'uuid';
import { FileNode } from '@/components/FileTree';

// In-memory file system for demo purposes
// In a real application, this would be connected to a backend
let fileSystem: FileNode[] = [
  {
    id: uuidv4(),
    name: 'src',
    type: 'folder',
    path: '/src',
    isOpen: true,
    children: [
      {
        id: uuidv4(),
        name: 'index.html',
        type: 'file',
        path: '/src/index.html',
        language: 'html',
        content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My App</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <div id="app">\n    <h1>Hello World</h1>\n    <p>Welcome to my application!</p>\n  </div>\n  <script src="main.js"></script>\n</body>\n</html>'
      },
      {
        id: uuidv4(),
        name: 'styles.css',
        type: 'file',
        path: '/src/styles.css',
        language: 'css',
        content: 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background-color: #f5f5f5;\n}\n\n#app {\n  max-width: 800px;\n  margin: 0 auto;\n  background-color: white;\n  padding: 20px;\n  border-radius: 8px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n\nh1 {\n  color: #333;\n}\n\np {\n  color: #666;\n}'
      },
      {
        id: uuidv4(),
        name: 'main.js',
        type: 'file',
        path: '/src/main.js',
        language: 'javascript',
        content: 'document.addEventListener("DOMContentLoaded", () => {\n  console.log("Application loaded");\n  \n  // Add event listeners\n  const heading = document.querySelector("h1");\n  if (heading) {\n    heading.addEventListener("click", () => {\n      alert("Hello from JavaScript!");\n    });\n  }\n});'
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'assets',
    type: 'folder',
    path: '/assets',
    children: [
      {
        id: uuidv4(),
        name: 'images',
        type: 'folder',
        path: '/assets/images',
        children: []
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'README.md',
    type: 'file',
    path: '/README.md',
    language: 'markdown',
    content: '# My Application\n\nThis is a simple web application created with HTML, CSS, and JavaScript.\n\n## Getting Started\n\n1. Clone this repository\n2. Open index.html in your browser\n\n## Features\n\n- Responsive design\n- Interactive elements\n- Clean code structure'
  }
];

// Get all files
export const getFiles = (): FileNode[] => {
  return JSON.parse(JSON.stringify(fileSystem));
};

// Get a specific file by path
export const getFileByPath = (path: string): FileNode | null => {
  const findFile = (nodes: FileNode[], targetPath: string): FileNode | null => {
    for (const node of nodes) {
      if (node.path === targetPath) {
        return node;
      }
      if (node.children) {
        const found = findFile(node.children, targetPath);
        if (found) return found;
      }
    }
    return null;
  };
  
  return findFile(fileSystem, path);
};

// Create a new file or folder
export const createFile = (parentPath: string, type: 'file' | 'folder', name?: string): FileNode => {
  const defaultName = type === 'file' ? 'new-file.txt' : 'new-folder';
  const fileName = name || defaultName;
  const path = parentPath === '/' ? `/${fileName}` : `${parentPath}/${fileName}`;
  
  const newNode: FileNode = {
    id: uuidv4(),
    name: fileName,
    type,
    path,
    ...(type === 'folder' ? { children: [] } : { content: '' }),
    ...(type === 'file' ? { language: getLanguageFromFileName(fileName) } : {}),
    isNew: true
  };
  
  if (parentPath === '/') {
    fileSystem.push(newNode);
  } else {
    const updateChildren = (nodes: FileNode[]): boolean => {
      for (const node of nodes) {
        if (node.path === parentPath && node.type === 'folder') {
          node.children = node.children || [];
          node.children.push(newNode);
          return true;
        }
        if (node.children) {
          if (updateChildren(node.children)) return true;
        }
      }
      return false;
    };
    
    updateChildren(fileSystem);
  }
  
  return newNode;
};

// Update file content
export const updateFileContent = (path: string, content: string): boolean => {
  const updateContent = (nodes: FileNode[]): boolean => {
    for (const node of nodes) {
      if (node.path === path && node.type === 'file') {
        node.content = content;
        return true;
      }
      if (node.children) {
        if (updateContent(node.children)) return true;
      }
    }
    return false;
  };
  
  return updateContent(fileSystem);
};

// Rename a file or folder
export const renameFile = (path: string, newName: string): boolean => {
  const rename = (nodes: FileNode[]): boolean => {
    for (const node of nodes) {
      if (node.path === path) {
        const pathParts = node.path.split('/');
        pathParts[pathParts.length - 1] = newName;
        const newPath = pathParts.join('/');
        
        // Update path and name
        node.name = newName;
        node.path = newPath;
        
        // If it's a file, update language based on new name
        if (node.type === 'file') {
          node.language = getLanguageFromFileName(newName);
        }
        
        // If it's a folder, update all children paths
        if (node.type === 'folder' && node.children) {
          updateChildrenPaths(node.children, path, newPath);
        }
        
        return true;
      }
      if (node.children) {
        if (rename(node.children)) return true;
      }
    }
    return false;
  };
  
  return rename(fileSystem);
};

// Helper to update paths of all children when a folder is renamed
const updateChildrenPaths = (nodes: FileNode[], oldParentPath: string, newParentPath: string) => {
  for (const node of nodes) {
    node.path = node.path.replace(oldParentPath, newParentPath);
    if (node.children) {
      updateChildrenPaths(node.children, oldParentPath, newParentPath);
    }
  }
};

// Delete a file or folder
export const deleteFile = (path: string): boolean => {
  // Can't delete root
  if (path === '/') return false;
  
  // Handle top-level files/folders
  if (path.split('/').length === 2) {
    const index = fileSystem.findIndex(node => node.path === path);
    if (index !== -1) {
      fileSystem.splice(index, 1);
      return true;
    }
    return false;
  }
  
  // Handle nested files/folders
  const deleteNode = (nodes: FileNode[], parentPath: string): boolean => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      
      // Check if this is the parent that contains our target
      if (node.type === 'folder' && path.startsWith(node.path + '/')) {
        const pathSegments = path.substring(node.path.length + 1).split('/');
        
        // If the path has only one segment left, it's a direct child
        if (pathSegments.length === 1) {
          const childIndex = node.children?.findIndex(child => child.path === path) ?? -1;
          if (childIndex !== -1 && node.children) {
            node.children.splice(childIndex, 1);
            return true;
          }
        } else if (node.children) {
          // Otherwise, recurse deeper
          return deleteNode(node.children, node.path);
        }
      }
    }
    return false;
  };
  
  return deleteNode(fileSystem, '/');
};

// Helper to determine language from file extension
export const getLanguageFromFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    case 'html': return 'html';
    case 'css': return 'css';
    case 'js': return 'javascript';
    case 'ts': return 'typescript';
    case 'json': return 'json';
    case 'md': return 'markdown';
    case 'py': return 'python';
    case 'java': return 'java';
    case 'c': return 'c';
    case 'cpp': return 'cpp';
    case 'jsx': return 'javascript';
    case 'tsx': return 'typescript';
    case 'txt': return 'plaintext';
    default: return 'plaintext';
  }
}; 