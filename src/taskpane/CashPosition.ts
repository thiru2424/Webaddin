import { loadConfig, API_URLS } from "./Config";
import { ApiService } from "../service/ApiService";
import { CashPositionResponse } from "./Interfaces";
import { getFormattedTimestamp } from "../util/TimestampUtil";
import {
  formatCell,
  formatValueCell,
  formatNumericValue,
  formatBorder,
  formatColumnWidth,
  getExcelColumnLetter,
} from "../util/FormatterUtil";
import { Logger } from "../util/Logger";

const api = new ApiService();

export class CashPosition {
  // Fetch data from API
  private async fetchAPIData(): Promise<any> {
    let cashPositions: CashPositionResponse[] = [];
    try {
      await loadConfig();
      const cashPositionList: string = JSON.stringify(await api.get(API_URLS.GET_CASH_POSITION()));
      cashPositions = JSON.parse(cashPositionList).extractInfoList;
    } catch (error) {
      Logger.error("Error during API call", { error, context: "load data from API" });
      Logger.showErrorDialog("There is an error while fetching the cash position. Please contact support.");
    }
    return cashPositions;
  }

  private transformJson(inputJson: any) {
    const transformedJson = {
      branches: [],
    };

    inputJson.forEach((entry: any) => {
      const accountInfo = entry.accountInfo;
      const existingBranch = transformedJson.branches.find((b) => b.bankID === accountInfo.bankID);

      const accountKey = `${accountInfo.accountNumber}|${accountInfo.accountName}|${accountInfo.currency}`;

      if (existingBranch) {
        const alreadyExists = existingBranch.accounts.some(
          (account: any) => `${account.accountNumber}|${account.name}|${account.currency}` === accountKey
        );

        if (!alreadyExists) {
          existingBranch.accounts.push({
            accountNumber: accountInfo.accountNumber,
            name: accountInfo.accountName,
            currency: accountInfo.currency,
          });
        }
      } else {
        transformedJson.branches.push({
          bankID: accountInfo.bankID,
          branchName: accountInfo.branchName,
          accounts: [
            {
              accountNumber: accountInfo.accountNumber,
              name: accountInfo.accountName,
              currency: accountInfo.currency,
            },
          ],
        });
      }
    });

    return transformedJson;
  }

  private fillAccountAndBranch(sheet: Excel.Worksheet, config: { reportValues: any[]; fontName: any }, inputJson: any) {
    const transformedJson = this.transformJson(inputJson);

    config.reportValues.forEach((reportItem: any) => {
      var reportCell = sheet.getRange(reportItem.cell);
      reportCell.values = [[reportItem.value.replace(/\\n/g, "\n")]];
      formatCell(reportCell, config.fontName, reportItem, false);
    });

    let col = 1;
    for (const branch of transformedJson.branches) {
      const branchStartCol = col;
      for (const account of branch.accounts) {
        const cell = sheet.getCell(2, col);
        cell.values = [[`${account.accountNumber}\n${account.name}\n${account.currency}`]];
        formatCell(cell, config.fontName, config.reportValues[1], true);
        col++;
      }

      const branchSpan = col - branchStartCol;
      const branchRange = sheet.getRangeByIndexes(1, branchStartCol, 1, branchSpan);
      branchRange.values = [Array(branchSpan).fill(`${branch.branchName}`)];
      if (branchSpan > 1) {
        branchRange.merge(true);
      }
      formatCell(branchRange, config.fontName, config.reportValues[0], true);
    }
  }

  private getMatchingDataForAccount(headerParts: [any, any, any], inputJson: any[], configItem: { filter: any[] }) {
    const [accountId, accountName, currency] = headerParts;
    const accountInfo = inputJson.filter(
      (item) =>
        item.accountInfo.accountNumber === accountId &&
        item.accountInfo.accountName === accountName &&
        item.accountInfo.currency === currency
    );
    const matchedItem = accountInfo.find((item) => configItem.filter.every((f) => item[f.key] === f.value));
    return matchedItem;
  }

  private addTotalColumn(range: Excel.Range, sheet: Excel.Worksheet, config: { reportValues: any[]; fontName: any }) {
    const totalColumnIndex = range.columnCount;
    const firstDataRowIndex = 3;
    const firstValueColumn = 1;

    const totalsHeaderCell = sheet.getCell(2, totalColumnIndex);
    totalsHeaderCell.values = [["Totals"]];
    const fontItem = config.reportValues[1];
    formatCell(totalsHeaderCell, config.fontName, fontItem, true);

    const totalBranchCell = sheet.getCell(1, totalColumnIndex);
    formatCell(totalBranchCell, config.fontName, fontItem, false);
  }

