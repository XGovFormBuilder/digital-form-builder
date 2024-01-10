import { HapiServer } from "server/types";

type QueueResponse = [number | string, string | undefined];

export abstract class QueueService {
  logger: HapiServer["logger"];

  constructor(server: HapiServer) {
    this.logger = server.logger;
  }

  /**
   * Send data from form submission to submission queue
   * @param data
   * @param url
   * @param allowRetry
   * @returns The ID of the newly added row, or undefined in the event of an error
   */
  abstract sendToQueue(
    data: object,
    url: string,
    allowRetry: boolean
  ): Promise<QueueResponse>;

  abstract pollForRef(rowId: number): Promise<string | void>;

  abstract getReturnRef(rowId: number): Promise<string>;
}
