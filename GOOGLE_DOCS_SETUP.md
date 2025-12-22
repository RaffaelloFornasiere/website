# Google Docs Integration Setup

## Overview

Your website dynamically fetches content from a Google Doc named "Website-content" in your Google Drive. This document now supports multiple pages, where each Google Doc **Tab** (or "Outline" section in older Docs) represents a distinct page on your website.

The application intelligently renders these pages:
- The tab titled "**Home**" (case-insensitive) uses a special layout with your header, social links, and hardcoded technologies section.
- All other tabs will use a **generic layout**, displaying only the content you've written within that tab, formatted with sections and lists.

## 1. Google API Access Setup

To allow your backend server to read your Google Doc, you need to set up a Google Cloud Project and a Service Account.

### Steps:

1.  **Create a Google Cloud Project (if you don't have one):**
    *   Go to the [Google Cloud Console](https://console.cloud.google.com/).
    *   Click "Select a project" at the top and then "NEW PROJECT".
    *   Give it a name and create it.

2.  **Enable Required APIs:**
    *   In your new project, navigate to "APIs & Services" > "Enabled APIs & services".
    *   Click "+ ENABLE APIS AND SERVICES".
    *   Search for and enable:
        *   `Google Drive API`
        *   `Google Docs API`

3.  **Create a Service Account:**
    *   Navigate to "IAM & Admin" > "Service Accounts".
    *   Click "+ CREATE SERVICE ACCOUNT".
    *   Follow the steps:
        *   **Service account name:** e.g., `website-content-reader`
        *   **Grant this service account access to project:** Select a role. `Viewer` is usually sufficient, or more specifically, `roles/viewer`.
        *   Continue and optionally grant users access to this service account (not strictly necessary for this setup).
    *   Click "DONE".

4.  **Generate a JSON Key File:**
    *   Back on the "Service Accounts" page, click on the email address of the service account you just created.
    *   Go to the "Keys" tab.
    *   Click "ADD KEY" > "Create new key".
    *   Select "JSON" as the key type and click "CREATE".
    *   A JSON file will be downloaded to your computer. **Rename this file to `credentials.json`** and place it in the **root directory of this project** (the same directory as `server.js` and `package.json`).
    *   **Keep this file secure and do NOT commit it to public repositories.** It contains credentials that grant access to your Google Cloud Project.

5.  **Share Your Google Doc with the Service Account:**
    *   Open your Google Doc named "**Website-content**".
    *   Click the "Share" button.
    *   In the "Share with people and groups" dialog, paste the **Service Account's email address** (found on the Service Accounts page in Google Cloud Console, e.g., `website-content-reader@your-project-id.iam.gserviceaccount.com`).
    *   Grant it **"Viewer"** access (or "Commenter" if you prefer, but "Viewer" is enough).

## 2. How to Structure Your Google Doc

The content for your website is pulled from a Google Doc titled "**Website-content**".

### Key Principles:

*   **Tabs are Pages:** Each "Tab" in your Google Doc will become a separate page on your website, accessible via the navigation.
*   **Sections:** Within each tab, use `[YOUR SECTION TITLE]` (e.g., `[About Me]`, `[Projects]`) to define content sections.
*   **Formatting:** Standard Google Doc features like bold, italics, bullet points, and links are generally preserved and parsed automatically.

### Example Structure:

#### **"Home" Tab (Special Layout):**

This tab should contain:
- `[TITLE]` - Your main name or title (e.g., `[Raffaello Fornasiere]`)
- `[SUBTITLE]` - Your tagline (e.g., `[Software Engineer | AI/ML]`)
- Any other `[SECTION_NAME]` sections you want to appear on your homepage (e.g., `[About Me]`, `[Experience]`).
    *   **Note:** The technologies listed below (`Technologies I'm confident with`, `Technologies I'm Learning`) are **hardcoded** in the `HomeComponent` template and are not pulled from the Google Doc.

#### **Other Tabs (Generic Layout):**

For any other tab (e.g., "Projects", "Blog", "Contact"):
- Simply use `[SECTION_NAME]` to define content blocks. The content within these sections will be rendered as-is.
- These tabs will **not** display the main header, social links, or hardcoded technologies section.

### Example of a Section in your Google Doc:

```
[About Me]
Things about you

[Projects]
- Project Name One – A description of the project. (Link to project)
- Project Name Two – Another cool project. (Link to project)
```
*(Remember to use Google Docs' built-in link feature for "(Link to project)" text)*

## 3. How to Edit Content

1.  Open your "Website-content" Google Doc.
2.  Navigate to the desired tab or create a new one.
3.  Edit content within `[SECTION_NAME]` blocks or create new ones.
4.  Save the document (Google Docs saves automatically).
5.  Refresh your website in the browser to see the changes reflected.

## 4. To Run the Application

1.  **Start the backend server** (handles Google API calls and serves the frontend in production):
    ```bash
    npm run server
    ```

2.  **In a new terminal, start the Angular development server**:
    ```bash
    npm start
    ```

3.  **Or run both together for development**:
    ```bash
    npm run dev
    ```

4.  Visit `http://localhost:4200` to see your website.

## 5. Important Files

-   `server.js` - Backend server that fetches from Google Drive.
-   `src/app/services/google-docs.service.ts` - Angular service for API calls and parsing Google Doc content.
-   `src/app/features/home/home.component.ts` - The component rendering the special "Home" page layout.
-   `src/app/features/generic-page/generic-page.component.ts` - The component rendering content for all other pages.
-   `credentials.json` - Your Google Service Account credentials (critical for API access, **keep private!**).

## Notes

-   The service account must have **Viewer** access to the Google Doc named "Website-content".
-   Links in the document are automatically converted to clickable links.
-   Lists are preserved as bullet points.
-   The content falls back to hardcoded values (if any are present in the `HomeComponent`) if Google Docs is unavailable or misconfigured.
