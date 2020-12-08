import { google, Auth } from "googleapis";

export class SheetsService {
  googleAuthClient(authOptions: Auth.GoogleAuthOptions) {
    const { credentials, projectId, scopes } = authOptions;
    return new google.auth.GoogleAuth({
      credentials,
      projectId,
      scopes,
    });
  }

  async appendTo(
    spreadsheetId: string,
    data: any,
    authOptions: Auth.GoogleAuthOptions,
    range = "Sheet1"
  ) {
    const auth = this.googleAuthClient(authOptions);
    const sheets = google.sheets({ version: "v4", auth });

    return sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        majorDimension: "ROWS",
        values: [data],
      },
    });
  }
}
