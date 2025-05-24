/* global Office, document, window, localStorage */

Office.onReady(() => {
  setupEventListeners();
  initializeData();
  console.log("listening12");

  const dateOption = document.getElementById("dateOption") as HTMLSelectElement;
  const startDate = document.getElementById("startDate") as HTMLInputElement;
  const endDate = document.getElementById("endDate") as HTMLInputElement;

  const startDateHead = document.getElementById("startHead") as HTMLElement;
  const endDateHead = document.getElementById("endHead") as HTMLElement;

  (window as any).closeTrendsDialog = closeTrendsDialog;

  const today = new Date().toISOString().split("T")[0];
  startDate.max = today;
  endDate.max = today;
  console.log("listening34");

  dateOption.addEventListener("change", () => {
    const selected = dateOption.value;
    const today = new Date().toISOString().split("T")[0];
    startDate.value = "";
    endDate.value = "";

    // Reset constraints
    startDate.max = today;
    startDate.min = "";
    endDate.max = today;
    endDate.min = "";

    startDate.classList.remove("hidden");
    endDate.classList.remove("hidden");
    startDateHead.classList.remove("hidden");
    endDateHead.classList.remove("hidden");
    startDateHead.textContent = "From";

    if (selected === "prior") {
      startDate.classList.add("hidden");
      endDate.classList.add("hidden");
      startDateHead.classList.add("hidden");
      endDateHead.classList.add("hidden");
    } else if (selected === "specific") {
      startDate.classList.remove("hidden");
      endDate.classList.add("hidden");
      startDateHead.classList.remove("hidden");
      endDateHead.classList.add("hidden");
      startDateHead.textContent = "Date";
    }
  });
  startDate.addEventListener("change", () => {
    if (startDate.value) {
      const from = new Date(startDate.value);
      from.setDate(from.getDate() + 1);
      endDate.min = from.toISOString().split("T")[0];
    } else {
      endDate.removeAttribute("min");
    }
    validateDates();
  });

  endDate.addEventListener("change", () => {
    if (endDate.value) {
      const to = new Date(endDate.value);
      to.setDate(to.getDate() - 1);
      startDate.max = to.toISOString().split("T")[0];
    } else {
      startDate.removeAttribute("max");
    }
    validateDates();
  });

  function validateDates(): boolean {
    const from = new Date(startDate.value);
    const to = new Date(endDate.value);
    const today = new Date();
    const mode = dateOption.value;
    const errorBox = document.getElementById("dateError");

    // Clear any previous messages
    errorBox!.textContent = "";

    // Normalize time
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (mode === "prior") {
      return true;
    }

    if (mode === "specific") {
      if (!startDate.value) {
        errorBox!.textContent = "Please select a date.";
        return false;
      }
      if (from > today) {
        errorBox!.textContent = "Date cannot be in the future.";
        return false;
      }
      return true;
    }

    if (mode === "range") {
      if (!startDate.value || !endDate.value) {
        errorBox!.textContent = "select both dates.";
        return false;
      }
      if (from > today || to > today) {
        errorBox!.textContent = "Dates cannot be in the future.";
        return false;
      }
      if (to < from) {
        errorBox!.textContent = "End date must be after Start date.";
        return false;
      }
      return true;
    }

    return true;
  }
});
let selectedAccountsData: any[] = [];

function getLocalStorageData(key: string) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}
function closeTrendsDialog(): void {
  Office.context.ui.messageParent(JSON.stringify({ type: "CLOSE_DIALOG" }));
}

function initializeData() {
  console.log("🔍 Initializing Data...");
  const accountData = getLocalStorageData("accountList");
  const currencyData = getLocalStorageData("currencyList");

  console.log("✅ Retrieved accountList:", accountData);
  console.log("✅ Retrieved currencyList:", currencyData);

  // Only one dropdown: filterCurrency
  populateDropdown(document.getElementById("filterCurrency"), "currencyList");

  renderTable(accountData, getSortKey());
  updateAccountCount();
  sortTable("available-accounts", accountData);
}

