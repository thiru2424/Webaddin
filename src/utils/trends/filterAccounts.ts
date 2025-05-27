import { renderTable } from "./renderTable";
import { getSortKey } from "./sortAccounts";
import { availableAccountsData } from "../../dialogues/trends";
import { updateAccountCount } from "../../dialogues/trend-service/setupTableListeners";
export function applyFilters() {
  const filterCurrency = (document.getElementById("filterCurrency") as HTMLSelectElement).value;
  const filterAccount = (document.getElementById("filterAccount") as HTMLInputElement).value.toLowerCase();
  const filterAccName = (document.getElementById("filterAccountName") as HTMLInputElement).value.toLowerCase();

  const viewBy = getSortKey();

  const filtered = availableAccountsData.filter(
    (account) =>
      (!filterCurrency || filterCurrency === "All" || account.currency === filterCurrency) &&
      (!filterAccount || account.accountNumber.toString().toLowerCase().includes(filterAccount)) &&
      (!filterAccName || account.accountName.toLowerCase().includes(filterAccName))
  );

  renderTable(filtered, viewBy, "available-accounts");
  updateAccountCount();
  const clearBtn = document.getElementById("removeFilter") as HTMLButtonElement;
  const filterActive = filterCurrency !== "All" || filterAccount !== "" || filterAccName !== "";
  clearBtn.disabled = !filterActive;
}

export function removeFilters() {
  (document.getElementById("filterCurrency") as HTMLSelectElement).value = "All";
  (document.getElementById("filterAccount") as HTMLInputElement).value = "";
  (document.getElementById("filterAccountName") as HTMLInputElement).value = "";

  // 🛑 Don't reload from localStorage
  renderTable(availableAccountsData, getSortKey(), "available-accounts");
  updateAccountCount();
  const clearBtn = document.getElementById("removeFilter") as HTMLButtonElement;
  clearBtn.disabled = true;
}

export function getActiveFilters() {
  const currency = (document.getElementById("filterCurrency") as HTMLSelectElement).value;
  const account = (document.getElementById("filterAccount") as HTMLInputElement).value.toLowerCase();
  const accName = (document.getElementById("filterAccountName") as HTMLInputElement).value.toLowerCase();
  return { currency, account, accName };
}

export function isFilterActive() {
  const { currency, account, accName } = getActiveFilters();
  return currency !== "All" || account !== "" || accName !== "";
}

export function filterAvailable(data: any[]) {
  const { currency, account, accName } = getActiveFilters();
  return data.filter(
    (accountItem) =>
      (!currency || currency === "All" || accountItem.currency === currency) &&
      (!account || accountItem.accountNumber.toString().toLowerCase().includes(account)) &&
      (!accName || accountItem.accountName.toLowerCase().includes(accName))
  );
}
