# Repository Guidelines

## Project Structure & Module Organization
Source lives under `src/`, with bootstrap files in `main.ts` and routing config in `src/app/app.routes.ts`. Feature work goes inside `src/app`, keeping smart containers near their templates (`.ts`, `.html`, `.css`). Global styles belong in `src/styles.css`, while static assets (icons, mock JSON) belong in `public/`. Tests should mirror code location via sibling `*.spec.ts` files to keep coverage aligned with features.

## Build, Test, and Development Commands
- `npm start`: runs `ng serve` with live reload on `http://localhost:4200/`.
- `npm run build`: produces a production bundle in `dist/` using the Angular CLI optimizations.
- `npm run watch`: incremental development build that re-compiles without launching the dev server.
- `npm test`: executes Karma/Jasmine specs in headless Chrome; use `--code-coverage` to emit HTML reports under `coverage/`.
Always run `npm install` after pulling dependencies or switching Node versions.

## Coding Style & Naming Conventions
Use the workspace TypeScript config plus Prettier (`printWidth: 100`, single quotes, Angular HTML parser) to format code—run `npx prettier --write src/**/*.ts`. Keep indentation at two spaces. Name Angular classes in PascalCase (`DashboardComponent`) and files in kebab-case (`dashboard.component.ts`). Prefer standalone components and provide strong typing for all inputs/outputs. In templates, always use Angular's new control flow syntax (`@if`, `@for`, `@switch`) instead of the legacy structural directives. Keep CSS selectors scoped with the component host to avoid leaking styles.

## Testing Guidelines
Write Jasmine specs beside each feature (`feature.component.spec.ts`). Favor shallow component tests for UI logic and service tests for pure functions. Mock HTTP/Router dependencies via Angular TestBed providers. Require new features to include tests ensuring at least the previous coverage percentage; fail PR review if `npm test -- --watch=false` does not pass.

## Commit & Pull Request Guidelines
Use Conventional Commits (e.g., `feat: add loan summary card`, `fix: handle overdraft error`). Group work into logical commits under ~150 lines when possible. PRs must describe scope, testing evidence (`npm test` output or screenshots for UI), and link to tracking issues. Mention breaking changes explicitly and provide before/after visuals for user-facing updates.

## Security & Configuration Tips
Do not commit API keys or environment secrets; reference them via `.env` or CI variables. Review third-party dependencies before adding them and run `npm audit` when bumping packages.
