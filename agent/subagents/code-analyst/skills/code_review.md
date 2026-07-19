---
description: Structured code review process for evaluating code quality, security, and performance.
---

# Code Review Process

## Steps

1. **Parse the Code**
   - Understand the overall structure
   - Identify main components and functions
   - Note dependencies and imports

2. **Functional Review**
   - Does it do what it should?
   - Are edge cases handled?
   - Are there off-by-one errors?
   - Are null/undefined values handled?

3. **Performance Analysis**
   - Are there algorithmic improvements? (O(n²) → O(n)?)
   - Are there database query optimizations?
   - Are there unnecessary computations?
   - Are there memory concerns?

4. **Security Scan**
   - Input validation
   - SQL injection risks
   - XSS vulnerabilities
   - CSRF protection
   - Authentication/authorization
   - Secrets management

5. **Quality Assessment**
   - Readability and naming
   - Code duplication (DRY)
   - SOLID principles
   - Error handling
   - Test coverage

6. **Maintainability**
   - Is it easy to understand?
   - Are comments helpful?
   - Is it consistent with the codebase?
   - Would a new developer understand it?

## Output

Provide:
- Summary of findings
- Strengths (what's done well)
- Issues (prioritized by severity)
- Specific recommendations
- Overall quality score
- Actionable next steps
