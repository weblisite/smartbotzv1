/**
 * Formats HTML code with proper indentation
 */
export function formatHtml(html: string): string {
  let formatted = '';
  let indent = 0;
  
  // Split the HTML into lines
  const lines = html.split(/>\s*</);
  
  lines.forEach((line, index) => {
    // Add < and > back to the line
    let currentLine = index === 0 ? line : '<' + line;
    if (index !== lines.length - 1) {
      currentLine += '>';
    }
    
    // Check if the line is a closing tag
    const isClosingTag = /^<\//.test(currentLine);
    // Check if the line is a self-closing tag
    const isSelfClosingTag = /\/>$/.test(currentLine);
    // Check if the line is a DOCTYPE declaration
    const isDoctype = /<!DOCTYPE/i.test(currentLine);
    // Check if the line is a comment
    const isComment = /<!--/.test(currentLine);
    
    // Decrease indent for closing tags
    if (isClosingTag && !isComment) {
      indent--;
    }
    
    // Add the line with proper indentation
    formatted += '\n' + ' '.repeat(indent * 2) + currentLine;
    
    // Increase indent for opening tags
    if (!isClosingTag && !isSelfClosingTag && !isDoctype && !isComment) {
      indent++;
    }
  });
  
  return formatted.trim();
}

/**
 * Formats CSS code with proper indentation
 */
export function formatCss(css: string): string {
  // Remove all existing whitespace
  let formatted = css.replace(/\s+/g, ' ').trim();
  
  // Add newlines and indentation
  formatted = formatted
    .replace(/\{/g, ' {\n  ')
    .replace(/;/g, ';\n  ')
    .replace(/}/g, '\n}\n')
    .replace(/\n  \n}/g, '\n}');
  
  return formatted.trim();
}

/**
 * Formats JavaScript code with proper indentation
 */
export function formatJs(js: string): string {
  // This is a simple formatter and doesn't handle all JS syntax
  // In a real app, you would use a library like prettier
  
  let formatted = '';
  let indent = 0;
  
  // Split the JS into lines
  const lines = js.split(/\n/);
  
  lines.forEach(line => {
    // Trim the line
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) {
      formatted += '\n';
      return;
    }
    
    // Check if the line contains a closing brace
    const hasClosingBrace = /^}/.test(trimmedLine);
    
    // Decrease indent for closing braces
    if (hasClosingBrace) {
      indent--;
    }
    
    // Add the line with proper indentation
    formatted += '\n' + ' '.repeat(indent * 2) + trimmedLine;
    
    // Check if the line contains an opening brace
    const hasOpeningBrace = /{$/.test(trimmedLine);
    
    // Increase indent for opening braces
    if (hasOpeningBrace) {
      indent++;
    }
  });
  
  return formatted.trim();
}

/**
 * Combines HTML, CSS, and JavaScript into a single HTML file
 */
export function combineCode(html: string, css: string, js: string): string {
  // Extract the HTML content between <body> tags
  const bodyContent = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || html;
  
  // Create a complete HTML document
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated App</title>
  <style>
${css}
  </style>
</head>
<body>
${bodyContent}
  <script>
${js}
  </script>
</body>
</html>
  `.trim();
}

/**
 * Extracts components from HTML code
 */
export function extractComponents(html: string): { name: string; code: string }[] {
  const components: { name: string; code: string }[] = [];
  
  // Look for div elements with class names that might be components
  const componentRegex = /<div[^>]*class="([^"]*component[^"]*)"[^>]*>([\s\S]*?)<\/div>/gi;
  let match;
  
  while ((match = componentRegex.exec(html)) !== null) {
    const className = match[1];
    const componentCode = match[0];
    
    // Extract a name from the class
    const nameMatch = className.match(/([a-zA-Z0-9-]+)-component/);
    const name = nameMatch ? nameMatch[1] : `Component${components.length + 1}`;
    
    components.push({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      code: componentCode,
    });
  }
  
  return components;
}

/**
 * Generates a React component from HTML
 */
export function htmlToReactComponent(html: string, componentName: string): string {
  // Replace class with className
  let reactCode = html.replace(/class="/g, 'className="');
  
  // Replace for with htmlFor
  reactCode = reactCode.replace(/for="/g, 'htmlFor="');
  
  // Wrap in a React component
  return `
import React from 'react';

export default function ${componentName}() {
  return (
    ${reactCode}
  );
}
  `.trim();
}

/**
 * Generates a download link for code
 */
export function generateDownloadLink(code: string, fileName: string): string {
  const blob = new Blob([code], { type: 'text/plain' });
  return URL.createObjectURL(blob);
}

/**
 * Creates a zip file containing HTML, CSS, and JS files
 */
export async function createZipFile(html: string, css: string, js: string): Promise<Blob> {
  // In a real app, you would use a library like JSZip
  // For this demo, we'll just create a text file with all the code
  
  const content = `
HTML:
${html}

CSS:
${css}

JavaScript:
${js}
  `.trim();
  
  return new Blob([content], { type: 'text/plain' });
} 