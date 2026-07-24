# /security-review

Checks your pending changes for security vulnerabilities before you ship them.

## Usage

```
/security-review
```

Analyses the diff on your current branch, the changes you are about to commit or push, and reports the security issues it finds: injection risks, unsafe input handling, leaked secrets, authentication and access-control mistakes, and similar.

## How It Works

Claude reviews the changed code specifically through a security lens, separate from a general correctness pass. It reports findings for you to act on rather than silently rewriting code, so you stay in control of the fix.

## When to Use It

- Right before opening a pull request or pushing, as a final security pass
- After adding or changing anything that touches authentication, user input, file paths, or external requests
- Alongside `/code-review`: run the correctness review, then the security review, before you ship

## Tips

- Run it on a focused diff. A smaller, coherent set of changes gets a sharper review than a sprawling one
- It complements dedicated security tooling and human review for sensitive code, it does not replace them
- For a repo-wide or CI-integrated security setup, see the security plugins in the official docs

## Further Reading

- [Official docs: Commands reference](https://code.claude.com/docs/en/commands)
