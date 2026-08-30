import { Workbook } from "exceljs";

import { BaseDataProvider } from "./BaseDataProvider";
import { TabularRow, unflattenRows } from "../utils/tabularData";

export class ExcelProvider extends BaseDataProvider {
  protected readonly extension = "xlsx";

  protected async parse<T>(filePath: string): Promise<T> {
    const workbook = new Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error(`Excel file has no worksheets: ${filePath}`);
    }

    const headers: string[] = [];
    worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
      headers[colNumber] = String(cell.value ?? "").trim();
    });

    const rows: TabularRow[] = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) {
        return;
      }

      const record: Record<string, unknown> = {};
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const header = headers[colNumber];
        if (header) {
          record[header] = cell.value;
        }
      });

      rows.push(record as TabularRow);
    });

    return unflattenRows(rows) as T;
  }
}