function populateDropdown(dropdown: HTMLElement | null, storageKey: string) {
  if (!dropdown) return;
  const items = getLocalStorageData(storageKey);
  console.log(`📦 Populating dropdown for key: ${storageKey}`, items);

  items.forEach((item: any) => {
    const option = document.createElement("option");
    option.value = item.currency || item; // Support both object or string format
    option.textContent = item.currency || item;
    dropdown.appendChild(option);
  });
}

function renderTable(data: any[], viewBy: string, tableId: string = "available-accounts"): void {
  console.log(`🔁 Rendering table: ${tableId}, View by: ${viewBy}, Rows:`, data.length, data);
  const tbody = document.getElementById(tableId)!.querySelector("tbody")!;
  tbody.innerHTML = "";
  data.forEach((account, idx) => {
    console.log(`🔳 Rendering row ${idx + 1}:`, account);
    const row = document.createElement("tr");
    row.innerHTML = `<td>${viewBy === "accountName" ? account.accountName : account.accountNumber}</td><td>${account.currency}</td>`;
    tbody.appendChild(row);
  });
}

function applyFilters() {
  const accountsList = getLocalStorageData("accountList");
  const filterCurrency = (document.getElementById("filterCurrency") as HTMLSelectElement).value;
  const filterAccount = (document.getElementById("filterAccount") as HTMLInputElement).value.toLowerCase();
  const filterAccName = (document.getElementById("filterAccountName") as HTMLInputElement).value.toLowerCase();

  const filtered = accountsList.filter(
    (account) =>
      (!filterCurrency || filterCurrency === "All" || account.currency === filterCurrency) &&
      (!filterAccount || account.accountNumber.toString().includes(filterAccount)) &&
      (!filterAccName || account.accountName.toLowerCase().includes(filterAccName))
  );

  renderTable(filtered, getSortKey());
}

function removeFilters() {
  (document.getElementById("filterCurrency") as HTMLSelectElement).value = "All";
  (document.getElementById("filterAccount") as HTMLInputElement).value = "";
  (document.getElementById("filterAccountName") as HTMLInputElement).value = "";
  renderTable(getLocalStorageData("accountList"), getSortKey());
}
function updateBuildButtonState() {
  const buildBtn = document.getElementById("buildWorksheetButton") as HTMLButtonElement;
  buildBtn.disabled = !canBuildWorksheet();
}
function canBuildWorksheet(): boolean {
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
function setupEventListeners() {
  document.getElementById("applyFilter")!.addEventListener("click", applyFilters);
  document.getElementById("removeFilter")!.addEventListener("click", removeFilters);
  document.getElementById("view-account-number")!.addEventListener("change", handleViewChange);
  document.getElementById("view-account-name")!.addEventListener("change", handleViewChange);

  setupTableListeners("available-accounts", "selected-accounts");
}
document.getElementById("dateOption")!.addEventListener("change", updateBuildButtonState);
document.getElementById("startDate")!.addEventListener("change", updateBuildButtonState);
document.getElementById("endDate")!.addEventListener("change", updateBuildButtonState);

function setupTableListeners(availableId: string, selectedId: string) {
  const availableTable = document.getElementById(availableId)!;
  const selectedTable = document.getElementById(selectedId)!;
  const available = availableTable.querySelector("tbody")!;
  const selected = selectedTable.querySelector("tbody")!;

  available.addEventListener("click", (e) => toggleRowSelection(e));
  selected.addEventListener("click", (e) => toggleRowSelection(e));

  document.getElementById("add-btn")!.addEventListener("click", () => {
    moveSelected(available, selectedTable, true); // pass selectedTable
    updateBuildButtonState();
  });

  document.getElementById("add-all-btn")!.addEventListener("click", () => {
    moveAll(available, selectedTable, true); // pass selectedTable
    updateBuildButtonState();
  });

  document.getElementById("remove-btn")!.addEventListener("click", () => {
    moveSelected(selected, availableTable, true); // pass availableTable
    updateBuildButtonState();
  });

  document.getElementById("remove-all-btn")!.addEventListener("click", () => {
    moveAll(selected, availableTable, true); // pass availableTable
    updateBuildButtonState();
  });
}

function toggleRowSelection(event: MouseEvent) {
  const row = (event.target as HTMLElement).closest("tr");
  if (!row) return;

  if (event.ctrlKey || event.metaKey) {
    row.classList.toggle("selected");
  } else {
    const siblings = row.parentElement!.querySelectorAll(".selected");
    siblings.forEach((sib) => sib.classList.remove("selected"));
    row.classList.add("selected");
  }

  updateAccountCount();
}

function moveSelected(sourceTable: HTMLElement, targetTable: HTMLElement, isAccount: boolean) {
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
    console.log("📥 Adding to selectedAccountsData:", movedAccounts);
    selectedAccountsData.push(...movedAccounts); // ✅ FIXED HERE
    renderTable(selectedAccountsData, getSortKey(), "selected-accounts");
    sortTable("selected-accounts", selectedAccountsData);
  }

  updateAccountCount(isAccount);
  updateBuildButtonState();
}

