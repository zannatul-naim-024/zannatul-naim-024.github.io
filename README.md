# Zannatul Naim – Portfolio

A professional, maintainable portfolio site built with [Eleventy](https://www.11ty.dev/) (11ty). Content is stored in JSON data files so you can update copy without touching HTML.

## Development

```bash
# Install dependencies
npm install

# Build static site (output in dist/)
npm run build

# Run dev server with live reload (http://localhost:8080)
npm run serve
```

## Updating content

Edit the JSON files in `src/_data/`:

- **site.json** – Name, page title, resume PDF filename
- **about.json** – Tagline, bio, email, GitHub, LinkedIn
- **experience.json** – Work history (role, company, location, dates, bullets)
- **education.json** – Schools and degrees
- **projects.json** – Projects (name, description, URL, tags)
- **skills.json** – Skill categories and items
- **achievements.json** – Achievements and links

After editing, run `npm run build` to regenerate the site.

## Deployment (GitHub Pages)

### Option 1: GitHub Actions (recommended)

1. In the repo **Settings → Pages**, set **Source** to **GitHub Actions**.
2. Push to `main`. The workflow in `.github/workflows/deploy.yml` runs `npm run build` and deploys the `dist/` folder to GitHub Pages. No need to commit `dist/` or run the build locally.

### Option 2: Manual deploy

1. Run `npm run build`.
2. In the repo **Settings → Pages**, set **Source** to “GitHub Actions” (using the workflow above), or deploy the contents of `dist/` with your own hosting.

Asset and link URLs use relative paths so the site works at any base path (e.g. project pages at `username.github.io/repo-name/`).

## Project structure

```
├── src/
│   ├── _data/          # Content (JSON)
│   ├── css/main.css    # Styles
│   ├── js/main.js      # Nav, theme toggle, mobile menu
│   └── index.njk       # Main page template
├── public/             # Static assets (favicon, resume PDF)
├── dist/                # Build output (generated)
├── .eleventy.js        # 11ty config
└── package.json
```

## License

MIT
