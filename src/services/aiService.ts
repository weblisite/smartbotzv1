import axios from 'axios';

// Initialize Anthropic Claude client
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';

export type GeneratedCode = {
  html: string;
  css: string;
  javascript: string;
  fullCode: string;
  framework?: string;
  packageJson?: string;
  configFiles?: Record<string, string>;
};

export type Framework = 'vanilla' | 'react' | 'vue' | 'svelte' | 'astro';

export type GenerationOptions = {
  type: 'website' | 'webapp' | 'landing-page' | 'dashboard';
  framework: Framework;
  features: string[];
  style: {
    colorScheme: string;
    layout: string;
  };
};

/**
 * Generate code based on a natural language prompt using Claude
 */
export async function generateCode(
  prompt: string,
  options?: Partial<GenerationOptions>
): Promise<GeneratedCode> {
  try {
    console.log('Generating code with Claude API...');
    console.log('API URL:', CLAUDE_API_URL);
    console.log('API Key available:', !!CLAUDE_API_KEY);
    console.log('Prompt:', prompt);
    console.log('Options:', JSON.stringify(options));
    
    if (!CLAUDE_API_KEY) {
      throw new Error('Claude API key is missing. Check your .env.local file.');
    }
    
    // Determine if this is a refinement request based on the prompt content
    const isRefinement = prompt.includes('I previously created a website') || 
                         prompt.includes('conversation history');
    
    // Get the selected framework or default to vanilla
    const framework = options?.framework || 'vanilla';
    
    let promptText = '';
    
    if (isRefinement) {
      promptText = `${prompt}
      
Please provide the COMPLETE updated code for a ${framework !== 'vanilla' ? framework + ' ' : ''}website.

${getFrameworkSpecificInstructions(framework, isRefinement)}

Make sure the code is complete, functional, and follows best practices.
Include ALL the previous functionality plus the requested changes.
Do not omit any parts of the previous code unless explicitly asked to remove them.`;
    } else {
      promptText = `Generate code for a ${framework !== 'vanilla' ? framework + ' ' : ''}website based on this description: ${prompt}
      
If provided, use these options: ${JSON.stringify(options)}

${getFrameworkSpecificInstructions(framework, isRefinement)}

Make sure the code is complete, functional, and follows best practices.`;
    }
    
    const requestBody = {
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: promptText
            }
          ]
        }
      ]
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    };
    
    console.log('Request headers:', JSON.stringify({
      'Content-Type': headers['Content-Type'],
      'anthropic-version': headers['anthropic-version'],
      'x-api-key': 'REDACTED'
    }, null, 2));
    
    try {
      const response = await axios.post(
        CLAUDE_API_URL,
        requestBody,
        { headers }
      );
      
      console.log('Claude API response received');
      console.log('Response status:', response.status);
      console.log('Response data structure:', Object.keys(response.data));
      
      // Parse the response to extract code based on the framework
      const responseContent = response.data.content[0].text;
      console.log('Response content length:', responseContent.length);
      console.log('Response content preview:', responseContent.substring(0, 200) + '...');
      
      if (framework === 'vanilla') {
        return parseVanillaCode(responseContent);
      } else {
        return parseFrameworkCode(responseContent, framework);
      }
    } catch (axiosError: any) {
      console.error('Axios error during Claude API call:', axiosError.message);
      if (axiosError.response) {
        console.error('Response status:', axiosError.response.status);
        console.error('Response data:', axiosError.response.data);
      }
      throw axiosError;
    }
  } catch (error) {
    console.error('Error generating code with Claude API:', error);
    throw error; // Re-throw the error instead of falling back to mock data
  }
}

/**
 * Get framework-specific instructions for the AI prompt
 */
function getFrameworkSpecificInstructions(framework: Framework, isRefinement: boolean): string {
  switch (framework) {
    case 'react':
      return `Please provide the code in the following format:
1. Main React component code (wrapped in \`\`\`jsx tags)
2. CSS code (wrapped in \`\`\`css tags)
3. package.json (wrapped in \`\`\`json tags)
4. Any additional configuration files needed (each wrapped in \`\`\` tags with appropriate file extension)

Use modern React practices with hooks and functional components. Include proper imports and exports.`;
    
    case 'vue':
      return `Please provide the code in the following format:
1. Vue component files (wrapped in \`\`\`vue tags)
2. Additional CSS if needed (wrapped in \`\`\`css tags)
3. package.json (wrapped in \`\`\`json tags)
4. Any additional configuration files needed (each wrapped in \`\`\` tags with appropriate file extension)

Use Vue 3 with Composition API. Include proper imports and exports.`;
    
    case 'svelte':
      return `Please provide the code in the following format:
1. Svelte component files (wrapped in \`\`\`svelte tags)
2. Additional CSS if needed (wrapped in \`\`\`css tags)
3. package.json (wrapped in \`\`\`json tags)
4. Any additional configuration files needed (each wrapped in \`\`\` tags with appropriate file extension)

Use Svelte's reactive declarations and stores appropriately. Include proper imports and exports.`;
    
    case 'astro':
      return `Please provide the code in the following format:
1. Astro component files (wrapped in \`\`\`astro tags)
2. Additional components if needed (wrapped in appropriate \`\`\` tags)
3. package.json (wrapped in \`\`\`json tags)
4. Any additional configuration files needed (each wrapped in \`\`\` tags with appropriate file extension)

Use Astro's partial hydration with appropriate client directives. Include proper imports and exports.`;
    
    case 'vanilla':
    default:
      return `Please provide the code in three separate sections:
1. HTML code (wrapped in \`\`\`html tags)
2. CSS code (wrapped in \`\`\`css tags)
3. JavaScript code (wrapped in \`\`\`javascript tags)`;
  }
}

