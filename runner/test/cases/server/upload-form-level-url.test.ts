import fs from "fs";
import path from "path";
import Lab from "@hapi/lab";
import FormData from "form-data";
import { expect } from "@hapi/code";
import { stub, restore } from "sinon";

import config from "../../../src/server/config";
import createServer from "../../../src/server/index";
import { UploadService } from "../../../src/server/services/upload";
import { ReadableStreamEntry } from "../../../src/server/services/upload/uploadService";

const { before, test, suite, after } = (exports.lab = Lab.script());

suite("uploads", () => {
  let server: Awaited<ReturnType<typeof createServer>>;

  // Create server before each test
  before(async () => {
    config.documentUploadApiUrl = "http://localhost:9000";
    server = await createServer({
      formFileName: "upload-form-level-url.json",
      formFilePath: __dirname,
    });
    await server.start();
  });

  after(async () => {
    await server.stop();
  });

  test("supports form level upload url", async () => {
    restore();

    const streamData = {
      hapi: {
        filename: "file.jpg",
        headers: {
          "content-type": "application/pdf",
        },
      },
      _data: { type: "Buffer", data: [] },
    };

    const streams: ReadableStreamEntry[] = [["file1", [streamData]]];

    stub(UploadService.prototype, "fileStreamsFromPayload").callsFake(() => {
      return streams;
    });

    const uploadDocumentsStub = stub(
      UploadService.prototype as UploadService,
      "uploadDocuments"
    ).resolves({ error: undefined, location: undefined, warning: undefined });

    const form = new FormData();
    form.append("file1", fs.readFileSync(path.join(__dirname, "dummy.pdf")));
    const options = {
      method: "POST",
      url: "/upload-form-level-url/upload-file",
      headers: form.getHeaders(),
      payload: form.getBuffer(),
    };

    const response = await server.inject(options);

    expect(response.statusCode).to.equal(200);

    if (response.statusCode !== 200) {
      console.log(`Response payload: ${response.payload}`);
    }

    const parameter1 = [
      {
        hapi: {
          filename: "file.jpg",
          headers: { "content-type": "application/pdf" },
        },
        _data: { type: "Buffer", data: [] },
      },
    ];

    const parameter2 = {
      url: "http://localhost:9999/form-based-upload-url-test",
    };

    const foundCall = uploadDocumentsStub.calledWithMatch(
      parameter1,
      parameter2
    );

    if (!foundCall) {
      const calls = uploadDocumentsStub
        .getCalls()
        .reduce((callInfo, call, index) => {
          callInfo[`Call_${index + 1}`] = call.args.reduce(
            (acc, arg, argIndex) => {
              acc[`Parameter_${argIndex + 1}`] = JSON.stringify(arg);
              return acc;
            },
            {} as Record<string, string>
          );

          return callInfo;
        }, {} as Record<string, Record<string, string>>);

      console.log(foundCall, {
        calls,
        expectedCall: {
          Parameter_1: JSON.stringify(parameter1),
          parameter_2: JSON.stringify(parameter2),
        },
      });
    }

    expect(foundCall).to.be.true();
  });
});
