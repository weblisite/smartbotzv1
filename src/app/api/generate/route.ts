import { NextRequest, NextResponse } from 'next/server';
import { generateCode } from '@/services/aiService';
import { GenerationOptions } from '@/services/aiService';

// Define the message type to match the frontend
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export async function POST(request: NextRequest) {
  try {
    console.log('API route: Received code generation request');
    
    const { prompt, options, conversation = [] } = await request.json();
    console.log('API route: Prompt received:', prompt);
    console.log('API route: Options received:', JSON.stringify(options));
    console.log('API route: Conversation history length:', conversation.length);
    
    if (!prompt) {
      console.log('API route: No prompt provided');
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    // Determine if this is a refinement request
    const isRefinement = conversation.length > 0;
    
    // If this is a refinement, we'll pass the conversation history to the AI
    // to provide context for the changes requested
    let contextualPrompt = prompt;
    
    if (isRefinement) {
      console.log('API route: Processing refinement request');
      // Format the conversation history for the AI
      const conversationContext = conversation
        .map((msg: Message) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');
      
      // Create a more detailed prompt that includes the conversation history
      contextualPrompt = `
I previously created a website based on the user's requirements. Here's our conversation history:

${conversationContext}

Now the user wants the following changes:
${prompt}

Please update the website code accordingly.
`;
    }
    
    console.log('API route: Calling aiService.generateCode');
    // Use the aiService to generate code with Claude API
    const generatedCode = await generateCode(contextualPrompt, options);
    console.log('API route: Code generation completed');
    
    return NextResponse.json(generatedCode);
  } catch (error) {
    console.error('API route: Error generating code:', error);
    return NextResponse.json(
      { error: 'Failed to generate code' },
      { status: 500 }
    );
  }
} 