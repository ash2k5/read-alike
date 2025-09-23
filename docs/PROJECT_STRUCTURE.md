# Project Structure

This document outlines the organization of the ReadAlike project.

## Directory Structure

```
read-alike/
├── config/                 # Configuration files
│   ├── eslint.config.js    # ESLint configuration
│   ├── postcss.config.js   # PostCSS configuration
│   ├── tailwind.config.ts  # Tailwind CSS configuration
│   └── vite.config.ts      # Vite build configuration
├── deployment/             # Deployment configurations
│   └── vercel.json         # Vercel deployment config
├── docs/                   # Documentation
│   ├── PROJECT_STRUCTURE.md # This file
│   └── supabase-setup.sql  # Database setup script
├── scripts/                # Build and deployment scripts
│   ├── build.sh           # Build script
│   └── setup.sh           # Development setup script
├── src/                    # Source code
│   ├── features/          # Feature-based modules
│   ├── lib/               # Shared libraries
│   ├── components/        # Shared components
│   ├── pages/             # Top-level pages
│   └── types/             # TypeScript type definitions
└── public/                # Static assets
```

## Key Principles

1. **Feature-based organization**: Related functionality grouped together
2. **Clear separation**: Configuration, documentation, and source code separated
3. **Scalability**: Structure supports project growth
4. **Professional standards**: Industry best practices followed