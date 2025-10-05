# Contributing to Coin Flip On-Chain

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Coinfliponchain.git
   cd Coinfliponchain
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```
5. **Start the development server**:
   ```bash
   npm run dev
   ```

## Development Workflow

1. **Create a new branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Write clean, readable code
   - Follow the existing code style
   - Add comments for complex logic
   - Test your changes thoroughly

3. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request**:
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill in the PR template
   - Submit the PR

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add on-chain flip functionality
fix: resolve wallet connection issue
docs: update README with deployment instructions
```

## Code Style

### TypeScript/JavaScript

- Use TypeScript for all new files
- Use functional components with hooks
- Follow ESLint rules
- Use meaningful variable names
- Add JSDoc comments for functions

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Keep custom CSS minimal
- Use CSS variables for theming

### File Structure

```
components/     # React components
  ├── ComponentName.tsx
hooks/          # Custom React hooks
  ├── useHookName.ts
app/            # Next.js app directory
  ├── page.tsx
  ├── layout.tsx
  └── api/      # API routes
contracts/      # Smart contracts
  └── ContractName.sol
```

## What to Contribute

### Good First Issues

Look for issues labeled `good first issue` or `help wanted`:
- Documentation improvements
- UI/UX enhancements
- Bug fixes
- Test coverage improvements

### Feature Ideas

- Additional game modes
- Multiplayer functionality
- Leaderboards
- Token rewards
- NFT integration
- Social features
- Advanced statistics

### Bug Reports

When reporting bugs, include:
- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Browser/device information
- Error messages

### Feature Requests

When requesting features, include:
- Clear description of the feature
- Use cases and benefits
- Potential implementation approach
- Mockups or examples (if applicable)

## Testing

Before submitting a PR:

1. **Test locally**:
   ```bash
   npm run dev
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Test all features**:
   - Local coin flip
   - On-chain coin flip
   - Wallet connection
   - Responsive design
   - Dark mode

4. **Check for errors**:
   - Browser console
   - Terminal output
   - Network requests

## Smart Contract Contributions

When contributing to smart contracts:

1. **Security First**:
   - Follow best practices
   - Avoid reentrancy vulnerabilities
   - Use SafeMath (if needed)
   - Implement access control

2. **Testing**:
   - Write comprehensive tests
   - Test edge cases
   - Use test coverage tools

3. **Gas Optimization**:
   - Optimize storage usage
   - Minimize external calls
   - Use efficient data structures

4. **Documentation**:
   - Add NatSpec comments
   - Document function parameters
   - Explain complex logic

## Code Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be acknowledged

## Questions?

- Open an issue for questions
- Join our community discussions
- Check existing issues and PRs

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

## Thank You!

Your contributions help make this project better for everyone. We appreciate your time and effort! 🙏

---

Happy coding! 🚀
