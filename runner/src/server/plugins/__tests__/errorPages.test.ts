import { expect } from "@hapi/code";
import type { HapiRequest } from "../../types";
import { script } from "@hapi/lab";
import * as Sinon from "sinon";
import fs from "node:fs";

import {
  extractFormIdFromPath,
  getView,
  findView,
  handleApplicationError,
} from "../errorPages";

const lab = script();

const { describe, it, beforeEach, afterEach } = lab;

// Helper to stub fs.existsSync with pattern matching
const stubFsExistsSync = (
  sandbox: any,
  pathPatterns: { [pattern: string]: boolean }
) => {
  return sandbox.stub(fs, "existsSync").callsFake((filePath: string) => {
    // The patterns use "/", but path.join gives "\" on Windows.
    const normalisedPath = filePath.replace(/\\/g, "/");
    for (const [pattern, exists] of Object.entries(pathPatterns)) {
      if (normalisedPath.includes(pattern)) {
        return exists;
      }
    }
    return false;
  });
};

// Helper to create mock response toolkit
const createMockResponse = (): any => ({
  view: Sinon.stub().returnsThis(),
  code: Sinon.stub().returnsThis(),
});

// Helper to create mock request
const createMockRequest = (path: string) =>
  ({
    path,
    log: Sinon.stub(),
  } as any as HapiRequest);

describe("extractFormIdFromPath", () => {
  const testCases = [
    ["/", undefined],
    ["", undefined],
    ["/my-form", "my-form"],
    ["/my-form/start", "my-form"],
    ["/my-form/", "my-form"],
    ["/form-123", "form-123"],
    ["/a/b/c/d", "a"],
  ];

  testCases.forEach(([path, expected]) => {
    it(`should return ${expected} for path "${path}"`, () => {
      expect(extractFormIdFromPath(path as string)).to.equal(expected);
    });
  });
});

describe("getView", () => {
  let sandbox: typeof Sinon;

  beforeEach(() => {
    sandbox = Sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  const testCases = [
    // [folder, view, fileExists, expectedResult]
    ["errors", "404", true, "errors/404"],
    ["errors", "404", false, undefined],
    ["my-form", "500", true, "my-form/500"],
    ["my-form", "500", false, undefined],
    ["", "error", true, "error"],
    ["", "error", false, undefined],
  ];

  testCases.forEach(([folder, view, fileExists, expected]) => {
    it(`should return ${expected} when folder="${folder}", view="${view}", exists=${fileExists}`, () => {
      const pattern = folder
        ? `views/${folder}/${view}.html`
        : `views/${view}.html`;
      stubFsExistsSync(sandbox, { [pattern]: fileExists as boolean });

      const result = getView(folder as string, view as string);
      expect<unknown>(result).to.equal(expected);
    });
  });
});

describe("findView", () => {
  let sandbox: typeof Sinon;

  beforeEach(() => {
    sandbox = Sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should return undefined when no folders have the view", () => {
    stubFsExistsSync(sandbox, {});
    const result = findView(["folder1", "folder2", ""], "error");
    expect(result).to.equal(undefined);
  });

  it("should return the view from the first matching folder", () => {
    stubFsExistsSync(sandbox, {
      "views/folder1/error.html": false,
      "views/folder2/error.html": true,
    });
    const result = findView(["folder1", "folder2", ""], "error");
    expect(result).to.equal("folder2/error");
  });

  it("should return the view from the first folder when it exists", () => {
    stubFsExistsSync(sandbox, {
      "views/folder1/error.html": true,
      "views/folder2/error.html": true,
    });
    const result = findView(["folder1", "folder2", ""], "error");
    expect(result).to.equal("folder1/error");
  });

  it("should skip undefined folders in the list", () => {
    stubFsExistsSync(sandbox, {
      "views/folder2/error.html": true,
    });
    const result = findView([undefined, "folder2", ""], "error");
    expect(result).to.equal("folder2/error");
  });

  it("should return view from generic folder when no specific folder matches", () => {
    stubFsExistsSync(sandbox, {
      "views/error.html": true,
    });
    const result = findView(["specific", undefined, ""], "error");
    expect(result).to.equal("error");
  });
});

describe("handleApplicationError", () => {
  let sandbox: typeof Sinon;

  beforeEach(() => {
    sandbox = Sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should use custom page if provided and exists", () => {
    stubFsExistsSync(sandbox, {
      "views/my-form/custom-error.html": true,
    });

    const request = createMockRequest("/my-form/start");
    const response = createMockResponse();
    const data = { code: 500, page: "custom-error" };

    handleApplicationError(request, response, data, "form-group");

    expect(response.view.calledWith("my-form/custom-error")).to.be.true();
    expect(response.code.calledWith(500)).to.be.true();
  });

  it("should fallback to code view if custom page not found", () => {
    stubFsExistsSync(sandbox, {
      "views/my-form/500.html": true,
    });

    const request = createMockRequest("/my-form/start");
    const response = createMockResponse();
    const data = { code: 500, page: "custom-error" };

    handleApplicationError(request, response, data);

    expect(response.view.calledWith("my-form/500")).to.be.true();
    expect(response.code.calledWith(500)).to.be.true();
  });

  it("should use form group folder if form folder view not found", () => {
    stubFsExistsSync(sandbox, {
      "views/form-group/403.html": true,
    });

    const request = createMockRequest("/my-form/start");
    const response = createMockResponse();
    const data = { code: 403 };

    handleApplicationError(request, response, data, "form-group");

    expect(response.view.calledWith("form-group/403")).to.be.true();
    expect(response.code.calledWith(403)).to.be.true();
  });

  it("should use generic view if form and form group views not found", () => {
    stubFsExistsSync(sandbox, {
      "views/500.html": true,
    });

    const request = createMockRequest("/my-form/start");
    const response = createMockResponse();
    const data = { code: 500 };

    handleApplicationError(request, response, data);

    expect(response.view.calledWith("500")).to.be.true();
    expect(response.code.calledWith(500)).to.be.true();
  });

  it("should use code string if no views found", () => {
    stubFsExistsSync(sandbox, {});

    const request = createMockRequest("/my-form/start");
    const response = createMockResponse();
    const data = { code: 418 };

    handleApplicationError(request, response, data);

    expect(response.view.calledWith("418")).to.be.true();
    expect(response.code.calledWith(418)).to.be.true();
  });

  it("should handle undefined form ID in path", () => {
    stubFsExistsSync(sandbox, {
      "views/500.html": true,
    });

    const request = createMockRequest("/");
    const response = createMockResponse();
    const data = { code: 500 };

    handleApplicationError(request, response, data);

    expect(response.view.calledWith("500")).to.be.true();
    expect(response.code.calledWith(500)).to.be.true();
  });

  it("should prioritize custom page over code view", () => {
    stubFsExistsSync(sandbox, {
      "views/my-form/error.html": true,
      "views/my-form/500.html": true,
    });

    const request = createMockRequest("/my-form/start");
    const response = createMockResponse();
    const data = { code: 500, page: "error" };

    handleApplicationError(request, response, data);

    expect(response.view.calledWith("my-form/error")).to.be.true();
    expect(response.code.calledWith(500)).to.be.true();
  });
});

exports.lab = lab;
