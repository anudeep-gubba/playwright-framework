import fs from "fs";
import path from "path";

import { ENV } from "../../../config/envLoader";
import { IDataProvider } from "./IDataProvider";
import { resolveSecrets } from "../utils/resolveSecrets";

export abstract class BaseDataProvider implements IDataProvider {
  private readonly cache = new Map<string, unknown>();

  protected abstract readonly extension: string;

  protected abstract parse<T>(filePath: string): Promise<T>;

  public async load<T>(fileName: string): Promise<T> {
    const cacheKey = `${ENV.TEST_DATA_FORMAT}:${fileName}`;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached as T;
    }

    const filePath = this.resolveFilePath(fileName);

    const parsed = await this.parse<T>(filePath);
    const data = resolveSecrets(parsed);

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
