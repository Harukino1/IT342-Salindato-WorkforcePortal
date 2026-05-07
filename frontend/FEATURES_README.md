Frontend vertical-slice layout

Feature entry points were added under `src/features/`:

- `features/auth` — login/register
- `features/attendance` — attendance page
- `features/leave` — leave request page
- `features/dashboard` — dashboard page

For now each feature file re-exports the existing implementation in `src/pages/` to keep changes minimal. You can gradually move component-level files (CSS, smaller components) into each feature folder as needed.
