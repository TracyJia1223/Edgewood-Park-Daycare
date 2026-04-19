// ── Edgewood Park Daycare — Contact Form Handler ─────────────────────────
// Paste this entire file into: Google Sheet → Extensions → Apps Script
// Then deploy as a Web App (see README below) and paste the URL into index.html

const SHEET_ID     = '1vy3165CcXvdL1SbJWz8QKqhF-sc2UBzRAGXLwlFQAkk';
const NOTIFY_EMAIL = 'edgewoodparkchildcare@gmail.com';

function doPost(e) {
  try {
    const raw = e.postData ? e.postData.contents : '';
    const data = JSON.parse(raw);

    // ── Write to sheet ────────────────────────────────────────────────────
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheets()[0];

    // Add header row on first use
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp (PT)',
        'Parent Name',
        "Child's Name",
        "Child's Age",
        'Email',
        'Phone',
        'Preferred Tour Date',
        'Preferred Start Date',
        'Message'
      ]);
      sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
    }

    sheet.appendRow([
      new Date().toLocaleString('en-CA', { timeZone: 'America/Vancouver' }),
      data.parentName  || '',
      data.childName   || '',
      data.childAge    || '',
      data.email       || '',
      data.phone       || '',
      data.visitDate   || '',
      data.startDate   || '',
      data.message     || ''
    ]);

    // ── Send email notification ───────────────────────────────────────────
    const subject = `New Inquiry — ${data.parentName} (${data.childName}, ${data.childAge})`;

    const body =
      `Hi Linda,\n\n` +
      `You have a new inquiry from the Edgewood Park website:\n\n` +
      `Parent Name:          ${data.parentName}\n` +
      `Child's Name:         ${data.childName}\n` +
      `Child's Age:          ${data.childAge}\n` +
      `Email:                ${data.email}\n` +
      `Phone:                ${data.phone       || '(not provided)'}\n` +
      `Preferred Tour Date:  ${data.visitDate   || '(not specified)'}\n` +
      `Preferred Start Date: ${data.startDate   || '(not specified)'}\n\n` +
      `Message:\n${data.message || '(none)'}\n\n` +
      `──────────────────────────────────────\n` +
      `View all submissions:\n` +
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit\n`;

    GmailApp.sendEmail(NOTIFY_EMAIL, subject, body);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log(err);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('Edgewood Park form handler is active.');
}

// ── Quick test — run this manually in the Apps Script editor to verify ────
function testEmail() {
  const fakeData = {
    parentName: 'Test Parent',
    childName:  'Test Child',
    childAge:   '12 months',
    email:      'test@example.com',
    phone:      '604-000-0000',
    visitDate:  'Any morning',
    startDate:  'September 2025',
    message:    'This is a test submission.'
  };
  const ss    = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp (PT)','Parent Name',"Child's Name","Child's Age",'Email','Phone','Preferred Tour Date','Preferred Start Date','Message']);
    sheet.getRange(1,1,1,9).setFontWeight('bold');
  }
  sheet.appendRow([
    new Date().toLocaleString('en-CA', { timeZone: 'America/Vancouver' }),
    fakeData.parentName, fakeData.childName, fakeData.childAge,
    fakeData.email, fakeData.phone, fakeData.visitDate, fakeData.startDate, fakeData.message
  ]);
  GmailApp.sendEmail(NOTIFY_EMAIL, 'TEST — New Inquiry (Edgewood Park)', JSON.stringify(fakeData, null, 2));
  Logger.log('Test done — check your sheet and email.');
}

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  HOW TO DEPLOY (one-time setup, ~3 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Open your Google Sheet
2. Click  Extensions → Apps Script
3. Delete any existing code and paste this entire file
4. Click  Deploy → New deployment
5. Click the gear icon next to "Type" → choose  Web app
6. Set:
     Description:  Daycare contact form handler
     Execute as:   Me (edgewoodparkchildcare@gmail.com)
     Who has access:  Anyone
7. Click  Deploy → copy the Web App URL
8. In index.html, replace the placeholder:
     const SCRIPT_URL = 'PASTE_YOUR_WEB_APP_URL_HERE';
9. Commit and push to GitHub — done!

Note: If you re-deploy later, choose "New deployment" again
(not "Manage deployments") so the URL updates.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/
