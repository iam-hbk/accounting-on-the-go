# Contributing to Bank Statement Analyzer

Welcome! This guide will help you get started contributing to the Bank Statement Analyzer app. This project helps users upload and analyze bank statements with AI-powered categorization and insights.

## 🏗️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Convex (serverless backend with real-time database)
- **Styling**: Tailwind CSS
- **AI Integration**: OpenAI GPT + Google Gemini
- **Authentication**: Convex Auth (currently anonymous auth)
- **Package Manager**: pnpm
- **Linting**: ESLint + TypeScript + Prettier

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (recommended package manager)
- **Git**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bank_statement_analyzer_app
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Convex
CONVEX_DEPLOYMENT=your-deployment-name

# OpenAI (for AI-powered transaction categorization)
OPENAI_API_KEY=your-openai-api-key

# Google AI (alternative AI provider)
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-key
```

### 4. Set Up Convex Backend

```bash
# Initialize Convex (if not already done)
npx convex dev

# This will:
# - Create a new Convex deployment
# - Generate the database schema
# - Start the development server
```

### 5. Start Development Servers

```bash
# Start both frontend and backend
pnpm dev

# Or start them separately:
pnpm dev:frontend  # Frontend only (http://localhost:5173)
pnpm dev:backend   # Convex backend only
```

The app will be available at `http://localhost:5173`.

## 📁 Project Structure

```
bank_statement_analyzer_app/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   │   ├── Dashboard.tsx           # Main dashboard
│   │   ├── FileUpload.tsx          # Bank statement upload
│   │   ├── TransactionTable.tsx    # Transaction display/editing
│   │   ├── CategoryManager.tsx     # Category management
│   │   └── ...
│   ├── lib/               # Utility functions
│   ├── App.tsx            # Main app component
│   └── main.tsx           # App entry point
├── convex/                # Backend Convex functions
│   ├── schema.ts          # Database schema
│   ├── transactions.ts    # Transaction-related functions
│   ├── categories.ts      # Category management
│   ├── aiParser.ts        # AI-powered statement parsing
│   ├── auth.ts            # Authentication setup
│   └── ...
├── package.json           # Dependencies and scripts
└── README.md             # Project overview
```

## 🗄️ Database Schema

The app uses three main tables:

- **`transactions`**: Individual transaction records from bank statements
- **`categories`**: User-defined categories for organizing transactions
- **`statements`**: Metadata about uploaded bank statement files

## 🛠️ Development Workflow

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding standards below

3. **Test your changes**:
   ```bash
   # Type checking
   pnpm lint
   
   # Build to ensure everything compiles
   pnpm build
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: describe your changes"
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** with a clear description of your changes

### Coding Standards

#### Frontend (React/TypeScript)
- Use functional components with hooks
- Follow the existing component structure and naming conventions
- Use TypeScript strictly - avoid `any` types where possible
- Use Tailwind CSS for styling with the existing design system
- Components should be in PascalCase (`TransactionTable.tsx`)

#### Backend (Convex)
- Follow Convex function patterns (queries, mutations, actions)
- Use proper TypeScript types for all function arguments and returns
- Include argument validators using `v.*` from `convex/values`
- Use descriptive function names and include JSDoc comments
- Internal functions should be prefixed with `internal`

#### Code Style
- Use 2 spaces for indentation
- Use semicolons
- Use double quotes for strings
- Follow existing ESLint configuration
- Use meaningful variable and function names

### Working with Convex

#### Database Operations
```typescript
// Query example
export const getTransactions = query({
  args: { userId: v.id("users") },
  returns: v.array(v.object({...})),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .collect();
  },
});

// Mutation example
export const createTransaction = mutation({
  args: { 
    description: v.string(),
    amount: v.number(),
    // ... other fields
  },
  returns: v.id("transactions"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("transactions", args);
  },
});
```

#### AI Integration
- AI parsing functions are in `convex/aiParser.ts`
- Use proper error handling for AI API calls
- Test with various bank statement formats

## 🧪 Testing

Currently, the project relies on manual testing. When adding features:

1. Test the happy path thoroughly
2. Test error conditions (invalid files, network errors, etc.)
3. Test with different bank statement formats
4. Verify real-time updates work correctly

## 🚨 Common Issues

### Convex Development
- **"Function not found"**: Make sure you've run `npx convex dev` and the function is properly exported
- **Type errors**: Ensure all Convex functions have proper argument and return type validators
- **Real-time not working**: Check that you're using Convex queries/mutations correctly in React components

### Frontend Issues
- **Import errors**: Use the `@/` alias for src imports (`import { cn } from "@/lib/utils"`)
- **Styling issues**: Follow the existing Tailwind theme in `tailwind.config.js`

### AI Integration
- **API key issues**: Ensure environment variables are properly set
- **Rate limiting**: Be mindful of API rate limits during development

## 📝 Commit Message Guidelines

Use conventional commit format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example: `feat: add transaction filtering by date range`

## 🤝 Getting Help

- Check existing issues and discussions
- Look at the [Convex documentation](https://docs.convex.dev/)
- Review the existing codebase for patterns and examples
- Ask questions in pull request discussions

## 📋 Useful Commands

```bash
# Development
pnpm dev                    # Start both frontend and backend
pnpm dev:frontend          # Frontend only
pnpm dev:backend           # Backend only

# Code Quality
pnpm lint                  # Run linting and type checking
pnpm build                 # Build for production

# Convex
npx convex dev             # Start Convex development server
npx convex dashboard       # Open Convex dashboard
npx convex logs            # View backend logs
npx convex deploy          # Deploy to production
```

## 🎯 Areas for Contribution

Here are some areas where contributions are especially welcome:

### Features
- **Advanced filtering and search** for transactions
- **Data visualization** (charts, spending trends)
- **Export functionality** (CSV, PDF reports)
- **Mobile responsiveness** improvements
- **Bulk transaction operations**
- **Custom categorization rules**

### Technical Improvements
- **Unit and integration tests**
- **Error handling** improvements
- **Performance optimizations**
- **Accessibility** (WCAG compliance)
- **Documentation** and code comments

### AI/ML Enhancements
- **Better transaction categorization** accuracy
- **Spending pattern analysis**
- **Budget recommendations**
- **Duplicate transaction detection**

Thank you for contributing to the Bank Statement Analyzer! 🚀
