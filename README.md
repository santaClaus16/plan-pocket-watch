# Plan Pocket Watch

Plan Pocket Watch is a modern web application built for seamless planning and time management. It leverages a modern frontend stack to ensure a fast, responsive, and aesthetically pleasing user experience.

## Tech Stack

This project uses the following technologies:

- **Framework**: [React](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router](https://reactrouter.com/)
- **State/Data Fetching**: [TanStack Query](https://tanstack.com/query/latest)

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

Navigate to the project directory and install the dependencies:

```bash
npm install
# or
bun install
```

### Development

To start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be accessible at `http://localhost:8080` (or whichever port Vite allocates in your terminal).

### Build

To create a production-ready build:

```bash
npm run build
```

This will compile the TypeScript code and generate optimized static assets in the `dist` folder.

## Available Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the project for production.
- `npm run preview`: Bootstraps a local web server to preview the production build.
- `npm run lint`: Runs ESLint to enforce code quality.
- `npm run test`: Runs the test suite using Vitest.
