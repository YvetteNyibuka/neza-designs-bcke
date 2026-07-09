# Neza Designs Backend

Backend API for the Neza Designs website.

Built with Node.js, Express, TypeScript, MongoDB, and Nodemailer. Media is stored locally in `uploads/`.

## Quick Start

1. Install dependencies.

```bash
npm install
```

2. Create a `.env` file with your environment variables.

3. Seed the admin user.

```bash
npm run seed:admin
```

4. Start the app in development.

```bash
npm run dev
```

Default local URL: `http://localhost:5000`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run seed:admin
npm run seed:content
npm run type-check
```

## API

Base URL:

```text
/api/v1
```

Common endpoints:

- `GET /api/v1/health`
- `GET /api/v1/projects`
- `GET /api/v1/posts`
- `GET /api/v1/services`
- `GET /api/v1/team`
- `GET /api/v1/settings`
- `POST /api/v1/contact`
- `POST /api/v1/auth/login`

## Deployment

This repo includes `render.yaml` for Render deployment.

Render settings:

- Build command: `npm ci && npm run build`
- Start command: `npm run start`
- Health check: `/api/v1/health`

Set the required environment variables in Render before deploying.
