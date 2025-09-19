const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let authClient = null;

async function initializeAuth() {
  try {
    const credentialsPath = path.join(__dirname, 'credentials.json');
    if (!fs.existsSync(credentialsPath)) {
      throw new Error('credentials.json not found');
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/documents.readonly'
      ],
    });

    authClient = await auth.getClient();
    console.log('Google Auth initialized successfully');
  } catch (error) {
    console.error('Failed to initialize auth:', error.message);
  }
}

app.get('/api/google-docs/content', async (req, res) => {
  try {
    if (!authClient) {
      await initializeAuth();
    }

    const drive = google.drive({ version: 'v3', auth: authClient });
    const docs = google.docs({ version: 'v1', auth: authClient });

    // Search for the document
    const response = await drive.files.list({
      q: "name='Website-content' and mimeType='application/vnd.google-apps.document'",
      fields: 'files(id, name)',
    });

    if (response.data.files.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const docId = response.data.files[0].id;

    // Get document content
    const doc = await docs.documents.get({
      documentId: docId,
    });

    res.json(doc.data);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

app.get('/api/resume', async (req, res) => {
  try {
    if (!authClient) {
      await initializeAuth();
    }

    const drive = google.drive({ version: 'v3', auth: authClient });

    // Search for the resume PDF in the website folder
    // First, find the website folder
    const folderResponse = await drive.files.list({
      q: "name='website' and mimeType='application/vnd.google-apps.folder'",
      fields: 'files(id, name)',
    });

    if (folderResponse.data.files.length === 0) {
      return res.status(404).json({ error: 'Website folder not found' });
    }

    const folderId = folderResponse.data.files[0].id;

    // Search for PDF files in the folder
    const pdfResponse = await drive.files.list({
      q: `'${folderId}' in parents and (mimeType='application/pdf' and (name contains 'resume' or name contains 'cv' or name contains 'CV' or name contains 'Resume'))`,
      fields: 'files(id, name, mimeType)',
    });

    if (pdfResponse.data.files.length === 0) {
      // If no resume found, try to find any PDF in the folder
      const anyPdfResponse = await drive.files.list({
        q: `'${folderId}' in parents and mimeType='application/pdf'`,
        fields: 'files(id, name, mimeType)',
      });

      if (anyPdfResponse.data.files.length === 0) {
        return res.status(404).json({ error: 'Resume PDF not found in website folder' });
      }

      // Use the first PDF found
      pdfResponse.data.files = anyPdfResponse.data.files;
    }

    const resumeFile = pdfResponse.data.files[0];

    // Get the file content
    const fileResponse = await drive.files.get({
      fileId: resumeFile.id,
      alt: 'media',
    }, { responseType: 'stream' });

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${resumeFile.name}"`);

    // Stream the file to the response
    fileResponse.data.pipe(res);
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

// Serve Angular app in production
app.use(express.static(path.join(__dirname, 'dist/website/browser')));

// Catch all route for Angular routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist/website/browser/index.html'));
});

app.listen(PORT, async () => {
  await initializeAuth();
  console.log(`Server running on port ${PORT}`);
});