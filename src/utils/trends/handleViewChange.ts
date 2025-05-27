import { isFilterActive, filterAvailable } from "./filterAccounts";
import { availableAccountsData, selectedAccountsData } from "../../dialogues/trends";
import { renderTable } from "./renderTable";
import { sortTable } from "./sortAccounts";
import { getSortKey } from "./sortAccounts";
export function handleViewChange() {
  const viewBy = getSortKey();
  const filteredAvailable = isFilterActive() ? filterAvailable(availableAccountsData) : availableAccountsData;

  renderTable(filteredAvailable, viewBy, "available-accounts");
  renderTable(selectedAccountsData, viewBy, "selected-accounts");

  sortTable("available-accounts", filteredAvailable);
  sortTable("selected-accounts", selectedAccountsData);
}
