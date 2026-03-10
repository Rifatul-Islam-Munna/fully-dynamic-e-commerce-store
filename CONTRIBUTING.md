# Contributing to Fully Dynamic E-Commerce Website

Thank you for your interest in contributing! This project is open source and welcome contributions from the community.

---

## How to Contribute

### 1. Fork the Repository

Click the "Fork" button at the top right of this repository to create your own copy.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/fully-dynaimc-e-commer-website.git
cd fully-dynaimc-e-commer-website
```

### 3. Create a Branch

Create a new branch for your feature or bug fix:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 4. Set Up Development Environment

#### Backend Setup

```bash
cd backend
npm install
# Create .env file (see README.md for required variables)
npm run start:dev
```

#### Frontend Setup

```bash
cd frontend
npm install
# Create .env file (see README.md)
npm run dev
```

### 5. Make Your Changes

- Follow the existing code style and conventions
- Write clean, readable code
- Add comments when necessary
- Test your changes locally

### 6. Commit Your Changes

```bash
git add .
git commit -m "Description of your changes"
```

Follow conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `refactor:` for code refactoring
- `test:` for adding tests

### 7. Push to Your Fork

```bash
git push origin your-branch-name
```

### 8. Submit a Pull Request

1. Go to the original repository
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill in the PR template with:
   - Description of changes
   - Related issue number (if applicable)
   - Screenshots for UI changes
5. Submit the pull request

---

## Code Style Guidelines

### Backend (NestJS)
- Use TypeScript
- Follow NestJS best practices
- Use class-validator for validation
- Add DTOs for all endpoints
- Write service unit tests

### Frontend (Next.js)
- Use TypeScript
- Follow React/Next.js conventions
- Use shadcn/ui components
- Use Tailwind CSS for styling
- Keep components small and reusable

---

## Reporting Issues

If you find a bug or have a suggestion:

1. Search existing issues first
2. Create a new issue with:
   - Clear title
   - Detailed description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior

---

##pull Request Guidelines

- Keep PRs focused and small
- Include relevant tests
- Update documentation if needed
- Ensure all tests pass
- Be responsive to feedback

---

## License

By contributing, you agree that your contributions will be licensed under the project's license.

---

## Questions?

Feel free to open an issue for questions about contributing.
