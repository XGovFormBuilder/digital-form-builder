export class Logger {
  server: any;
  name: string;

  constructor(server: any, name: string) {
    this.server = server;
    this.name = name;
  }

  error(message: string) {
    this.log("error", message);
  }

  warn(message: string) {
    this.log("warn", message);
  }

  info(message: string) {
    this.log("info", message);
  }

  debug(message: string) {
    this.log("debug", message);
  }

  log(level: string, message: string) {
    this.server.log([level, this.name], message);
  }
}
