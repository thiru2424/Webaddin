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
  const accountsList = getLocalStorageData("accountList");
  renderTable(accountsList, viewBy);
  renderTable(selectedAccountsData, viewBy, "selected-accounts");
}

export function moveSelected(sourceTable: HTMLElement, targetTable: HTMLElement, isAccount: boolean) {
  console.log("➡️ moveSelected called, source:", sourceTable.id, "target:", targetTable.id);
  const movedAccounts: any[] = [];

  sourceTable.querySelectorAll(".selected").forEach((row, idx) => {
    const cells = row.querySelectorAll("td");
    const account = {
      accountNumber: cells[0].textContent,
      currency: cells[1].textContent,
    };
    console.log(`✅ Moving account ${idx + 1}:`, account);
    movedAccounts.push(account);
    row.remove();
  });

  if (isAccount && targetTable.id === "selected-accounts") {
    // Remove from available
    console.log("Before Filter", availableAccountsData);
    availableAccountsData = availableAccountsData.filter(
      (acc) =>
        !movedAccounts.some(
          (m) =>
            m.accountNumber?.toString().trim() === acc.accountNumber?.toString().trim() &&
            m.currency?.toUpperCase().trim() === acc.currency?.toUpperCase().trim()
        )
    );

    console.log("after Filter", availableAccountsData);

    // Add to selected
    selectedAccountsData.push(...movedAccounts);

    renderTable(selectedAccountsData, getSortKey(), "selected-accounts");
    renderTable(availableAccountsData, getSortKey(), "available-accounts");
    sortTable("selected-accounts", selectedAccountsData);
    sortTable("available-accounts", availableAccountsData);
  } else if (isAccount && targetTable.id === "available-accounts") {
    // Remove from selected
    selectedAccountsData = selectedAccountsData.filter(
      (acc) => !movedAccounts.some((m) => m.accountNumber === acc.accountNumber && m.currency === acc.currency)
    );
    // Add to available
    availableAccountsData.push(...movedAccounts);

    renderTable(selectedAccountsData, getSortKey(), "selected-accounts");
    renderTable(availableAccountsData, getSortKey(), "available-accounts");
    sortTable("selected-accounts", selectedAccountsData);
    sortTable("available-accounts", availableAccountsData);
  }

  updateAccountCount(isAccount);
  updateBuildButtonState();
}

export function moveAll(from: HTMLElement, toTable: HTMLElement, isAccount: boolean) {
  console.log("➡️ moveAll called, from:", from.id, "to table id:", toTable.id);

  const movedAccounts: any[] = [];
  Array.from(from.children).forEach((row, idx) => {
    const cells = row.querySelectorAll("td");
    const account = {
      accountNumber: cells[0].textContent,
      currency: cells[1].textContent,
    };
    console.log(`✅ Moving account ${idx + 1}:`, account);
    movedAccounts.push(account);
    row.remove();
  });

  if (isAccount && toTable.id === "selected-accounts") {
    // ✅ Remove from availableAccountsData
    availableAccountsData = availableAccountsData.filter(
      (acc) =>
        !movedAccounts.some(
          (m) =>
            m.accountNumber?.toString().trim() === acc.accountNumber?.toString().trim() &&
            m.currency?.toUpperCase().trim() === acc.currency?.toUpperCase().trim()
        )
    );

    // ✅ Add to selectedAccountsData
    selectedAccountsData.push(...movedAccounts);

    renderTable(selectedAccountsData, getSortKey(), "selected-accounts");
    renderTable(availableAccountsData, getSortKey(), "available-accounts");
    sortTable("selected-accounts", selectedAccountsData);
    sortTable("available-accounts", availableAccountsData);
  } else if (isAccount && toTable.id === "available-accounts") {
    // ✅ Remove from selectedAccountsData
    selectedAccountsData = selectedAccountsData.filter(
      (acc) =>
        !movedAccounts.some(
          (m) =>
            m.accountNumber?.toString().trim() === acc.accountNumber?.toString().trim() &&
            m.currency?.toUpperCase().trim() === acc.currency?.toUpperCase().trim()
        )
    );

    // ✅ Add to availableAccountsData
    availableAccountsData.push(...movedAccounts);

    renderTable(selectedAccountsData, getSortKey(), "selected-accounts");
    renderTable(availableAccountsData, getSortKey(), "available-accounts");
    sortTable("selected-accounts", selectedAccountsData);
    sortTable("available-accounts", availableAccountsData);
  }

  updateAccountCount(isAccount);
  updateBuildButtonState();
}

export { availableAccountsData, selectedAccountsData };
