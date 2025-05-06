require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();
app.use(cors());

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];

app.get('/auth/search-console', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(url);
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  res.send('Autenticazione completata. Ora puoi fare richieste all'API.');
});

app.get('/search-data', async (req, res) => {
  try {
    const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });
    const response = await searchconsole.searchanalytics.query({
      siteUrl: 'https://www.studiosamo.it/',
      requestBody: {
        startDate: '2024-04-01',
        endDate: '2024-04-30',
        dimensions: ['query'],
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Errore nella richiesta a Search Console');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server avviato su http://localhost:${port}`);
});
