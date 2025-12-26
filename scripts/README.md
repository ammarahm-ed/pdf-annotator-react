# Version Management Scripts

This directory contains utility scripts for managing version numbers in the PDF Annotator React library.

## Increment Version Script

The `increment-version.js` script automatically increments the version number in both `package.json` and `CHANGELOG.md`.

### Usage

You can run the script directly:

```bash
# Increment patch version (0.1.1 -> 0.1.2)
node scripts/increment-version.js patch

# Increment minor version (0.1.1 -> 0.2.0)
node scripts/increment-version.js minor

# Increment major version (0.1.1 -> 1.0.0)
node scripts/increment-version.js major
```

Or use the npm scripts defined in package.json:

```bash
# Increment patch version
npm run version:patch

# Increment minor version
npm run version:minor

# Increment major version
npm run version:major
```

### Combined Publishing Workflow

We've also included combined scripts that increment the version, build the package, and publish it to npm in one command:

```bash
# Increment patch version and publish
npm run publish:patch

# Increment minor version and publish
npm run publish:minor

# Increment major version and publish
npm run publish:major
```

### How It Works

1. The script reads the current version from `package.json`
2. Increments it according to [Semantic Versioning](https://semver.org/) rules
3. Updates the version in `package.json`
4. Adds a new version section to `CHANGELOG.md` with today's date
5. Provides a template for filling in the changes in the new version

After running the script, you should:

1. Update the CHANGELOG.md with details about the new version
2. Commit these changes
3. Push to your repository
4. Publish the new version to npm

### Automating Version Management

By using these scripts, you can ensure consistent version numbering across your codebase and maintain a well-structured changelog for your users. 