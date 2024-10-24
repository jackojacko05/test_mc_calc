import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

if (!SPREADSHEET_ID || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
  console.error('Missing Google Sheets credentials');
  throw new Error('Missing Google Sheets credentials');
}

const serviceAccountAuth = new JWT({
  email: GOOGLE_CLIENT_EMAIL,
  key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
  ],
});

const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

export async function getSheetData(sheetTitle: string) {
  try {
    console.log(`Loading sheet: ${sheetTitle}`);
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[sheetTitle];
    if (!sheet) {
      console.error(`Sheet not found: ${sheetTitle}`);
      throw new Error(`Sheet not found: ${sheetTitle}`);
    }
    console.log(`Fetching rows from sheet: ${sheetTitle}`);
    const rows = await sheet.getRows();
    console.log(`Fetched ${rows.length} rows from sheet: ${sheetTitle}`);
    return rows.map(row => row.toObject());
  } catch (error) {
    console.error(`Error fetching data from sheet ${sheetTitle}:`, error);
    throw error;
  }
}
