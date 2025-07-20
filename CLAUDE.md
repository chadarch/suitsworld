# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Claude Workflow Rules

## Development Workflow

1. **Think and Plan First**
   - First think through the problem
   - Read the codebase for relevant files
   - Write a plan to tasks/todo.md

2. **Create Todo List**
   - The plan should have a list of todo items that you can check off as you complete them
   - Use the TodoWrite tool to manage tasks

3. **Verify Plan Before Starting**
   - Before you begin working, check in with me and I will verify the plan
   - Wait for approval before proceeding

4. **Execute Tasks**
   - Begin working on the todo items
   - Mark them as complete as you go
   - Update the todo list in real-time

5. **Communication**
   - Every step of the way, give me a high level explanation of what changes you made
   - Keep explanations concise and focused

6. **Simplicity First**
   - Make every task and code change as simple as possible
   - Avoid making massive or complex changes
   - Every change should impact as little code as possible
   - Everything is about simplicity

7. **Review and Documentation**
   - Add a review section to the todo.md file with a summary of changes made
   - Include any other relevant information about the implementation

## Key Principles

- **Minimalism**: Keep changes small and focused
- **Transparency**: Always communicate what you're doing
- **Planning**: Never start without a clear plan
- **Verification**: Get approval before beginning work
- **Simplicity**: Choose the simplest solution that works

## Development Commands

### Frontend Development
- `npm run dev` - Start Vite development server (port 5173)
- `npm run build` - Build for production 
- `npm run build:dev` - Build for development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Development  
- `npm run server` - Start Express server (port 3000)
- `npm run server:dev` - Start server with nodemon
- `npm run dev:full` - Run both frontend and backend concurrently

### Full Stack Development
The project is configured to run frontend and backend simultaneously:
- Frontend: Vite dev server on port 5173
- Backend: Express API server on port 3000 (proxied via `/api`)
- Use `npm run dev:full` to start both servers

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui components + Tailwind CSS
- **State Management**: TanStack Query for server state
- **Routing**: React Router DOM
- **Backend**: Express.js + Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs

### Project Structure

```
/src                 - Frontend React application
  /components        - Reusable UI components
    /ui              - shadcn/ui components  
    /admin           - Admin-specific components
    /mens            - Men's category components
  /pages            - Route components
    /admin          - Admin dashboard pages
    /mens           - Men's category pages  
  /lib              - Utilities and API client
  /hooks            - Custom React hooks

/api                - Legacy API entry point (server.js)
/server             - Backend Express application
  /routes           - API route handlers
  /models           - Mongoose data models
  /controllers      - Business logic
  /middleware       - Express middleware
  /uploads          - File upload storage

/public             - Static assets
/dist               - Production build output
```

### API Architecture
- RESTful API with Express.js
- MongoDB collections: Users, Products
- File uploads handled via multer to `/server/uploads`
- CORS configured for local development and Vercel deployment
- API routes prefixed with `/api`

### Frontend Architecture
- Component-based React architecture using TypeScript
- shadcn/ui component library for consistent UI
- TanStack Query for server state management and caching
- React Router for client-side routing
- Form handling with react-hook-form + zod validation

### Key Features
- E-commerce suit store with categories (Men's, Women's, Children's)
- Product catalog with filtering, search, and pagination
- Admin dashboard for product/user management
- Authentication system with JWT
- File upload for product images
- Responsive design with Tailwind CSS

### Development Notes
- Vite proxy configuration routes `/api/*` to Express server
- MongoDB connection string configurable via `MONGODB_URI` env var
- Static file serving for uploads at `/uploads` endpoint
- ESLint configured with React and TypeScript rules
- Build outputs to `/dist` for production deployment

### Database Models
- **User**: Authentication and profile data with bcrypt password hashing
- **Product**: Catalog items with categories, pricing, inventory, and image paths

### API Endpoints
- `GET /api/health` - Server health check with database status
- `/api/users/*` - User CRUD operations and authentication
- `/api/products/*` - Product CRUD with filtering/search
- `/api/upload/*` - File upload handling