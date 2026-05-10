# Jain Tours Online

A modern travel website built with Vite, React, TypeScript, Tailwind CSS, and Supabase. This project showcases an immersive travel experience with destination browsing, itinerary preview, contact inquiry handling, and a rich UI powered by shadcn components and 3D globe visuals.

## Features

- Multi-page React routing: Home, Destinations, Services, Reviews, About, Contact
- Dynamic destination detail pages
- Inquiry forms stored in Supabase
- Itinerary viewer with Supabase storage integration
- 3D globe and destination interaction using `@react-three/fiber`
- Responsive design with Tailwind CSS and shadcn/ui patterns
- Client-side data fetching and caching with React Query
- Supabase Functions integration for admin itinerary workflows

## Tech stack

- Vite
- React 18
- TypeScript
- Tailwind CSS
- Radix UI via `@radix-ui/react-*`
- `@react-three/fiber` and `three`
- Supabase JavaScript client
- React Router DOM
- React Hook Form
- Zod validation
- Vitest for tests

## Getting started

### Prerequisites

- Node.js 18 or newer
- A package manager such as `npm`, `pnpm`, or `yarn`

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env` file in the project root with the following values:

```env
VITE_SUPABASE_URL=https://your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

If the project uses Supabase Functions or custom storage, also ensure your Supabase project includes the required schema and storage buckets.

### Run the app

```bash
npm run dev
```

Open the local dev server URL shown in the terminal.

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Scripts

- `npm run dev` – start the development server
- `npm run build` – build the production site
- `npm run build:dev` – build with development mode
- `npm run preview` – preview the production build locally
- `npm run lint` – run ESLint checks
- `npm run test` – run Vitest once
- `npm run test:watch` – run Vitest in watch mode

## Supabase integration

The app uses Supabase for:

- Storing inquiry submissions via `src/components/site/InquiryForm.tsx`
- Loading destination cover images and itinerary assets from Supabase Storage
- Calling the `admin-itineraries` function for admin itinerary operations

Supabase configuration is located in `src/integrations/supabase/client.ts` and typed via `src/integrations/supabase/types.ts`.

## Project structure

- `src/` – main application code
- `src/pages/` – top-level route pages
- `src/components/` – reusable UI and site components
- `src/hooks/` – custom hooks
- `src/lib/` – utility helpers
- `src/integrations/` – Supabase client and types
- `supabase/` – Supabase functions and database migrations

## Notes

- The project includes a `bun.lockb` lockfile, but scripts are compatible with npm.
- Update Supabase environment keys before launching the app.
- Use the existing migrations in `supabase/migrations/` if deploying with Supabase.

## License

This repository does not specify a license. Add one if you want to make the project open source.
