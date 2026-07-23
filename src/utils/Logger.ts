import winston from "winston";

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.printf(
    ({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`,
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
      `${timestamp} [${level.toUpperCase()}] ${stack ?? message}`,
  ),
);

export class Logger {
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
