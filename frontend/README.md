# AI-Powered Learning Platform Frontend

This is the frontend application for the AI-powered learning platform. It's built with React, TypeScript, and Tailwind CSS.

## Features

- Modern, responsive UI with Tailwind CSS
- Type-safe development with TypeScript
- Form handling with React Hook Form
- State management with Zustand
- Data fetching with React Query
- Client-side routing with React Router

## Prerequisites

- Node.js 16.x or later
- npm 7.x or later

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── pages/         # Page components
  ├── stores/        # Zustand stores
  ├── types/         # TypeScript type definitions
  ├── App.tsx        # Main application component
  └── index.tsx      # Application entry point
```

## Development

### Adding New Dependencies

When adding new dependencies, make sure to:

1. Install the package:
   ```bash
   npm install <package-name>
   ```

2. If the package includes TypeScript types, install them as well:
   ```bash
   npm install -D @types/<package-name>
   ```

### Code Style

- Use TypeScript for type safety
- Follow the existing code style and patterns
- Use Tailwind CSS for styling
- Write meaningful component and function names
- Add comments for complex logic

### Testing

The project uses Vitest for testing. To run tests:

```bash
npm test
```

## Building for Production

To build the application for production:

```bash
npm run build
```

The build output will be in the `dist` directory.

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License. 