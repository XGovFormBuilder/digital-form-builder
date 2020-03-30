const { google } = require('googleapis')

class SheetsService {
  /**
   * google authentication options
   * @typedef { Object } GoogleAuthOpts
   * @params { object } credentials containing private_key and client_email
   * @params { string } credentials.private_key private key
   * @params { string } credentials.client_email service account email address
   * @params { string } projectId
   * @params { array } scopes
   * @see {@link https://developers.google.com/sheets/api/guides/authorizing} for scopes.
   */

  /**
   * Returns google auth client
   * @params {GoogleAuthOpts.credentials} credentials
   * @params {GoogleAuthOpts.project_id} projectId
   * @params {GoogleAuthOpts.scopes} scopes
   */
  googleAuthClient (authOptions) {
    // eslint-disable-next-line camelcase
    const { credentials, project_id, scopes } = authOptions
    return new google.auth.GoogleAuth({
      // Scopes can be specified either as an array or as a single, space-delimited string.
      credentials,
      project_id,
      scopes
    })
  }

  /**
   * Posts data to a spreadsheet.
   * @params { string } spreadsheetId...the spreadsheetId.
   * @params { array<string[]> } data the data to be written
   * @params { GoogleAuthOpts } authOptions
   * @params { string } [range='Sheet1'] which range ('tab', colloquially) to append to.
   * @returns { promise }
   */
  async appendTo (spreadsheetId, data, authOptions, range = 'Sheet1') {
    const auth = this.googleAuthClient(authOptions)
    const sheets = google.sheets({ version: 'v4', auth })

    return sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        'majorDimension': 'ROWS',
        'values': [data]
      }
    })
  }
}

module.exports = {
  SheetsService
}
