---
description: Use when answering technical questions about libraries, frameworks, APIs, or when the user asks for up-to-date documentation.
---

# Technical Documentation Research

When a user asks about:
- Library/framework APIs
- Framework features or configuration
- Best practices for a tool
- How to implement something specific
- Error messages or troubleshooting

## Process

1. **Resolve the library** using Context7's `resolve-library-id` tool
   - Examples: "react", "next.js", "typescript", "tailwind", "zod", "drizzle"
   - Handles typos and aliases

2. **Query the documentation** using Context7's `query-docs` tool
   - Be specific: "useEffect hook with dependencies"
   - Include version if known: "React 19"
   - Include context: "Next.js App Router migration"

3. **Provide version-specific answer**
   - Always cite the library version from Context7
   - Include working code examples
   - Link to official docs if available

4. **Avoid hallucinations**
   - Never guess at APIs
   - If Context7 doesn't have info, say so
   - Suggest checking the official documentation directly

## Example Flow

User: "How do I implement infinite scroll in React 19?"

1. Use Context7 to query "infinite scroll React 19"
2. Get real documentation with hooks (useIntersectionObserver, useCallback)
3. Provide code example with exact API from Context7
4. Cite: "React 19 Documentation"

## When to Use This Skill

- Technical questions about specific libraries
- API reference questions
- Framework configuration questions
- Troubleshooting with specific error messages
- Code examples or best practices

## When NOT to Use

- General programming concepts (algorithms, data structures)
- Architecture/design decisions (those need research_general skill)
- Non-technical topics
