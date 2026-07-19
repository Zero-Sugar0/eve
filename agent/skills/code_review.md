---
description: Use when reviewing code, analyzing pull requests, or evaluating code quality and best practices.
---

# Code Review & Analysis Process

Structured approach to reviewing code for quality, performance, security, and maintainability.

## Review Checklist

### 1. Functionality
- Does the code do what it's supposed to do?
- Are edge cases handled?
- Are error cases handled properly?
- Does it match the requirements?

### 2. Performance
- Are there N+1 query problems?
- Unnecessary re-renders (React)?
- Inefficient algorithms (O(n²) when O(n) is possible)?
- Memory leaks or resource exhaustion?
- Database query optimization?

### 3. Security
- Input validation and sanitization?
- SQL injection risks?
- XSS vulnerabilities?
- CSRF protection?
- Authentication/authorization checks?
- Secrets or keys hardcoded?
- Dependency vulnerabilities?

### 4. Code Quality
- Readability (naming, structure, comments)?
- DRY principle (Don't Repeat Yourself)?
- SOLID principles applied?
- Proper error handling and logging?
- Consistent with codebase style?
- Test coverage?

### 5. Maintainability
- Is the code easy to understand?
- Would a new developer understand it?
- Is it documented?
- Are dependencies reasonable?
- Are there technical debts?

## Review Output Format

```markdown
# Code Review: [File/PR Name]

## Summary
[1 paragraph overview of changes and overall assessment]

## ✅ Strengths
- [Good practice or improvement]
- [Clean implementation]
- [Good error handling]

## ⚠️ Issues Found

### Priority 1 (Critical)
- **Issue**: [Description]
- **Location**: [File:Line]
- **Fix**: [Suggested fix]
- **Why**: [Explanation]

### Priority 2 (Important)
- [Similar format]

### Priority 3 (Nice-to-have)
- [Similar format]

## 🎯 Suggestions for Improvement
- [Performance optimization]
- [Refactoring opportunity]
- [Pattern improvement]

## Questions for Author
- [Clarification needed]
- [Design decision questioned]

## Overall Assessment
[Final recommendation: Approve, Approve with changes, Request changes]
```

## Examples

**Things to praise:**
- "Good use of error boundaries"
- "Nice optimization with useMemo"
- "Clean separation of concerns"
- "Comprehensive error handling"

**Common issues to catch:**
- Missing null/undefined checks
- Inefficient React renders
- Blocking operations in main thread
- Unhandled promise rejections
- No validation of user input
- Hardcoded values that should be config
- Missing tests
- Poor variable naming

## When to Use This Skill

- Reviewing pull requests
- Evaluating code before merging
- Teaching code quality concepts
- Identifying technical debt
- Security audits
- Performance profiling reviews