function moveAll(from: HTMLElement, toTable: HTMLElement, isAccount: boolean) {
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
    console.log("📥 Adding to selectedAccountsData:", movedAccounts);
    selectedAccountsData.push(...movedAccounts); // ✅ FIXED HERE
    renderTable(selectedAccountsData, getSortKey(), "selected-accounts");
    sortTable("selected-accounts", selectedAccountsData);
  }

  updateAccountCount(isAccount);
  updateBuildButtonState();
}

function updateAccountCount() {
  const available = document.getElementById("available-accounts")!.querySelector("tbody")!;
  const selected = document.getElementById("selected-accounts")!.querySelector("tbody")!;
  document.getElementById("accounts-total")!.textContent = `${available.children.length} Accounts`;
  document.getElementById("accounts-selected")!.textContent =
    `${available.querySelectorAll(".selected").length} Selected`;
  document.getElementById("accounts-total-sel")!.textContent = `${selected.children.length} Accounts`;
  document.getElementById("accounts-selected-sel")!.textContent =
    `${selected.querySelectorAll(".selected").length} Selected`;
}

function getSortKey(): string {
  return (document.getElementById("view-account-name") as HTMLInputElement).checked ? "accountName" : "accountNumber";
}

function handleViewChange() {
  const viewBy = getSortKey();
  const accountsList = getLocalStorageData("accountList");
  renderTable(accountsList, viewBy);
  renderTable(selectedAccountsData, viewBy, "selected-accounts");
}

function sortTable(tableId: string, dataList: any[]): void {
  console.log(`🔃 Setting up sorting for: ${tableId}, Rows:`, dataList.length);
  const headers = document.querySelectorAll(`#${tableId} thead th`);
  headers.forEach((header, index) => {
    const clonedHeader = header.cloneNode(true) as HTMLElement;
    header.replaceWith(clonedHeader);
  });

  const cleanHeaders = document.querySelectorAll(`#${tableId} thead th`);
  cleanHeaders.forEach((header, index) => {
    let ascending = true;
    header.onclick = () => {
      const sortKey = index === 0 ? getSortKey() : "currency";
      console.log(`⬆️ Sorting ${tableId} by ${sortKey} (${ascending ? "ASC" : "DESC"})`);
      dataList.sort((a, b) => {
        const valA = typeof a[sortKey] === "string" ? a[sortKey].toLowerCase() : a[sortKey];
        const valB = typeof b[sortKey] === "string" ? b[sortKey].toLowerCase() : b[sortKey];
        return ascending ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
      });
      ascending = !ascending;
      renderTable(dataList, sortKey, tableId);
    };
  });
}
