import fs from "fs";
import YAML from "yaml";

import { BaseDataProvider } from "./BaseDataProvider";

export class YamlProvider extends BaseDataProvider {
  protected readonly extension = "yaml";

  protected async parse<T>(filePath: string): Promise<T> {
    return YAML.parse(fs.readFileSync(filePath, "utf8")) as T;
  }
}
