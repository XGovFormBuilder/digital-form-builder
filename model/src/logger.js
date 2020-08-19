// @flow
export class Logger {
    logger: any;
    name: string;

    constructor (logger: any, name: string) {
      this.logger = logger
      this.name = name
    }

    error = (message: string) => this.log('error', message)

    warn = (message: string) => this.log('warn', message)

    info = (message: string) => this.log('info', message)

    debug = (message: string) => this.log('debug', message)

    log (level: string, message: string) {
      this.logger([level, this.name], message)
    }
}
