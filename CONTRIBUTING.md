# Contributing to Smart Inventory

Thank you for your interest in contributing!

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Run database setup: `npx prisma db push && npx prisma db seed`
5. Start development server: `npm run dev`

## Code Style

- We use TypeScript for type safety
- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

## Commit Messages

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build/tool changes

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npm test`
4. Run linting: `npm run lint`
5. Submit pull request with clear description

## Testing

- Write tests for new features
- Ensure existing tests pass
- Test across different browsers
- Test responsive design

## Reporting Issues

Include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details