  private populateFieldValues(
    config: { reportDetails: any[]; fontName: any },
    inputJson: any,
    sheet: Excel.Worksheet,
    accountDetails: any[]
  ) {
    const columnStartIndex = 1; // B = 1

    config.reportDetails.forEach((reportItem: any) => {
      var reportCell = sheet.getRange(reportItem.cell);
      reportCell.values = [[reportItem.fieldName.replace(/\\n/g, "\n")]];
      formatValueCell(reportCell, config.fontName, "Left");

      const row = parseInt(reportItem.cell.slice(1)) - 1;

      for (let i = 0; i < accountDetails.length; i++) {
        const headerParts = accountDetails[i]?.toString().split("\n");
        if (headerParts.length !== 3) continue;

        const accountCurrency = headerParts[2];
        const col = columnStartIndex + i;
        const cell = sheet.getCell(row, col);

        if (reportItem.isFormula) {
          const columnLetter = getExcelColumnLetter(col);
          const formula = reportItem.filter[0].value.replace(/{colNum}/g, columnLetter);
          cell.formulas = [[formula]];
          formatValueCell(cell, config.fontName, "Right", accountCurrency);
        } else if (reportItem.filter[0].value === "-" || reportItem.filter[0].value === undefined) {
          const matchedData = this.getMatchingDataForAccount(headerParts, inputJson, reportItem);
          const value = matchedData ? matchedData[reportItem.filter[0].key] : "";
          cell.values = [[value]];
          formatValueCell(cell, config.fontName, "Right", accountCurrency);
        }
      }
    });
  }

  private populateFloatDetails(
    detailsType: string,
    accountDetails: any[],
    inputJson: any[],
    sheet: Excel.Worksheet,
    startingRow: number,
    config: { floatDetails: any[]; fontName: any }
  ) {
    const columnStartIndex = 1; // B = 1
    const configItem = config.floatDetails[0];

    var headerCell = sheet.getRange(`A${startingRow}`);
    headerCell.values = [[configItem.fieldName.replace(/\\n/g, "\n")]];
    formatCell(headerCell, config.fontName, configItem, false);
    startingRow = startingRow + 1;

    const uniqueFloatNames = Array.from(
      new Set(
        inputJson
          .filter((item) => item.detailsType === detailsType && item.balTransTypeName.includes("Float"))
          .map((item) => item.balTransTypeName)
      )
    );

    if (uniqueFloatNames) {
      for (let j = 0; j < uniqueFloatNames.length; j++) {
        const reportItem = uniqueFloatNames[j];
        var reportCell = sheet.getRange(`A${startingRow}`);
        configItem.filter.push({ key: "balTransTypeName", value: reportItem });
      }
    }
  }

  private mergeHeaders(
    sheet: Excel.Worksheet,
    lastColumn: number,
    ledgerCreditStartingRow: number,
    ledgerDebitStartingRow: number,
    floatStartingRow: number
  ): number {
    const headerMerge = sheet.getRangeByIndexes(0, 1, 1, lastColumn - 1);
    headerMerge.merge();

    lastColumn = lastColumn + 1;
    const summaryMerge = sheet.getRangeByIndexes(12, 0, 1, lastColumn);
    summaryMerge.merge();

    const ledgerCreditMerge = sheet.getRangeByIndexes(ledgerCreditStartingRow, 0, 1, lastColumn);
    ledgerCreditMerge.merge();

    const ledgerDebitMerge = sheet.getRangeByIndexes(ledgerDebitStartingRow, 0, 1, lastColumn);
    ledgerDebitMerge.merge();

    const floatMerge = sheet.getRangeByIndexes(floatStartingRow, 0, 1, lastColumn);
    floatMerge.merge();

    return lastColumn;
  }

  public async populateExcel() {
    const context = await Excel.run(async (context) => {
      try {
        const inputJson = await this.fetchAPIData();
        const config = await api.fetchConfig("/assets/CashPosition.json");

        if (!inputJson || inputJson.length === 0) {
          throw new Error("No input data available.");
        }

        const sheet = context.workbook.worksheets.getActiveWorksheet();
        let usedRange = sheet.getUsedRange();
        usedRange.load("columnCount");
        await context.sync();

        let lastColumn = usedRange.columnCount;

        const headerRange = sheet.getRangeByIndexes(2, 1, 1, lastColumn - 1);
        headerRange.load("values");
        await context.sync();

        const accountDetails = headerRange.values[0];
        this.populateFieldValues(config, inputJson, sheet, accountDetails);

        const usedRangeBeforeLedger = sheet.getUsedRange();
        usedRangeBeforeLedger.load("columnCount, rowCount");
        await context.sync();

        const ledgerCreditStartingRow = usedRangeBeforeLedger.rowCount + 1;
        this.populateLedgerDetails("1", accountDetails, inputJson, sheet, ledgerCreditStartingRow + 1, config);

        const usedRangeAfterLedger = sheet.getUsedRange();
        usedRangeAfterLedger.load("columnCount, rowCount");
        await context.sync();

        const ledgerDebitStartingRow = usedRangeAfterLedger.rowCount + 1;
        this.populateLedgerDetails("2", accountDetails, inputJson, sheet, ledgerDebitStartingRow + 1, config);

        this.addTimeStamp(sheet, lastColumn, config);
        this.mergeHeaders(sheet, lastColumn, ledgerCreditStartingRow, ledgerDebitStartingRow, floatStartingRow);

        formatColumnWidth(sheet.getUsedRange());
        formatBorder(sheet.getUsedRange());

        sheet.freezePanes.freezeRows(3);
        sheet.freezePanes.freezeColumns(1);

        await context.sync();
      } catch (error) {
        Logger.error("Unable to load cash position. Please contact support.");
        Logger.showErrorDialog("Unable to load cash position. Please contact support.");
      }
    });
  }
}
