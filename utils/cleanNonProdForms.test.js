const fs = require("fs");
const path = require("path");
const {
  cleanNonProdForms,
  TARGET_DIR,
  PROD_FORMS,
} = require("./cleanNonProdForms");

jest.mock("fs");

describe("cleanNonProdForms", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("deletes non-production JSON files and keeps prod ones", () => {
    const mockFiles = [
      "ReportAnOutbreak.json", // keep
      "close-contact-feedback.json", // keep
      "dev-test.json", // delete
      "example.json", // delete
      "notes.txt", // ignore (not json)
    ];

    fs.readdirSync.mockReturnValue(mockFiles);

    const unlinkMock = fs.unlinkSync.mockImplementation(() => {});

    cleanNonProdForms();

    // Expect delete called only for non-prod .json files
    expect(unlinkMock).toHaveBeenCalledTimes(2);
    expect(unlinkMock).toHaveBeenCalledWith(
      path.join(TARGET_DIR, "dev-test.json")
    );
    expect(unlinkMock).toHaveBeenCalledWith(
      path.join(TARGET_DIR, "example.json")
    );

    // Verify prod files were NOT deleted
    expect(unlinkMock).not.toHaveBeenCalledWith(
      path.join(TARGET_DIR, "ReportAnOutbreak.json")
    );
    expect(unlinkMock).not.toHaveBeenCalledWith(
      path.join(TARGET_DIR, "close-contact-feedback.json")
    );
  });

  test("handles directory read error gracefully", () => {
    const mockError = new Error("read error");

    fs.readdirSync.mockImplementation(() => {
      throw mockError;
    });

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});

    cleanNonProdForms();

    expect(consoleSpy).toHaveBeenCalledWith(
      `[ERROR] Could not read directory: ${mockError.message}`
    );

    expect(mockExit).toHaveBeenCalledWith(1);

    consoleSpy.mockRestore();
    mockExit.mockRestore();
  });
});
