import fs from "fs";
import path from "path";
import Lab from "@hapi/lab";
import cheerio from "cheerio";
import FormData from "form-data";
import { expect } from "@hapi/code";
import { stub, restore } from "sinon";
import config from "src/server/config";

import createServer from "src/server/index";
import { UploadService } from "src/server/services/upload";

const { before, test, suite, after } = (exports.lab = Lab.script());

suite("uploads", () => {
  let server;

  // Create server before each test
  before(async () => {
    config.documentUploadApiUrl = "http://localhost:9000";
    server = await createServer({
      formFileName: "upload.json",
      formFilePath: __dirname,
    });
    await server.start();
  });

  after(async () => {
    await server.stop();
  });

  test("request with file upload field populated is successful and redirects to next page", async () => {
    const form = new FormData();
    form.append("fullName", 1);
    form.append("file1", Buffer.from("an image.."));
    // form.append('file2', Buffer.from([]))
    const options = {
      method: "POST",
      url: "/upload/upload-file",
      headers: form.getHeaders(),
      payload: form.getBuffer(),
    };
    const response = await server.inject(options);
    expect(response.statusCode).to.equal(302);
    expect(response.headers).to.include("location");
    expect(response.headers.location).to.equal("/upload/summary");
  });

  test("request with file upload field containing virus returns with error message", async () => {
    restore();

    stub(UploadService.prototype, "fileStreamsFromPayload").callsFake(() => {
      return [
        [
          "file1",
          [
            {
              hapi: {
                filename: "file.jpg",
                headers: {
                  "content-type": "application/pdf",
                },
              },
              _data: fs.readFileSync(path.join(__dirname, "dummy.pdf")),
            },
          ],
        ],
      ];
    });

    stub(UploadService.prototype, "uploadDocuments").callsFake(async () => {
      return {
        error: 'The selected files contained a virus',
      };
    });

    const form = new FormData();
    form.append("fullName", 1);
    form.append("file1", fs.readFileSync(path.join(__dirname, "dummy.pdf")));
    const options = {
      method: "POST",
      url: "/upload/upload-file",
      headers: form.getHeaders(),
      payload: form.getBuffer(),
    };
    const response = await server.inject(options);

    const $ = cheerio.load(response.payload);
    expect($("[href='#file1']").text().trim()).to.equal(
      'The selected files contained a virus'
    );
  });

  test("request with files larger than 2MB return an error", async () => {
    restore();

    fs.writeFileSync("tmp.pdf", Buffer.alloc(6 * 1024 * 1024, "a"));

    const data = fs.readFileSync("tmp.pdf");

    const form = new FormData();
    form.append("fullName", 1);
    form.append("file1", data);
    const options = {
      method: "POST",
      url: "/upload/upload-file",
      headers: form.getHeaders(),
      payload: form.getBuffer(),
    };
    const response = await server.inject(options);

    const $ = cheerio.load(response.payload);

    expect($("[href='#file1']").text().trim()).to.contain(
      "The selected files must be smaller than"
    );
  });

  test("request with file upload field containing invalid file type returns with error message", async () => {
    restore();
    stub(UploadService.prototype, "fileStreamsFromPayload").callsFake(() => {
      return [
        [
          "file1",
          [
            {
              hapi: {
                filename: "file.jpg",
                headers: {
                  "content-type": "application/json",
                },
              },
              _data: fs.readFileSync(path.join(__dirname, "dummy.pdf")),
            },
          ],
        ],
      ];
    });

    const form = new FormData();
    form.append("fullName", 1);
    form.append("file1", fs.readFileSync(path.join(__dirname, "dummy.pdf")));
    const options = {
      method: "POST",
      url: "/upload/upload-file",
      headers: form.getHeaders(),
      payload: form.getBuffer(),
    };
    const response = await server.inject(options);

    const $ = cheerio.load(response.payload);
    expect($("[href='#file1']").text().trim()).to.contain(
      'The selected files must be a JPG, JPEG, PNG or PDF'
    );
  });

  test("Request with no files skips all prehandlers", async () => {
    restore();

    const form = new FormData();
    form.append("favouriteEgg", "scrambled");
    const options = {
      method: "POST",
      url: "/upload/favourite",
      headers: form.getHeaders(),
      payload: form.getBuffer(),
    };
    const response = await server.inject(options);

    const $ = cheerio.load(response.payload);
    expect(response.statusCode).to.equal(302);
    expect(response.headers).to.include("location");
    expect(response.headers.location).to.equal("/upload/summary");
  });
});
