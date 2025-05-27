import { getSortKey } from "./sortAccounts";
import { renderTable } from "./renderTable";
import { selectedAccountsData, availableAccountsData } from "../../dialogues/trends";
import { isFilterActive, filterAvailable } from "./filterAccounts";
import { updateAccountCount } from "../../dialogues/trend-service/setupTableListeners";
import { updateBuildButtonState } from "./updateBuildButtonState";
export function moveSelected(sourceTable: HTMLElement, targetTable: HTMLElement, isAccount: boolean) {
  const selectedRows = Array.from(sourceTable.querySelectorAll(".selected"));
  performRowMove(selectedRows, sourceTable, isAccount);
}
export function moveAll(sourceTable: HTMLElement, targetTable: HTMLElement, isAccount: boolean) {
  const allRows = Array.from(sourceTable.children);
  performRowMove(allRows, sourceTable, isAccount);
}

export function performRowMove(rows: Element[], sourceTable: HTMLElement, isAccount: boolean) {
  const movedAccounts: any[] = [];
  const viewBy = getSortKey();
  const parentTableId = sourceTable.closest("table")?.id;
  const sourceData = parentTableId === "available-accounts" ? availableAccountsData : selectedAccountsData;

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    const key = cells[0].textContent?.trim();
    const currency = cells[1].textContent?.trim();

    const index = sourceData.findIndex((acc) =>
      viewBy === "accountNumber"
        ? acc.accountNumber?.toString().trim() === key
        : acc.accountName?.toString().trim().toLowerCase() === key?.toLowerCase() &&
          acc.currency?.toUpperCase().trim() === currency?.toUpperCase()
    );

    if (index !== -1) {
      const fullAccount = sourceData[index];
      movedAccounts.push(fullAccount);
      sourceData.splice(index, 1);
    }

    row.remove(); // Remove the row from the table
  });

  if (parentTableId === "available-accounts") {
    selectedAccountsData.push(...movedAccounts);
  } else {
    availableAccountsData.push(...movedAccounts);
  }

  const filtered = isFilterActive() ? filterAvailable(availableAccountsData) : availableAccountsData;
  renderTable(filtered, viewBy, "available-accounts");
  renderTable(selectedAccountsData, getSortKey(), "selected-accounts");
  updateAccountCount();
  updateBuildButtonState();
}
