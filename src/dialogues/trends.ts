/* global Office, document, window, localStorage */
import { populateDropdown } from "../utils/trends/populateDropdown";
import { renderTable } from "../utils/trends/renderTable";
import { setupTableListeners } from "./trend-service/setupTableListeners";
import { validateDates } from "../utils/trends/validateDates";
import { getSortKey } from "../utils/trends/sort";
import { applyFilters, removeFilters } from "../utils/trends/filters";
import { updateAccountCount } from "./trend-service/setupTableListeners";
import { sortTable } from "../utils/trends/sort";
import { setupDateUI } from "./trend-service/setupDateUi";
Office.onReady(() => {
  console.log("Office initialized");
  setupEventListeners();
  initializeData();
  setupDateUI(validateDates);
  (window as any).closeTrendsDialog = closeTrendsDialog;
});
let availableAccountsData: any[] = [];
let selectedAccountsData: any[] = [];

export function getLocalStorageData(key: string) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}
export function closeTrendsDialog(): void {
  Office.context.ui.messageParent(JSON.stringify({ type: "CLOSE_DIALOG" }));
}

export function initializeData() {
  const accountData = getLocalStorageData("accountList"); // One-time fetch
  availableAccountsData = [...accountData]; // Clone for memory use

  const currencyData = getLocalStorageData("currencyList"); // One-time fetch
  populateDropdown(document.getElementById("filterCurrency"), "currencyList");

  renderTable(availableAccountsData, getSortKey(), "available-accounts");
  updateAccountCount();
  sortTable("available-accounts", availableAccountsData);
  sortTable("selected-accounts", selectedAccountsData);

}

export function updateBuildButtonState() {
  const buildBtn = document.getElementById("buildWorksheetButton") as HTMLButtonElement;
  buildBtn.disabled = !canBuildWorksheet();
}
export function canBuildWorksheet(): boolean {
  const selectedAccounts = document.getElementById("selected-accounts")!.querySelectorAll("tbody tr");
  const hasAccounts = selectedAccounts.length > 0;
  const mode = (document.getElementById("dateOption") as HTMLSelectElement).value;

  const isValidDate = (() => {
    const from = (document.getElementById("startDate") as HTMLInputElement).value;
    const to = (document.getElementById("endDate") as HTMLInputElement).value;

    if (mode === "prior") return true;
    if (mode === "specific") return !!from;
    if (mode === "range") return !!from && !!to;
    return false;
  })();

  return hasAccounts && isValidDate;
}
export function setupEventListeners() {
  document.getElementById("applyFilter")!.addEventListener("click", applyFilters);
  document.getElementById("removeFilter")!.addEventListener("click", removeFilters);
  document.getElementById("view-account-number")!.addEventListener("change", handleViewChange);
  document.getElementById("view-account-name")!.addEventListener("change", handleViewChange);
  document.getElementById("dateOption")!.addEventListener("change", updateBuildButtonState);
  document.getElementById("startDate")!.addEventListener("change", updateBuildButtonState);
  document.getElementById("endDate")!.addEventListener("change", updateBuildButtonState);

  setupTableListeners("available-accounts", "selected-accounts");
}

export function handleViewChange() {
  const viewBy = getSortKey();

  // ✅ Use current state instead of reloading
  renderTable(availableAccountsData, viewBy, "available-accounts");
  renderTable(selectedAccountsData, viewBy, "selected-accounts");

   sortTable("available-accounts", availableAccountsData);
  sortTable("selected-accounts", selectedAccountsData);
}

export function moveSelected(sourceTable: HTMLElement, targetTable: HTMLElement, isAccount: boolean) {
  const movedAccounts: any[] = [];
  const viewBy = getSortKey();

  const parentTableId = sourceTable.closest("table")?.id;
  const sourceData = parentTableId === "available-accounts" ? availableAccountsData : selectedAccountsData;

  sourceTable.querySelectorAll(".selected").forEach((row) => {
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
      sourceData.splice(index, 1); // Remove only the exact matched item
    }

    row.remove(); // remove row from UI table
  });

  if (parentTableId === "available-accounts") {
    selectedAccountsData.push(...movedAccounts);
  } else {
    availableAccountsData.push(...movedAccounts);
  }

  renderTable(availableAccountsData, getSortKey(), "available-accounts");
  renderTable(selectedAccountsData, getSortKey(), "selected-accounts");
  updateAccountCount(isAccount);
  updateBuildButtonState();
}

export function moveAll(sourceTable: HTMLElement, targetTable: HTMLElement, isAccount: boolean) {
  const movedAccounts: any[] = [];
  const viewBy = getSortKey();

  const parentTableId = sourceTable.closest("table")?.id;
  const sourceData = parentTableId === "available-accounts" ? availableAccountsData : selectedAccountsData;

  const rows = Array.from(sourceTable.children);

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
      sourceData.splice(index, 1); // Remove the exact one to prevent duplicates
    }

    row.remove(); // Remove row from the table
  });

  if (parentTableId === "available-accounts") {
    selectedAccountsData.push(...movedAccounts);
  } else {
    availableAccountsData.push(...movedAccounts);
  }

  renderTable(availableAccountsData, getSortKey(), "available-accounts");
  renderTable(selectedAccountsData, getSortKey(), "selected-accounts");
  updateAccountCount(isAccount);
  updateBuildButtonState();
}

export { availableAccountsData, selectedAccountsData };
