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

// Serve Angular app in production
app.use(express.static(path.join(__dirname, 'dist/website')));

// Catch all route for Angular routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist/website/index.html'));
});

app.listen(PORT, async () => {
  await initializeAuth();
  console.log(`Server running on port ${PORT}`);
});