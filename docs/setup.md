# Development Environment Setup

This document walks through the local development experience with the codebase,
and what you should know if you wish to contribute.

## JS Development

If you are working with JS files, you should ensure you have a recent version of
[NodeJS](https://nodejs.org) (v24+) and npm (v11+) installed. There
are helpful tools installed that require these to be available.

With those tools installed, you can then install the packages required:

```shellsession
$ npm install
```

We use `prettier` to enforce a consistent format to the code, and at any time
you can run this command to ensure your changes are formatted correctly:

```shellsession
$ npm run prettier
```

You should also ensure the code satisfies the rules defined in the `eslint.config.mjs`
config file:

```shellsession
$ npm run lint
```

These rules will be checked as part of every pull request into the project, but
please ensure you run these commands locally to catch any issues before a
reviewer gets involved.
