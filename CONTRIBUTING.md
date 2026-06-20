# Contributing to Snip

Thank you for your interest in contributing to Snip! This document provides guidelines for contributing to the project.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (Node 20+ recommended)
- npm or pnpm
- Git
- A Supabase account (free tier)
- A Google Cloud account for Safe Browsing API key

### Setup Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Snip.git
   cd Snip
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ajiarl/Snip.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Setup environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Fill in your `.env` file with:
   - `DATABASE_URL` — Supabase Postgres connection string
   - `SAFE_BROWSING_API_KEY` — Google Safe Browsing API key (free, no billing)
   - `NEXT_PUBLIC_APP_URL` — http://localhost:3000 for local dev
   - `IP_HASH_SALT` — Any random string for development

6. **Run database migrations**:
   ```bash
   npm run db:migrate
   ```

7. **Start development server**:
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) to verify it works.

---

## 💻 Development Workflow

### Before You Start

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-number-description
   ```

### Branch Naming Convention

- `feature/description` — New features
- `fix/description` — Bug fixes
- `docs/description` — Documentation updates
- `refactor/description` — Code refactoring
- `test/description` — Test additions/updates

Examples:
- `feature/add-link-expiry`
- `fix/qr-code-download-error`
- `docs/update-deployment-guide`

---

## 📝 Coding Conventions

### General Guidelines

- Write **TypeScript** for all new code
- Use **functional components** with hooks (no class components)
- Follow the existing **project structure** and naming patterns
- Keep functions **small and focused** (single responsibility)
- Add **type annotations** for function parameters and return values

### Code Style

- **Formatting**: Use Prettier (will be auto-formatted on save if configured)
- **Linting**: Fix all ESLint warnings before committing
- **Naming**:
  - Components: `PascalCase` (e.g., `QRCode.tsx`, `ReportDialog.tsx`)
  - Functions: `camelCase` (e.g., `generateSlug`, `checkUrlSafety`)
  - Files: Match the component/function name
  - Constants: `UPPER_SNAKE_CASE` (e.g., `DANGEROUS_SCHEMES`)

### File Organization

```
app/               — Next.js App Router pages & API routes
components/        — Reusable React components
  ui/              — shadcn/ui base components
  [Feature].tsx    — Feature-specific components
lib/               — Utility functions, clients, helpers
drizzle/           — Database schema and migrations
```

### Tailwind CSS

- Use **Tailwind utility classes** for styling
- Follow the existing **design system**:
  - Background: `bg-background`, `bg-[#0a0a0a]`
  - Text: `text-on-surface`, `text-muted-foreground`
  - Accent: `text-[#bef227]`, `bg-[#bef227]`
  - Borders: `border-[#222222]`
- Use **responsive classes**: `md:flex-row`, `lg:text-xl`

### Database Changes

- Define schema changes in `drizzle/schema.ts`
- Generate migrations: `npm run db:generate`
- Test migrations locally before committing
- Include migration files in your PR

### Error Handling

- Always provide **user-friendly error messages** in **Bahasa Indonesia**
- Use **toast notifications** (Sonner) for user feedback
- Log errors to console for debugging: `console.error("Context:", error)`
- Validate inputs on both **client and server** using Zod schemas

---

## 🧪 Testing

### Run Existing Tests

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Unit tests
npm run test

# Unit tests in watch mode
npm run test:watch

# Build verification
npm run build
```

### Running E2E Tests

E2E tests require additional setup:

1. **Install Playwright browsers** (first time only):
   ```bash
   npx playwright install
   ```

2. **Start dev server** in one terminal:
   ```bash
   npm run dev
   ```

3. **Run E2E tests** in another terminal:
   ```bash
   npm run test:e2e
   ```

**Note**: E2E tests require:
- Running development server
- Valid `.env` configuration with database connection
- Safe Browsing API key

### Writing Tests

- **Unit tests**: Place in same directory as source file with `.test.ts` suffix
  - Example: `lib/validate-url.test.ts` for `lib/validate-url.ts`
  - Use Vitest framework
- **E2E tests**: Place in `tests/e2e/` directory with `.spec.ts` suffix
  - Example: `tests/e2e/feature.spec.ts`
  - Use Playwright framework

---

## 📤 Submitting Changes

### Commit Messages

Use clear, descriptive commit messages:

```
<type>: <description>

[optional body]
```

Types:
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `style:` — Code style changes (formatting, no logic change)
- `refactor:` — Code refactoring
- `test:` — Adding or updating tests
- `chore:` — Maintenance tasks

Examples:
```
feat: add link expiry feature
fix: QR code download not working on mobile
docs: update deployment instructions
refactor: simplify slug generation logic
```

### Pull Request Process

1. **Ensure your code passes all checks**:
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```

2. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

3. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Open a Pull Request**:
   - Go to [github.com/ajiarl/Snip](https://github.com/ajiarl/Snip)
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template:
     - **Description**: What does this PR do?
     - **Motivation**: Why is this change needed?
     - **Testing**: How did you test it?
     - **Screenshots**: For UI changes

5. **Respond to review feedback**:
   - Address reviewer comments
   - Push additional commits if needed
   - Re-request review when ready

### PR Checklist

- [ ] Code follows project coding conventions
- [ ] TypeScript type checking passes (`npm run typecheck`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Tested locally with dev server
- [ ] Database migrations included (if applicable)
- [ ] User-facing text is in Bahasa Indonesia
- [ ] UI is consistent with existing design system
- [ ] Error handling is user-friendly

---

## 🐛 Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) when creating issues.

Include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment (OS, browser, Node version)

---

## 💡 Requesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md).

Include:
- Clear description of the feature
- Use case / motivation
- Proposed solution (optional)
- Alternatives considered (optional)

---

## 📜 Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## 🙏 Thank You!

Your contributions make Snip better for everyone. We appreciate your time and effort!

If you have questions, feel free to:
- Open a [Discussion](https://github.com/ajiarl/Snip/discussions)
- Ask in an issue comment
- Reach out to maintainers

Happy coding! 🚀
