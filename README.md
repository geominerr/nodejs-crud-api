# CRUD API

## Description

This project is a simple CRUD API built with Node.js and TypeScript, featuring in-memory database support.

For API testing, you can use tools like [Postman](https://www.postman.com/downloads/) to interact with CRUD endpoints.

## Installation

**Make sure to install dependencies before running scripts:**

```bash
npm install
```

**To set the environment variables**

- **.env.example** file from the project's root directory.
- Remove the file extension, leaving the file named **.env** in the project's root.
- Edit the .env file by setting the values for the required environment variables.

## Scripts

**Start Development Server:**

Start the development server using ts-node-dev:

```bash
npm run start:dev
```

**Build and Start Production Server:**

Build TypeScript files and start the production server:

```bash
npm run start:prod
```

**Start Multi-Environment Server:**

Start the server with multi-environment mode using ts-node-dev and cross-env:

```bash
npm run start:multi
```

**Testing:**

Run tests:

```bash
npm test
```

Run tests with verbose output:

```bash
npm run test:verbose
```

Run tests with coverage:

```bash
npm run test:coverage
```

**Linting:**

Run ESLint for code linting:

```bash
npm run lint
```
