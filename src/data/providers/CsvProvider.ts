import fs from "fs";
import { parse } from "csv-parse/sync";

import { BaseDataProvider } from "./BaseDataProvider";
import { TabularRow, unflattenRows } from "../utils/tabularData";

export class CsvProvider extends BaseDataProvider {
  protected readonly extension = "csv";

  protected parse<T>(filePath: string): T {
    const rows = parse(fs.readFileSync(filePath, "utf8"), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as TabularRow[];

    return unflattenRows(rows) as T;
  }
}
