import fs from "fs";
import path from "path";

import { ENV } from "../../../config/envLoader";
import { IDataProvider } from "./IDataProvider";

export abstract class BaseDataProvider implements IDataProvider {
  private readonly cache = new Map<string, unknown>();

  protected abstract readonly extension: string;

  protected abstract parse<T>(filePath: string): T;

  public load<T>(fileName: string): T {
    const cacheKey = `${ENV.TEST_DATA_FORMAT}:${fileName}`;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached as T;
    }

    const filePath = this.resolveFilePath(fileName);

    const data = this.parse<T>(filePath);

    this.cache.set(cacheKey, data);

    return data;
  }
  private resolveFilePath(fileName: string): string {
    const filePath = path.resolve(
      process.cwd(),
      "src",
      "data",
      "datasets",
      ENV.TEST_DATA_FORMAT,
      `${fileName}.${this.extension}`,
    );
    if (!fs.existsSync(filePath)) {
      throw new Error(`Test data file not found: ${filePath}`);
    }

    return filePath;
  }
}
