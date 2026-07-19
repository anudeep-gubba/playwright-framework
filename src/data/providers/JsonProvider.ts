import fs from "fs";

import { BaseDataProvider } from "./BaseDataProvider";

export class JsonProvider extends BaseDataProvider {
  protected readonly extension = "json";

  protected parse<T>(filePath: string): T {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  }
}
