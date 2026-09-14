# OGEE Millwork PMA — Local Standalone

A no-login, no-Firebase local version of the OGEE Millwork PMA.

## Run it

### Easiest
Double-click `index.html`. Most features work directly from the filesystem.

### Recommended local server
From Terminal:

```bash
cd /path/to/ogee-pma-local
python3 -m http.server 8080
```

Then open:

`http://localhost:8080`

## Files

- `index.html` — app shell / dialogs
- `css/styles.css` — all styling
- `js/jobs.js` — bundled preview data
- `js/app.js` — board, filters, editing, subtasks, local persistence
- `assets/` — add logos/images here later

## Storage

Changes are saved in browser `localStorage` under:

`ogee-pma-v9-local`

The Reset button only restores the bundled preview data in this browser. It does not touch any live database.

## Included behavior

- 14 bundled jobs, including Frances Howell and 3015 Pacific
- Add/edit/delete jobs
- Move jobs between workflow columns
- Search + priority/job/employee filters
- Employee filtering includes subtask assignments
- Priority colors
- Details / Subtasks / Links tabs
- START / BLOCKED / COMPLETE workflow buttons
- Material readiness
- Subtask employee, due date, and completion tracking
- Dropbox Job Folder field
- ChatGPT Job Handoff field
- Management / Shop TV modes
- Local browser persistence

## Git

To put this project under Git version control:

```bash
git init
git add .
git commit -m "Initial OGEE PMA local standalone"
```
