# Cognitive Trainer

A lightweight React + TypeScript + Vite practice site for the two game types shown in the supplied reference screenshots:

- Memory / Grid Challenge
- Motion Challenge

It is deliberately frontend-only: no API calls, no external images, no fonts fetched at runtime, and no backend. Progress is stored in `localStorage`.

> This is an independent practice implementation. It is not affiliated with Capgemini or Aon and does not reproduce proprietary live assessment items.

## Requirements

- Node.js 20+
- npm 10+

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## GitHub + Vercel

1. Create a new GitHub repository.
2. Upload the project files.
3. Push to `main`.
4. Import the repository into Vercel.
5. Vercel detects Vite automatically.
6. Build command: `npm run build`
7. Output directory: `dist`

No environment variables are required.

## Performance choices

- Zero runtime network requests.
- No image/font/CDN dependencies.
- Procedural puzzle generation in the browser.
- CSS-only UI effects.
- `localStorage` for progress.
- Responsive pointer/touch interactions.
- Production Vite build with minification.
