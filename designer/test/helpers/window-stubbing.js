import sinon from "sinon";

let remove = false;

export function stubFetchJson(status, body) {
  let stub;
  if (!window.fetch) {
    stub = sinon.stub();
    window.fetch = stub;
    remove = true;
  } else {
    stub = sinon.stub(window, "fetch"); // add stub
  }
  stub
    .onCall(0)
    .resolves(
      new Response(
        status,
        "application/json",
        typeof body === "string" ? body : JSON.stringify(body)
      )
    );
}

export function restoreWindowMethods() {
  if (remove) {
    delete window.fetch;
  } else {
    window.fetch.restore(); // remove stub
  }
}

class Response {
  constructor(responseCode, contentType, body) {
    this.responseCode = responseCode;
    this.contentType = contentType;
    this.body = body;
    this.ok = this.responseCode >= 200 && this.responseCode <= 300;
  }

  get error() {
    if (!this.ok) {
      return Error(this.body);
    }
  }

  json() {
    return JSON.parse(this.body);
  }
}
