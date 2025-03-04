# SmartBotz AI Code Generator Platform

A powerful AI-driven platform that generates complete project code based on natural language descriptions.

## Features

- **Natural Language Input**: Describe your application in plain English
- **AI-Powered Code Generation**: Automatically generate full-stack applications
- **Multi-AI Support**: Leverage OpenAI and Anthropic models
- **Live Preview**: Visualize generated code in real-time
- **Seamless Authentication**: Easy signup and login
- **Instant Code Generation**: Start without account creation

## Tech Stack

### Frontend
- **Framework**: React 18.2.0
- **Language**: TypeScript
- **State Management**: MobX 6.10.2
- **Routing**: React Router 6.22.1
- **Styling**: 
  - TailwindCSS 3.4.1
  - DaisyUI
  - CSS Modules
- **Build Tool**: Vite 5.4.14

### Backend
- **Runtime**: Node.js
- **Framework**: Express 4.21.2
- **Database**: 
  - MongoDB (mongoose 8.12.0)
  - Supabase (PostgreSQL)
- **Authentication**: 
  - Supabase Auth
  - JWT (jsonwebtoken 9.0.2)
- **Real-time**: Socket.IO 4.7.2
- **Logging**: Winston 3.10.0

## Getting Started

### Prerequisites
- Node.js 18.x
- npm 
- Supabase account (optional)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smartbotz-code-generator.git
   cd smartbotz-code-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_key
   ANTHROPIC_API_KEY=your_anthropic_key
   ```

4. Start development servers:
   ```bash
   # Frontend
   npm run dev:frontend
   
   # Backend
   npm run dev:backend
   ```

## Project Structure

```
smartbotz-code-generator/
├── src/
│   ├── app/             # Main application routes
│   ├── components/      # Reusable React components
│   ├── services/        # API and business logic
│   ├── types/           # TypeScript definitions
│   └── lib/             # Utility functions
├── backend/             # Express server
│   ├── controllers/
│   ├── models/
│   └── routes/
└── config/              # Configuration files
```

## Development Mode

- Mock authentication available
- Test account for easy login
- CORS and environment configurations

## Contributing

Contributions are welcome! Please submit pull requests.

## License

MIT License