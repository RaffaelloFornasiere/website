# Personal Portfolio Website

A modern, dynamic portfolio website built with Angular that integrates with Google Docs for content management. This allows you to update your website content directly from a Google Doc without touching code.

## Features

- **Dynamic Content Management**: Content is fetched from a Google Doc, allowing easy updates without code changes
- **Auto-Section Detection**: Automatically detects and renders sections from your Google Doc based on formatting
- **Responsive Design**: Built with Tailwind CSS for a clean, mobile-friendly interface
- **Interactive Background**: TypeScript-powered animated text effect in the background
- **Google Drive Integration**: Secure server-side integration with Google Drive API using service account authentication
- **Docker Support**: Fully containerized for easy deployment

## Architecture

```
Frontend (Angular) <-> Backend (Node.js/Express) <-> Google Docs API
```

- **Frontend**: Angular 19 application with signals for state management
- **Backend**: Express server that handles Google API authentication and protects credentials
- **Content Source**: Google Doc with structured sections that are parsed and displayed

## Prerequisites

- Node.js 20+
- npm
- Google Cloud Service Account with access to Google Docs API
- A Google Doc named "Website-content" with your portfolio content

## Google Docs Setup

1. Create a Google Doc named "Website-content" in your Google Drive
2. Share it with your service account email
3. Structure your content using section markers like `[TITLE]`, `[SUBTITLE]`, `[ABOUT ME]`, etc.
4. The parser will automatically detect:
   - Links in your text
   - Bullet lists
   - Section breaks

## Local Development

### Initial Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Place your `credentials.json` (Google service account key) in the root directory

### Running the Application

Start both the backend server and Angular dev server:
```bash
npm run dev
```

Or run them separately:
```bash
# Backend server (port 3000)
npm run server

# Angular dev server (port 4200)
npm start
```

Visit `http://localhost:4200` to see your website.

## Docker Deployment

### Build and Run with Docker Compose

```bash
cd docker
docker-compose up --build
```

The application will be available at `http://localhost:8888`

### Docker Configuration

The Docker setup includes:
- Multi-stage build for optimized image size
- Node.js server with Express
- Built Angular application served by the Node.js server
- Google credentials mounted as a volume (or baked into the image)

## Available Scripts

- `npm start` - Start Angular development server
- `npm run server` - Start backend Node.js server
- `npm run dev` - Start both servers concurrently
- `npm run build` - Build Angular application for production
- `npm test` - Run unit tests

## Project Structure

```
website/
├── src/                    # Angular source code
│   ├── app/
│   │   ├── features/
│   │   │   └── home/      # Main portfolio component
│   │   └── services/
│   │       └── google-docs.service.ts  # Google Docs integration
├── server.js              # Express backend server
├── credentials.json       # Google service account credentials (not in git)
├── docker/                # Docker configuration
│   ├── Dockerfile
│   └── docker-compose.yml
└── public/                # Static assets
```

## Content Management

Edit your Google Doc to update website content. The system supports:
- **Title & Subtitle**: Header information
- **About Me**: Personal introduction with automatic link detection
- **Project Demos**: List of projects with descriptions and links
- **Custom Sections**: Any section marked with `[SECTION_NAME]` will be auto-detected
- **Technologies**: Hardcoded skills section (remains in component)

## Security Notes

- Never commit `credentials.json` to version control
- The backend server protects your Google credentials from client exposure
- Use environment variables for production deployments
- Consider using Google Secret Manager for production credentials

## Technologies Used

- **Frontend**: Angular 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **APIs**: Google Drive API v3, Google Docs API v1
- **Build Tools**: Angular CLI, Docker
- **State Management**: Angular Signals

## License

This project is a personal portfolio website. Feel free to use it as a template for your own portfolio.

## Additional Resources

- [Google Docs API Documentation](https://developers.google.com/docs/api)
- [Angular Documentation](https://angular.dev)
- [Setting up Google Service Account](https://cloud.google.com/iam/docs/service-accounts-create)