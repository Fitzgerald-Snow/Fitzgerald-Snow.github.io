# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Fitzgerald Snow's personal website built with HTML, CSS, and JavaScript. It's a static portfolio and blog site that features a hybrid access system for Firebase-based content.

## Key Architecture

### Hybrid Access System
The site implements a dual-mode system for Firebase content:
- **Complete Mode**: Full Firebase functionality for users with unrestricted access
- **Reading Mode**: Static content fallback for users with restricted Firebase access (e.g., China)

The system automatically detects Firebase connectivity and switches modes accordingly, ensuring content accessibility for all users.

### Core Components
- **Static HTML Pages**: Individual HTML files for different sections (index.html, gallery.html, thoughts.html, etc.)
- **Firebase Integration**: Real-time data for the "thoughts" system with Firestore backend
- **Static Fallback**: Pre-generated JavaScript files with cached Firebase data
- **Tailwind CSS**: Styling via CDN with custom CSS classes

## Development Commands

### Build and Development
```bash
# Development server
npm run dev

# Production build
npm run build

# Sync Firebase data to static files
npm run sync-thoughts
```

### Firebase Data Synchronization
The site includes a custom synchronization system:
```bash
# Manual sync (requires firebase-service-account.json)
npm run sync-thoughts

# This updates thoughts-static.js with latest Firebase data
```

## File Structure

### Critical Files
- `index.html` - Main homepage with portfolio sections
- `thoughts.html` - Blog/thoughts page with Firebase integration
- `sync-thoughts.js` - Firebase to static data synchronization script
- `thoughts-static.js` - Auto-generated static data file (fallback)
- `firebase-service-account.json` - Firebase credentials (not in git, required for sync)

### Pages
- `gallery.html` - Image gallery
- `music.html` - Music section
- `article.html` - Article content
- `research.html` - Research content
- `admin.html` - Administrative interface

## Firebase Configuration

### Setup Requirements
1. Firebase service account key must be saved as `firebase-service-account.json` in project root
2. Database URL: `https://snow-s-garage.firebaseio.com`
3. Collection: `thoughts` (ordered by timestamp desc)

### Data Synchronization Process
The sync process:
1. Connects to Firebase using service account
2. Fetches all documents from `thoughts` collection
3. Transforms data format for static use
4. Generates `thoughts-static.js` with fallback data
5. Should be run periodically to keep static content updated

## Styling Guidelines

- Uses Tailwind CSS via CDN
- Custom CSS classes defined in `<style>` blocks within HTML files
- Times New Roman font family for body text
- Color scheme: slate grays with sky blue accents
- Responsive design with container classes

## Security Considerations

- `firebase-service-account.json` is gitignored (contains private keys)
- `thoughts-static.js` is safe to commit (no sensitive data)
- Static mode removes personal data like upvotedBy arrays

## Content Management

### Thoughts System
- Supports both real-time Firebase data and static fallback
- Automatic mode switching based on connectivity
- Upvoting functionality (disabled in reading mode)
- Admin functions for CRUD operations (Firebase mode only)

### Static Content Updates
Regular synchronization recommended:
- Set up cron jobs or GitHub Actions for automated syncing
- Manual sync before major deployments
- Commit updated `thoughts-static.js` after sync