/**
 * Parse vanilla HTML/CSS/JS code from the AI response
 */
function parseVanillaCode(responseContent: string): GeneratedCode {
  const htmlMatch = responseContent.match(/```html\n([\s\S]*?)```/);
  const cssMatch = responseContent.match(/```css\n([\s\S]*?)```/);
  const jsMatch = responseContent.match(/```javascript\n([\s\S]*?)```/);
  
  console.log('HTML match found:', !!htmlMatch);
  console.log('CSS match found:', !!cssMatch);
  console.log('JS match found:', !!jsMatch);
  
  if (!htmlMatch || !cssMatch || !jsMatch) {
    throw new Error('Failed to parse Claude response. Make sure the API is returning code in the expected format.');
  }
  
  const html = htmlMatch[1];
  const css = cssMatch[1];
  const javascript = jsMatch[1];
  
  // Combine all code into a single HTML file for preview
  const fullCode = `
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
${html
  .replace(/<link\s+rel=["']stylesheet["']\s+href=["']styles\.css["']\s*\/?>/g, '')
  .replace(/<script\s+src=["']script\.js["']\s*><\/script>/g, '')
  .replace(/<script\s+src=["']script\.js["']\s*\/>/g, '')
}
  <script>
${javascript}
  </script>
</body>
</html>
  `;
  
  return {
    html,
    css,
    javascript,
    fullCode,
    framework: 'vanilla'
  };
}

/**
 * Parse framework-specific code from the AI response
 */
function parseFrameworkCode(responseContent: string, framework: Framework): GeneratedCode {
  let mainCode = '';
  let css = '';
  let packageJson = '';
  let configFiles: Record<string, string> = {};
  
  // Extract main component code based on framework
  switch (framework) {
    case 'react':
      const jsxMatch = responseContent.match(/```jsx\n([\s\S]*?)```/);
      if (jsxMatch) mainCode = jsxMatch[1];
      break;
    case 'vue':
      const vueMatch = responseContent.match(/```vue\n([\s\S]*?)```/);
      if (vueMatch) mainCode = vueMatch[1];
      break;
    case 'svelte':
      const svelteMatch = responseContent.match(/```svelte\n([\s\S]*?)```/);
      if (svelteMatch) mainCode = svelteMatch[1];
      break;
    case 'astro':
      const astroMatch = responseContent.match(/```astro\n([\s\S]*?)```/);
      if (astroMatch) mainCode = astroMatch[1];
      break;
  }
  
  // Extract CSS if present
  const cssMatch = responseContent.match(/```css\n([\s\S]*?)```/);
  if (cssMatch) css = cssMatch[1];
  
  // Extract package.json
  const packageJsonMatch = responseContent.match(/```json\n([\s\S]*?)```/);
  if (packageJsonMatch) packageJson = packageJsonMatch[1];
  
  // Extract any config files (using a different approach to avoid RegExpStringIterator)
  const configRegex = /```(\w+)\n([\s\S]*?)```/g;
  let match;
  while ((match = configRegex.exec(responseContent)) !== null) {
    const extension = match[1];
    const content = match[2];
    if (extension !== 'jsx' && extension !== 'vue' && extension !== 'svelte' && 
        extension !== 'astro' && extension !== 'css' && extension !== 'json') {
      configFiles[`config.${extension}`] = content;
    }
  }
  
  // For preview, we'll create a simple HTML that loads a message about the framework
  const fullCode = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated ${framework.charAt(0).toUpperCase() + framework.slice(1)} App</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background-color: #f5f5f5;
      color: #333;
      text-align: center;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    h1 {
      margin-top: 0;
      color: #2563eb;
    }
    pre {
      background-color: #f1f5f9;
      padding: 15px;
      border-radius: 4px;
      overflow: auto;
      text-align: left;
      max-height: 300px;
    }
    .framework-logo {
      font-size: 48px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="framework-logo">
      ${getFrameworkEmoji(framework)}
    </div>
    <h1>${framework.charAt(0).toUpperCase() + framework.slice(1)} Application Generated</h1>
    <p>Your ${framework} application has been successfully generated. The code can be viewed in the "Code" tab.</p>
    <p>To run this application, you would typically:</p>
    <ol style="text-align: left;">
      <li>Create a new ${framework} project</li>
      <li>Copy the generated code into the appropriate files</li>
      <li>Install dependencies with npm or yarn</li>
      <li>Start the development server</li>
    </ol>
    <p>Here's a preview of the main component:</p>
    <pre>${mainCode.substring(0, 300)}${mainCode.length > 300 ? '...' : ''}</pre>
  </div>
</body>
</html>
  `;
  
  return {
    html: mainCode, // Using the main component code as HTML
    css,
    javascript: '', // Not used for framework code
    fullCode,
    framework,
    packageJson,
    configFiles
  };
}

/**
 * Get an emoji representation for each framework
 */
function getFrameworkEmoji(framework: Framework): string {
  switch (framework) {
    case 'react':
      return '⚛️';
    case 'vue':
      return '🟢';
    case 'svelte':
      return '🔥';
    case 'astro':
      return '🚀';
    case 'vanilla':
    default:
      return '🌐';
  }
}

/**
 * Deploy the generated code to a hosting service
 */
export async function deployCode(code: GeneratedCode, name: string): Promise<string> {
  try {
    // In a production environment, you would call a deployment service API
    // For demo purposes, we'll simulate a deployment
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock deployment URL
    return `https://example-deployment.vercel.app/${name.toLowerCase().replace(/\s+/g, '-')}`;
  } catch (error) {
    console.error('Error deploying code:', error);
    throw new Error('Failed to deploy code');
  }
} 