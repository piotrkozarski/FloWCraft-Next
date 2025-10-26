# FlowCraft - Project Management Tool

A modern project management application built with React, TypeScript, Vite, and Supabase. Features issue tracking, sprint management, and team collaboration with beautiful Horde/Alliance themed UI.

## Features

- 🎯 **Issue Management**: Create, edit, and track issues with priority and status
- 🏃 **Sprint Planning**: Organize work into sprints with start/end dates
- 📊 **Kanban Board**: Visual workflow with drag-and-drop functionality
- 👥 **User Authentication**: Secure login with email/password only
- 🎨 **Theme Support**: Horde (burgundy/gold) and Alliance (navy/blue) themes
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS with custom CSS variables
- **Authentication**: Supabase Auth
- **State Management**: Zustand + React Context
- **Routing**: React Router DOM
- **UI Components**: Headless UI, Lucide React icons
- **Animations**: Framer Motion
- **Drag & Drop**: @hello-pangea/dnd

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone and Install

```bash
git clone <repository-url>
cd FlowCraftAIPH
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** in your Supabase dashboard
3. Copy your **Project URL** and **anon public** key

### 3. Environment Configuration

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Important**: 
- Vite only exposes environment variables prefixed with `VITE_`
- Never commit `.env.local` to version control
- The file is already included in `.gitignore`

### 4. Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

### 5. Build for Production

```bash
npm run build
npm run preview
```

## Deployment on Vercel

### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Vite configuration

### 2. Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings → Environment Variables**
2. Add the following variables:

```
VITE_SUPABASE_URL = your_supabase_project_url
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
```

3. Set environment to **Production** (and optionally Preview/Development)
4. Click **Save**

### 3. Deploy

1. Click **Deploy** or push to your main branch
2. Vercel will automatically build and deploy your application
3. Your app will be available at `https://your-project.vercel.app`

### 4. Supabase Authentication Configuration

For email/password authentication to work in production:

1. Go to **Authentication → Settings** in Supabase dashboard
2. Ensure **Email/Password** provider is enabled
3. Configure **Site URL**:
   - Site URL: `https://your-project.vercel.app`
4. For local development, also add:
   - Site URL: `http://localhost:5173`

**Note**: The application uses email/password authentication only. OAuth providers are not configured.

## Project Structure

```
src/
├── auth/                 # Authentication components and context
├── components/           # Reusable UI components
│   ├── auth/            # Auth-specific components
│   ├── modals/          # Modal dialogs
│   └── ui/              # Base UI components
├── lib/                 # External library configurations
├── pages/               # Page components
├── store/               # State management (Zustand)
└── types.ts             # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Authentication

The application supports email/password authentication:

- **Email/Password**: Traditional login and registration
- **Session Management**: Automatic token refresh and persistence

### Protected Features

- Creating and editing issues
- Sprint management
- User profile access

Unauthenticated users will see a sign-in modal when attempting to access protected features.

## Theming

The application supports two themes:

- **Horde**: Burgundy background with gold accents
- **Alliance**: Navy background with blue accents

Switch themes using the theme toggle in the sidebar.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
