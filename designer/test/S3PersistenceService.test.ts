import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";

import { S3PersistenceService } from "../server/lib/persistence/s3PersistenceService";

import { FormConfiguration } from "@xgovformbuilder/model";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { beforeEach, describe, afterEach, suite, test } = lab;
const sandbox = sinon.createSandbox();
const server = {
  logger: {
    warn: sandbox.spy(),
    error: sandbox.spy(),
    log: sandbox.spy(),
  },
};

suite("s3PersistenceService", () => {
  const underTest = new S3PersistenceService(server);
  underTest.bucket = {
    listObjects: sinon.stub(),
    getObject: sinon.stub(),
    upload: sinon.stub(),
    copyObject: sinon.stub(),
    config: { params: { Bucket: "myBucket" } },
  };

  afterEach(() => {
    underTest.bucket.listObjects.resetHistory();
    underTest.bucket.getObject.resetHistory();
    underTest.bucket.upload.resetHistory();
    underTest.bucket.copyObject.resetHistory();
  });

  describe("listAllConfigurations", () => {
    test("should return configured objects", async () => {
      underTest.bucket.listObjects.returns({
        promise: () => ({
          Contents: [
            {
              Key: "myForm",
              Metadata: { "x-amz-meta-name": "My form" },
              LastModified: "2019-03-12T01:00:32.999Z",
            },
            {
              Key: "anotherForm",
              Metadata: { "x-amz-meta-name": "Another form" },
            },
            {
              Key: "feedbackForm",
              Metadata: {
                "x-amz-meta-name": "Feedback form",
                "x-amz-meta-type": "feedback",
              },
            },
            { Key: "thirdForm" },
          ],
        }),
      });

      expect(await underTest.listAllConfigurations()).to.equal([
        new FormConfiguration("myForm", "My form", "2019-03-12T01:00:32.999Z"),
        new FormConfiguration("anotherForm", "Another form"),
        new FormConfiguration("feedbackForm", "Feedback form", undefined, true),
        new FormConfiguration("thirdForm"),
      ]);
    });

    test("should return error if one is returned", async () => {
      underTest.bucket.listObjects.returns({
        promise: () => ({ error: "some error" }),
      });

      expect(await underTest.listAllConfigurations()).to.equal("some error");
    });
  });

  describe("getConfiguration", () => {
    [
      {
        id: "ab123456",
        expectedId: "ab123456.json",
        description: "a filename with no extension",
      },
      {
        id: "ab123456.json",
        expectedId: "ab123456.json",
        description: "a filename with a json extension",
      },
      {
        id: "ab123456.txt",
        expectedId: "ab123456.txt.json",
        description: "a filename with a different extension",
      },
    ].forEach((testCase) => {
      test(`should return configured objects when id is ${testCase.description}`, async () => {
        underTest.bucket.getObject.returns({
          promise: () => ({
            Body: "Some content string",
          }),
        });

        expect(await underTest.getConfiguration(testCase.id)).to.equal(
          "Some content string"
        );

        expect(underTest.bucket.getObject.callCount).to.equal(1);
        expect(underTest.bucket.getObject.firstCall.args[0]).to.equal({
          Key: testCase.expectedId,
        });
      });
    });

    test("should return error if one is returned", async () => {
      underTest.bucket.getObject.returns({
        promise: () => ({ error: "some error" }),
      });

      expect(await underTest.getConfiguration("efefsdasa")).to.equal(
        "some error"
      );
    });
  });

  describe("uploadConfiguration", () => {
    [
      {
        id: "ab123456",
        expectedId: "ab123456.json",
        description: "a filename with no extension",
      },
      {
        id: "ab123456.json",
        expectedId: "ab123456.json",
        description: "a filename with a json extension",
      },
      {
        id: "ab123456.txt",
        expectedId: "ab123456.txt.json",
        description: "a filename with a different extension",
      },
    ].forEach((testCase) => {
      test(`should upload configuration with no display name when id is ${testCase.description}`, async () => {
        const response = {};
        underTest.bucket.upload.returns({ promise: () => response });
        const configuration = JSON.stringify({ someKey: "someValue" });

        expect(
          await underTest.uploadConfiguration(testCase.id, configuration)
        ).to.equal(response);

        expect(underTest.bucket.upload.callCount).to.equal(1);
        expect(underTest.bucket.upload.firstCall.args[0]).to.equal({
          Key: testCase.expectedId,
          Body: configuration,
          Metadata: {},
        });
      });

      test(`should upload configuration with a display name when id is ${testCase.description}`, async () => {
        const response = {};
        const displayName = "My form";
        underTest.bucket.upload.returns({ promise: () => response });
        const configuration = JSON.stringify({
          someStuff: "someValue",
          name: displayName,
        });

        expect(
          await underTest.uploadConfiguration(testCase.id, configuration)
        ).to.equal(response);

        expect(underTest.bucket.upload.callCount).to.equal(1);
        expect(underTest.bucket.upload.firstCall.args[0]).to.equal({
          Key: testCase.expectedId,
          Body: configuration,
          Metadata: { "x-amz-meta-name": displayName },
        });
      });

      test(`should upload configuration which is a feedback form when id is ${testCase.description}`, async () => {
        const response = {};
        const displayName = "My form";
        underTest.bucket.upload.returns({ promise: () => response });
        const configuration = JSON.stringify({
          someStuff: "someValue",
          name: displayName,
          feedback: { feedbackForm: true },
        });

        expect(
          await underTest.uploadConfiguration(testCase.id, configuration)
        ).to.equal(response);

        expect(underTest.bucket.upload.callCount).to.equal(1);
        expect(underTest.bucket.upload.firstCall.args[0]).to.equal({
          Key: testCase.expectedId,
          Body: configuration,
          Metadata: {
            "x-amz-meta-name": displayName,
            "x-amz-meta-type": "feedback",
          },
        });
      });
    });

    test("should return error if one is returned", async () => {
      underTest.bucket.upload.returns({
        promise: () => ({ error: "some error" }),
      });

      const configuration = JSON.stringify({ someStuff: "someValue" });

      expect(
        await underTest.uploadConfiguration("my badger", configuration)
      ).to.equal({ error: "some error" });
    });
  });

  describe("copyConfiguration", () => {
    [
      {
        id: "ab123456",
        expectedId: "ab123456.json",
        description: "a filename with no extension",
      },
      {
        id: "ab123456.json",
        expectedId: "ab123456.json",
        description: "a filename with a json extension",
      },
      {
        id: "ab123456.txt",
        expectedId: "ab123456.txt.json",
        description: "a filename with a different extension",
      },
    ].forEach((testCase) => {
      test(`should copy configuration when id is ${testCase.description}`, async () => {
        const response = {};
        const newName = "wqmqadda";
        underTest.bucket.copyObject.returns({ promise: () => response });

        expect(
          await underTest.copyConfiguration(testCase.id, newName)
        ).to.equal(response);

        expect(underTest.bucket.copyObject.callCount).to.equal(1);

        expect(underTest.bucket.copyObject.firstCall.args[0]).to.equal({
          CopySource: encodeURI(`myBucket/${testCase.expectedId}`),
          Key: `${newName}.json`,
        });
      });
    });

    test("should return error if one is returned", async () => {
      underTest.bucket.copyObject.returns({
        promise: () => ({ error: "some error" }),
      });

      const configuration = JSON.stringify({ someStuff: "someValue" });

      expect(
        await underTest.copyConfiguration("my badger", configuration)
      ).to.equal({ error: "some error" });
    });
  });
});
