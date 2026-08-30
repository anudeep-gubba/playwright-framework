import winston from "winston";

// Playwright runs each worker as a separate OS process, and every worker executes
// its tests one at a time — so a single mutable module-level value is safe here
// (no cross-test race within a process) and lets every log line carry the worker
// index + current test title. Without this, logs/*.log interleaves lines from
// every worker process with no way to tell which test produced which line.
let currentContext = "";

function withContext(message: unknown): string {
  return currentContext ? `${currentContext} ${message}` : String(message);
}

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.printf(
    ({ timestamp, level, message }) =>
      `${timestamp} ${level}: ${withContext(message)}`,
  ),
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({
    stack: true,
  }),
  winston.format.printf(
    ({ timestamp, level, message, stack }) =>
      `${timestamp} [${level.toUpperCase()}] ${withContext(stack ?? message)}`,
  ),
);

export class Logger {
  /**
   * Tags every subsequent log line (until the next call) with the given
   * context, e.g. `[w2] [Valid user should login successfully]`. Call with an
   * empty string to clear. See `registerBeforeEachHook`/`registerAfterEachHook`.
   */
  static setContext(context: string): void {
    currentContext = context;
  }
  private static logger = winston.createLogger({
    level: process.env.LOG_LEVEL ?? "info",

    defaultMeta: {
      framework: "Playwright",
    },

    transports: [
      new winston.transports.Console({
        format: consoleFormat,
      }),

      new winston.transports.File({
        filename: "logs/execution.log",
        format: fileFormat,
      }),

      new winston.transports.File({
        filename: "logs/error.log",
        level: "error",
        format: fileFormat,
      }),
    ],

    exceptionHandlers: [
      new winston.transports.File({
        filename: "logs/exceptions.log",
      }),
    ],

    rejectionHandlers: [
      new winston.transports.File({
        filename: "logs/rejections.log",
      }),
    ],
  });

  static info(message: string): void {
    this.logger.info(message);
  }

  static warn(message: string): void {
    this.logger.warn(message);
  }

  static error(message: string): void {
    this.logger.error(message);
  }

  static debug(message: string): void {
    this.logger.debug(message);
  }
}
