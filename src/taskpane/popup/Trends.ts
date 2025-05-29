/* global Office, document, window, localStorage */
import { populateDropdown } from "../../components/trends/populateDropdown";
import { renderTable } from "../../components/trends/renderTable";
import { setupTableListeners } from "../../components/trends/setupTableListeners";
import { getSortKey } from "../../components/trends/sortAccounts";
import { applyFilters, removeFilters } from "../../components/trends/filterAccounts";
import { updateAccountCount } from "../../components/trends//setupTableListeners";
import { sortTable } from "../../components/trends/sortAccounts";
import { handleViewChange } from "../../components/trends//handleViewChange";
import { updateBuildButtonState } from "../../components/trends/updateBuildButtonState";
import { setupDateUI } from "../../components/trends/setupDateListeners";
Office.onReady(() => {
  setupEventListeners();
  initializeData();
  setupDateUI();
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
  console.log(accountData);
  const currencyData = getLocalStorageData("currencyList"); // One-time fetch
  const orderedCurrencies = getOrderedCurrenciesFromAccounts(accountData);
  populateDropdown(document.getElementById("filterCurrency"), orderedCurrencies);

  renderTable(availableAccountsData, getSortKey(), "available-accounts");
  updateAccountCount();
  sortTable("available-accounts", availableAccountsData);
  sortTable("selected-accounts", selectedAccountsData);
}
function getOrderedCurrenciesFromAccounts(accountData: any[]): string[] {
  const priorityOrder = ["USD", "EUR", "GBP", "CAD", "JPY"];

  // Step 1: Get all unique currencies
  const uniqueCurrencies = Array.from(new Set(accountData.map((acc) => acc.currency)));

  // Step 2: Separate those in priorityOrder and the rest
  const prioritized = priorityOrder.filter((c) => uniqueCurrencies.includes(c));
  const others = uniqueCurrencies.filter((c) => !priorityOrder.includes(c)).sort(); // Optional: alphabetically sort other currencies

  // Step 3: Combine both
  return [...prioritized, ...others];
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

export { availableAccountsData, selectedAccountsData };
