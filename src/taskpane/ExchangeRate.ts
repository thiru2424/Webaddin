import { getFormattedTimestamp } from "../util/TimestampUtil";
import { Logger } from "../util/Logger";
import { ApiService } from "../service/ApiService";
import { formatCell, formatBorder } from "../util/FormatterUtil";

const api = new ApiService();

export class ExchangeRate {
  public async populateExchangeRates(currencyPairs: any[]) {
    const context = await Excel.run(async (context) => {
      try {
        const config = await api.fetchConfig("/assets/FXRates.json");
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        sheet.load("name");
        await context.sync();

        const usedRange = sheet.getUsedRangeOrNullObject();
        usedRange.load(["rowCount", "rowIndex", "columnCount", "columnIndex", "values"]);
        await context.sync();

        let startRow = 2;
        if (!usedRange.isNullObject) {
          const lastUsedRow = usedRange.rowIndex + usedRange.rowCount;
          startRow = lastUsedRow + 2;
        }

        const sheetName = `"${sheet.name}"`;
        config.fxRateHeaders.forEach((reportItem: any) => {
          startRow = startRow + 1;
          var reportCell = sheet.getRange(reportItem.cell + startRow);
          reportCell.values = [[(reportItem.value).replace(/\\n/g, "\n")]];
          if (reportItem.isNote) {
            context.workbook.comments.add(`${sheetName}!${reportItem.cell}${startRow}`, `${reportItem.noteText}`);
          }
          formatCell(reportCell, config.fontName, reportItem, false);
        });

        await context.sync();

        const tableHeader = config.tableHeader;
        startRow = startRow + 1;
        sheet.getRange(`A${startRow}:C${startRow}`).values = [tableHeader.headerColumns];
        startRow = startRow + 1;

        if (currencyPairs) {
          currencyPairs.forEach((pair: { fromCurrency: any; targetCurrency: any }, index: number) => {
            startRow = startRow + index;
            sheet.getRange(`A${startRow}`).values = [[pair.fromCurrency]];
            sheet.getRange(`B${startRow}`).values = [[pair.targetCurrency]];
            const noteText = [
              "ExchangeRateStart:",
              `FromCurrency: ${pair.fromCurrency}`,
              `TargetCurrency: ${pair.targetCurrency}`,
              "ExchangeRateEnd"
            ].join("\n");
            context.workbook.comments.add(`${sheetName}!C${startRow}`, noteText);
          });
        }

        formatBorder(sheet.getUsedRange());
        await context.sync();
      } catch (error) {
        Logger.error("Unable to load exchange rates. Please contact support.");
        Logger.showErrorDialog("Unable to load exchange rates. Please contact support.");
      }
    });
  }
}
