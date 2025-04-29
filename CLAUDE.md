# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check for code issues

## Code Style Guidelines
- **Imports**: Group imports by external libraries first, then internal modules
- **Formatting**: Uses TypeScript and follows Next.js conventions
- **Types**: Strongly typed with TypeScript
- **Naming**: 
  - PascalCase for components and types
  - camelCase for variables and functions
  - kebab-case for file names
- **Error Handling**: Use try/catch blocks for async operations
- **State Management**: React Query for server state, React hooks for local state
- **API Structure**: Route handlers in src/app/api with RESTful endpoints
- **Authentication**: Handled through Supabase in auth layout

## Project Structure
Next.js App Router structure with (auth) and (dashboard) route groups. Uses Tailwind CSS for styling.