import { Logger } from "./Logger";

export default class ExcelHelper {
  /**
   * Write data to a specific cell in the active worksheet
   * @param cellAddress - Example: A1
   * @param value - Data to be written
   */
  static async writeCell(cellAddress: string, value: string) {
    try {
      await Excel.run(async (context) => {
        let sheet = context.workbook.worksheets.getActiveWorksheet();
        let cell = sheet.getRange(cellAddress);
        cell.values = [[value]];
        cell.format.autofitColumns();
        await context.sync();
      });
    } catch (error) {
      Logger.error("Error writing to cell", error);
    }
  }

  /**
   * Read data to a specific cell in the active worksheet
   * @param cellAddress - Example: A1
   * @returns The value of the cell
   */
  static async readCell(cellAddress: string): Promise<string | number | null> {
    try {
      await Excel.run(async (context) => {
        let sheet = context.workbook.worksheets.getActiveWorksheet();
        let cell = sheet.getRange(cellAddress);
        cell.load("values");
        await context.sync();
        return cell.values[0][0] ?? null;
      });
    } catch (error) {
      Logger.error("Error reading cell", error);
      return null;
    }
  }

  /**
   * Write an array of values to a range
   * @param startCell - Example: A1
   * @param data - Array of values to be written
   */
  static async writeRange(startCell: string, data: (string | number)[][]): Promise<void> {
    try {
      await Excel.run(async (context) => {
        let sheet = context.workbook.worksheets.getActiveWorksheet();
        let range = sheet.getRange(startCell).getResizedRange(data.length - 1, data[0].length - 1);
        range.values = data;
        range.format.autofitColumns();
        await context.sync();
      });
    } catch (error) {
      Logger.error("Error writing range", error);
    }
  }

  static async readAllComments(sheetName: string): Promise<string[]> {
    try {
      return await Excel.run(async (context) => {
        let sheet = context.workbook.worksheets.getItem(sheetName);
        let commentsCollection = sheet.comments;
        commentsCollection.load("items/content");

        await context.sync();
        return commentsCollection.items.map((comment) => comment.content);
      });
    } catch (error) {
      Logger.error("Error reading comments:", error);
      return [];
    }
  }
}
