import fs from "fs";

import { BaseDataProvider } from "./BaseDataProvider";

export class JsonProvider extends BaseDataProvider {
  protected readonly extension = "json";

  protected async parse<T>(filePath: string): Promise<T> {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  }
}
