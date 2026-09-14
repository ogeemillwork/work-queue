# OGEE Millwork PMA

TypeScript webapp version of the OGEE Millwork project manager — a kanban-style
work queue for shop jobs. Built with Next.js 14 (App Router), React 18, and
Tailwind CSS.

The original vanilla HTML/CSS/JS version lives in [`ogee-pma-local/`](ogee-pma-local)
as prior art; this app is a faithful port with the same look and behavior.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Features

- 14 bundled preview jobs, including Frances Howell and 3015 Pacific
- Add/edit/delete jobs
- Move jobs between workflow columns (Queued / In Progress / Blocked / Install / Complete)
- Search + priority/job/employee filters (employee filtering includes subtask assignments)
- Priority colors
- Details / Subtasks / Links tabs
- START / BLOCKED / COMPLETE workflow buttons
- Material readiness
- Subtask employee, due date, and completion tracking
- Dropbox Job Folder field
- ChatGPT Job Handoff field
- Management / Shop TV modes
- Local browser persistence

## Storage

Changes are saved in browser `localStorage` under `ogee-pma-v9-local` — the
same key as the vanilla version, so existing data in your browser carries over.
The Reset button only restores the bundled preview data in this browser.

## Structure

- `app/` — Next.js App Router shell (`layout.tsx`, `page.tsx`, `globals.css`)
- `components/` — `Board`, `JobCard`, `JobDialog`
- `lib/` — types, bundled preview data, localStorage persistence
