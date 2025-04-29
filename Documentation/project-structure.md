middleware.ts                   # Next.js middleware for auth redirects

src/
├── app/                        # Next.js App Router directory
│   ├── api/                    # API routes
│   │   ├── transactions/
│   │   │   ├── route.ts        # GET, POST transactions
│   │   │   └── upload/
│   │   │       └── route.ts    # CSV upload endpoint
│   │   └── categories/
│   │       └── route.ts        # GET, POST categories
│   ├── (auth)/                 # Auth routes (grouped)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx          # Shared auth layout
│   ├── (dashboard)/            # Dashboard routes (grouped)
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Main dashboard
│   │   ├── transactions/
│   │   │   ├── page.tsx        # Transactions list
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Transaction detail
│   │   ├── budgets/
│   │   │   └── page.tsx        # Budget management
│   │   ├── reports/
│   │   │   └── page.tsx        # Reports and analysis
│   │   └── layout.tsx          # Shared dashboard layout
│   ├── page.tsx                # Landing/home page (redirects authenticated users to dashboard)
│   ├── layout.tsx              # Root layout (includes AuthProvider)
│   └── globals.css             # Global styles
├── components/                 # Reusable components
│   ├── ui/                     # shadcn/ui components
│   ├── auth/                   # Auth components
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── dashboard/              # Dashboard components
│   │   ├── recent-transactions.tsx
│   │   ├── expense-summary.tsx
│   │   └── category-breakdown.tsx
│   ├── transactions/           # Transaction components
│   │   ├── transaction-form.tsx
│   │   ├── transaction-list.tsx
│   │   ├── transaction-filters.tsx
│   │   └── csv-upload.tsx
│   └── layout/                 # Layout components
│       ├── header.tsx
│       ├── sidebar.tsx
│       └── footer.tsx
├── lib/                        # Utilities and helpers
│   ├── supabase/               # Supabase related
│   │   ├── client.ts           # Supabase client
│   │   ├── schema.ts           # Type definitions
│   │   └── queries/            # Database queries
│   │       ├── transactions.ts
│   │       └── categories.ts
│   ├── hooks/                  # Custom hooks
│   │   ├── use-auth.ts         # Auth hooks
│   │   ├── use-transactions.ts # Transaction data hooks
│   │   └── use-categories.ts   # Category data hooks
│   ├── utils/                  # Utility functions
│   │   ├── csv-parser.ts       # CSV parsing logic
│   │   ├── date-formatter.ts   # Date formatting utilities
│   │   └── currency.ts         # Currency formatting
│   ├── providers/              # Context providers
│   │   ├── auth-provider.tsx   # Authentication context ("use client")
│   │   └── query-provider.tsx
│   └── validations/            # Zod schemas
│       ├── transaction.ts
│       └── auth.ts
├── types/                      # TypeScript types
│   ├── transaction.ts
│   ├── category.ts
│   └── user.ts
└── config/                     # App configuration
    ├── site.ts                 # Site metadata
    └── dashboard.ts            # Dashboard configuration


Project Root Files:
├── .env.local                  # Environment variables
├── .cursorrules               # Cursor IDE rules
├── components.json            # Shadcn UI configuration
├── eslint.config.mjs         # ESLint configuration
├── next.config.ts            # Next.js configuration
├── package.json              # Project dependencies and scripts
├── postcss.config.mjs        # PostCSS configuration
└── tsconfig.json            # TypeScript configuration

This structure follows several important principles:

1. Route grouping - Using route groups in parentheses like (dashboard) to organize related routes without affecting the URL structure
2. Component categorization - Organizing components by feature (transactions, auth) and function (ui, layout)
3. Library organization - Separating database logic, hooks, and utilities into clear directories
4. Type safety - Dedicated types directory for shared TypeScript interfaces
5. Authentication and authorization - Using middleware for route protection and auth redirects
   - Middleware.ts handles redirection of authenticated users from home to dashboard
   - AuthProvider context manages auth state throughout the application