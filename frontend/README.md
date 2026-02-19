# Perspectra Frontend

AI-powered adaptive learning platform for DSA (Data Structures & Algorithms).

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **Axios** for API calls
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your backend URL (default: http://localhost:8000)
```

### Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

### Build for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
├── pages/           # Page components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Onboarding.tsx
│   ├── Dashboard.tsx
│   ├── Problems.tsx
│   ├── ProblemSolve.tsx
│   └── KnowledgeGraph.tsx
├── store/           # Zustand state management
│   ├── authStore.ts
│   └── profileStore.ts
├── lib/             # Utilities and API client
│   ├── api.ts
│   └── utils.ts
├── App.tsx          # Main app component with routing
└── main.tsx         # Entry point
```

## Features

### 1. Authentication
- User registration and login
- JWT token-based authentication
- Protected routes

### 2. Onboarding
- 5-question personalized onboarding
- AI analyzes answers to create initial profile
- Determines experience level and learning style

### 3. Dashboard
- Overview of learning progress
- Personalized recommendations
- AI-generated insights (after 5 submissions)
- Skills visualization

### 4. Problems
- Browse 50 DSA problems
- Filter by difficulty
- Search functionality

### 5. Problem Solving
- Code editor for solutions
- Submit for AI review
- Get personalized feedback
- Ask AI tutor questions
- Request Socratic hints

### 6. Knowledge Graph
- Visualize concept dependencies
- Track mastery across 30 concepts
- See skill levels and gaps
- Tier-based organization

## API Integration

The frontend communicates with the FastAPI backend through the following endpoints:

- `/auth/*` - Authentication
- `/profile/*` - User profile and onboarding
- `/problems/*` - Problem listing and details
- `/review/*` - Code submission and review
- `/tutor/*` - AI tutor and hints
- `/graph/*` - Knowledge graph data
- `/insights/*` - Learning insights

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:8000)

## Development Notes

- The app uses Tailwind CSS utility classes for styling
- State management is handled by Zustand (lightweight alternative to Redux)
- All API calls include automatic token injection via Axios interceptors
- Toast notifications provide user feedback for all actions
