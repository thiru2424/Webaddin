import { renderTable } from "./renderTable";
import { getSortKey } from "./sort";
import { getLocalStorageData } from "../../dialogues/trends";
import { availableAccountsData } from "../../dialogues/trends";
export function applyFilters() {
  const filterCurrency = (document.getElementById("filterCurrency") as HTMLSelectElement).value;
  const filterAccount = (document.getElementById("filterAccount") as HTMLInputElement).value.toLowerCase();
  const filterAccName = (document.getElementById("filterAccountName") as HTMLInputElement).value.toLowerCase();

  const filtered = availableAccountsData.filter(
    (account) =>
      (!filterCurrency || filterCurrency === "All" || account.currency === filterCurrency) &&
      (!filterAccount || account.accountNumber.toString().includes(filterAccount)) &&
      (!filterAccName || account.accountName.toLowerCase().includes(filterAccName))
  );

  renderTable(filtered, getSortKey(), "available-accounts");
}
export function removeFilters() {
  (document.getElementById("filterCurrency") as HTMLSelectElement).value = "All";
  (document.getElementById("filterAccount") as HTMLInputElement).value = "";
  (document.getElementById("filterAccountName") as HTMLInputElement).value = "";
  renderTable(getLocalStorageData("accountList"), getSortKey());
}