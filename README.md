# OctWa Analyzer (Web)

A lightweight web UI for browsing Octra transactions, addresses, and epochs.

## Requirements

- Node.js 18+

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

## Notes

- Uses `/api/main` and `/api/scan` paths for API requests.
- When deploying to Vercel, configure rewrites to proxy these paths.
