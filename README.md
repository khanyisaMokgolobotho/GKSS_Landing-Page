# Ga-Rankuwa Career Tech Expo 2026

Responsive landing page for the Ga-Rankuwa Career Tech Expo.

## Event Details

- Date: 7 May 2026
- Time: 09:00 - 13:00
- Venue: TUT Ga-Rankuwa Campus
- Registration: https://sonke.gklink.co/event/gcexpo

## Key Features

- Real-time countdown to expo day
- Responsive navigation with working in-page anchors
- About, experience, agenda, partners, and FAQ sections
- Live registration handoff to the Sonke public registration page
- Copy-link helper for sharing the registration URL
- Registration messaging aligned to gender, career-interest, role-capture, and confirmation-email requirements

## Project Structure

- `index.html` - Main landing page structure and content
- `styles.css` - Visual styling and responsive layout rules
- `script.js` - Countdown, reveal animations, FAQ interactions, and copy-link behavior
- `scripts/build-pages.ps1` - Creates the GitHub Pages deploy artifact and cache-busts static assets on each deploy
- `.github/workflows/deploy-pages.yml` - GitHub Pages deployment workflow

## Deployment

Pushes to `main` automatically trigger the GitHub Pages workflow.

The workflow now builds a `dist/` artifact before deploy and appends a deploy-specific version to `styles.css` and `script.js`, which helps the live site pick up fresh changes without users needing a hard refresh.
