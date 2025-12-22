# Personal Portfolio Website

A modern, dynamic portfolio website built with Angular that leverages Google Docs for content management. This allows you to update your website's pages and content directly from a Google Doc with tabs, without needing to modify or redeploy code.

## Features

-   **Dynamic Multi-Page Content**: Content for different sections/pages of the website is fetched from a single Google Doc, where each **tab** in the doc represents a distinct page.
-   **Adaptive Page Layouts**:
    *   The "Home" page (from the Google Doc tab named "Home") features a custom layout with a hero header, social links, and a hardcoded technologies section.
    *   All other pages (from other Google Doc tabs) use a generic layout that renders only the content defined within that specific tab.
-   **Auto-Section Detection**: Automatically detects and renders content sections from your Google Doc based on `[SECTION_TITLE]` markers.
-   **Intelligent Content Parsing**: Automatically detects and formats links, preserves bullet lists, and maintains text formatting from Google Docs.
-   **Responsive Design**: Built with Tailwind CSS for a clean, mobile-friendly interface, including responsive navigation for multi-page content.
-   **Google Drive Integration**: Secure server-side integration with Google Drive and Docs APIs using service account authentication.
-   **Docker Support**: Fully containerized for easy deployment.

## How It Works

This project uses a Node.js/Express backend to securely fetch content from a designated Google Doc. An Angular frontend then parses this content, structuring it into pages based on Google Doc tabs, and renders it dynamically.

For detailed instructions on how to set up Google API access, structure your Google Doc, and manage your website's content, please refer to the **[Google Docs Integration Setup Guide](GOOGLE_DOCS_SETUP.md)**.

## Prerequisites

-   Node.js 20+
-   npm
-   Access to a Google Cloud Project for API credentials (see setup guide)
-   A Google Doc named "Website-content" for your portfolio content

## Local Development

### Initial Setup

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Configure Google API Access**: Follow the steps in **[Google Docs Integration Setup Guide](GOOGLE_DOCS_SETUP.md)** to obtain your `credentials.json` file and place it in the project's root directory.

### Running the Application

Start both the backend server (which handles Google API calls) and the Angular development server:
```bash
npm run dev
```

Alternatively, you can run them separately:
```bash
# Start the backend server (runs on port 3000 by default)
npm run server

# Start the Angular development server (runs on port 4200 by default)
npm start
```

Visit `http://localhost:4200` to see your website.

## Docker Deployment

### Build and Run with Docker Compose

```bash
cd docker
docker-compose up --build
```

The application will typically be available at `http://localhost:8888` (check `docker-compose.yml` for specific port mapping).

### Docker Configuration

The Docker setup includes:
-   Multi-stage build for optimized image size.
-   Node.js server with Express.
-   Built Angular application served by the Node.js server.
-   Google credentials mounted as a volume (or baked into the image, handle with care!).

## Available Scripts

-   `npm start` - Start Angular development server.
-   `npm run server` - Start backend Node.js server.
-   `npm run dev` - Start both servers concurrently.
-   `npm run build` - Build Angular application for production.
-   `npm test` - Run unit tests.

## Project Structure

```
website/
├── src/                    # Angular source code
│   ├── app/
│   │   ├── features/
│   │   │   ├── home/           # Main portfolio component (Home page layout)
│   │   │   └── generic-page/   # Component for generic page content
│   │   └── services/
│   │       └── google-docs.service.ts  # Google Docs API integration and content parsing
├── server.js              # Express backend server
├── GOOGLE_DOCS_SETUP.md   # Detailed guide for Google Docs API and content management
├── credentials.json       # Google service account credentials (DO NOT COMMIT)
└── public/                # Static assets
```

## Technologies Used

-   **Frontend**: Angular 19, TypeScript, Tailwind CSS, Angular Signals, Angular Router
-   **Backend**: Node.js, Express
-   **APIs**: Google Drive API v3, Google Docs API v1
-   **Build Tools**: Angular CLI, Docker, concurrently
-   **State Management**: Angular Signals

## License

This project is a personal portfolio website. Feel free to use it as a template for your own portfolio.

## Additional Resources

-   [Google Docs API Documentation](https://developers.google.com/docs/api)
-   [Angular Documentation](https://angular.dev)
-   [Setting up Google Service Account](https://cloud.google.com/iam/docs/service-accounts-create)
