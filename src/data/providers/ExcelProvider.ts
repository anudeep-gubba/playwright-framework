import XLSX from "xlsx";

import { BaseDataProvider } from "./BaseDataProvider";
import { TabularRow, unflattenRows } from "../utils/tabularData";

export class ExcelProvider extends BaseDataProvider {
  protected readonly extension = "xlsx";

  protected parse<T>(filePath: string): T {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<TabularRow>(sheet, { defval: "" });

    return unflattenRows(rows) as T;
  }
}
