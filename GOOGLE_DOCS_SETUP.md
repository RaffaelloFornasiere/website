# Google Docs Integration Setup

## How It Works

Your website now fetches content from a Google Doc named "Website-content" in your Google Drive. The document supports the following sections:

- `[TITLE]` - Your name/title displayed in the header
- `[SUBTITLE]` - Your subtitle/tagline
- `[ABOUT ME]` - Your about section with automatic link detection
- `[PROJECT DEMOS]` - Your projects list with links

The parser automatically:
- Detects and formats links
- Preserves bullet lists
- Maintains text formatting

## To Run the Application

1. **Start the backend server** (handles Google API calls):
   ```bash
   npm run server
   ```

2. **In a new terminal, start the Angular dev server**:
   ```bash
   npm start
   ```

3. **Or run both together**:
   ```bash
   npm run dev
   ```

4. Visit `http://localhost:4200` to see your website

## How to Edit Content

1. Open your "Website-content" Google Doc
2. Edit any section between the `[SECTION_NAME]` markers
3. Save the document
4. Refresh your website to see the changes

## Important Files

- `server.js` - Backend server that fetches from Google Drive
- `src/app/services/google-docs.service.ts` - Angular service for API calls
- `src/app/features/home/home.component.ts` - Displays the parsed content
- `credentials.json` - Your service account credentials (keep private!)

## Notes

- The service account must have access to the Google Doc
- Links in the document are automatically converted to clickable links
- Lists are preserved as bullet points
- The content falls back to hardcoded values if Google Docs is unavailable