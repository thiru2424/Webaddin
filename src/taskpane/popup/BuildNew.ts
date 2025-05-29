/*global Office, document, window, localStorage*/
Office.onReady(() => {
  setupEventListeners();
  initializeData();
});

function showImagePopup() {
  const modal = document.getElementById("imageModal");
  modal.style.display = "block";
  document.querySelector(".close").addEventListener("click", () => {
    modal.style.display = "none";
  });
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
}

function moveToNextTab() {
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const contents = Array.from(document.querySelectorAll(".tab-content"));
  let activeIndex = tabs.findIndex((tab) => tab.classList.contains("active"));
  if (activeIndex >= 0 && activeIndex < tabs.length - 1) {
    tabs[activeIndex].classList.remove("active");
    contents[activeIndex].classList.add("hidden");
    tabs[activeIndex + 1].classList.add("active");
    contents[activeIndex + 1].classList.remove("hidden");
    if (activeIndex === 2) {
      document.getElementById("nextStepButton").classList.add("btn-disabled");
      document.getElementById("buildWS").classList.remove("btn-disabled");
      document.getElementById("buildWS").classList.add("btn-gray");
    } else {
      document.getElementById("buildWS").classList.add("btn-disabled");
      document.getElementById("nextStepButton").classList.remove("btn-disabled");
      document.getElementById("nextStepButton").classList.add("btn-gray");
    }
  }
}

function applyFilters() {
  const accountsList = getLocalStorageData("accountList");
  const filterCurrency = document.getElementById("filterCurrency").value;
  const filterAccount = document.getElementById("filterAccount").value.toLowerCase();
  const filterAccName = document.getElementById("filterAccountName").value.toLowerCase();

  const filteredData = accountsList.filter(
    (account) =>
      (!filterCurrency || filterCurrency === "All" || account.currency === filterCurrency) &&
    (!filterAccount || (account.accountNumber + "").includes(filterAccount)) &&
    (!filterAccName || account.accountName.toLowerCase().includes(filterAccName))
  );

  renderTable(filteredData, getSortKey());
}

function removeFilters() {
  document.getElementById("filterCurrency").value = "All";
  document.getElementById("filterAccount").value = "";
  document.getElementById("filterAccountName").value = "";
  renderTable(getLocalStorageData("accountList"), getSortKey());
}
function setupEventListeners() {
  document.getElementById("balanceExample").addEventListener("click", showImagePopup);
  document.getElementById("nextStepButton").addEventListener("click", moveToNextTab);
  document.getElementById("applyFilter").addEventListener("click", applyFilters);
  document.getElementById("removeFilter").addEventListener("click", removeFilters);
  document.getElementById("reminder-from").addEventListener("change", addReminderRow);

  setupTableListeners("available-accounts", "selected-accounts", true);
  setupTableListeners("available-tx", "selected-tx", false);
  setupTabNavigation();
  document.getElementById("view-account-number").addEventListener("change", () => handleViewChange());
  document.getElementById("view-account-name").addEventListener("change", () => handleViewChange());
}
function renderRemindersTable(remindersList) {
  const remindersTable = document.getElementById("reminders-table");
  const tbody = remindersTable.querySelector("tbody");

  // Clear the table before re-rendering
  tbody.innerHTML = "";

  // Populate table with updated data
  remindersList.forEach((rowData: any) => {
    const row = document.createElement("tr");

    row.innerHTML = `
          <td>${rowData.accountNumber}</td>
          <td>${rowData.threshold}</td>
          <td>${rowData.action}</td>
          <td>${rowData.template}</td>
          <td>${rowData.from}</td>
          <td>${rowData.to}</td>
      `;

    tbody.appendChild(row);
  });
}

// Function to add a row to the reminders table
function addReminderRow() {
  const fromAccountDropdown = document.getElementById("reminder-from");
  const toAccountDropdown = document.getElementById("reminder-acc-dropdown");
  const paymentMethodDropdown = document.getElementById("reminder-action");
  const thresholdInput = document.getElementById("typeAmt");
  if (!fromAccountDropdown.value) return; // Ensure a "From" account is selected
  let remindersList = getLocalStorageData("remindersList");
  // Fetch values from input fields
  const account = toAccountDropdown.value || "-";
  const threshold = getSelectedRadioLabel() + " " + thresholdInput.value;
  const action = paymentMethodDropdown.value || "-";
  const template = paymentMethodDropdown.value || "-";
  const from = fromAccountDropdown.value;
  const to = toAccountDropdown.value || "-";
  let reminderJson = {
    accountNumber: account,
    threshold: threshold,
    action: action,
    template: template,
    from: from,
    to: to,
  };
  remindersList.push(reminderJson);
  localStorage.setItem("remindersList", JSON.stringify(remindersList));
  renderRemindersTable(remindersList);
}

// Function to get the selected radio button label
function getSelectedRadioLabel() {
  const selectedRadio = document.querySelector("input[name='ltgt-options']:checked");
  if (selectedRadio) {
    const label = document.querySelector(`label[for="${selectedRadio.id}"]`);
    return label ? label.textContent : "-";
  }
  return "-";
}

function handleViewChange() {
  const accountsList = getLocalStorageData("accountList");
  renderTable(accountsList, getSortKey());
}
function initializeData() {
  populateDropdown(document.getElementById("filterCurrency"), "currencyList");
  populateDropdown(document.getElementById("base-currency-dropdown"), "currencyList");
  populateDropdown(
    document.getElementById("reminder-acc-dropdown"),
    "accountList",
    "accountNumber",
    "accountName",
    true
  );
  populateDropdown(document.getElementById("reminder-from"), "accountList", "accountNumber", "accountName", true);
  populateDropdown(document.getElementById("reminder-action"), "paymentMethodList", "code", "description", false);
  const accountsList = getLocalStorageData("accountList");
  const transactionList = getLocalStorageData("transactionList");
  const remindersList = getLocalStorageData("remindersList");
  renderTable(accountsList, "accountNumber");
  renderTransactions(transactionList);

  updateAccountCount(true);
  updateAccountCount(false);
  sortTable("available-accounts", accountsList, "account");
  sortTable("available-tx", transactionList, "transactions");
  sortTable("reminders-table", remindersList, "reminders");
}

export function getLocalStorageData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function setupTableListeners(availableId, selectedId, isAccount) {
  const availableTable = document.getElementById(availableId).querySelector("tbody");
  const selectedTable = document.getElementById(selectedId).querySelector("tbody");

  // Event delegation for row selection
  availableTable.addEventListener("click", (event) => {
    if (event.target.closest("tr")) {
      selectRow(event, isAccount);
    }
  });

  selectedTable.addEventListener("click", (event) => {
    if (event.target.closest("tr")) {
      selectRow(event, isAccount);
    }
  });

  document
    .getElementById(`add-btn${isAccount ? "" : "-tx"}`)
    .addEventListener("click", () => moveSelected(availableTable, selectedTable, isAccount));
  document
    .getElementById(`add-all-btn${isAccount ? "" : "-tx"}`)
    .addEventListener("click", () => moveAll(availableTable, selectedTable, isAccount));
  document
    .getElementById(`remove-btn${isAccount ? "" : "-tx"}`)
    .addEventListener("click", () => moveSelected(selectedTable, availableTable, isAccount));
  document
    .getElementById(`remove-all-btn${isAccount ? "" : "-tx"}`)
    .addEventListener("click", () => moveAll(selectedTable, availableTable, isAccount));
}

function moveSelected(sourceTable, targetTable, isAccount) {
  Array.from(sourceTable.querySelectorAll(".selected")).forEach((row) => {
    row.classList.remove("selected");
    targetTable.appendChild(row);
  });
  updateAccountCount(isAccount);
}

function moveAll(sourceTable, targetTable, isAccount) {
  Array.from(sourceTable.children).forEach((row) => {
    row.classList.remove("selected");
    targetTable.appendChild(row);
  });
  updateAccountCount(isAccount);
}

function setupTabNavigation() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      document.querySelectorAll(".tab-content").forEach((content) => content.classList.add("hidden"));
      document.getElementById(tab.getAttribute("data-tab")).classList.remove("hidden");
      if (tab.getAttribute("data-tab") === "reminders") {
        document.getElementById("nextStepButton").classList.add("btn-disabled");
        document.getElementById("buildWS").classList.remove("btn-disabled");
        document.getElementById("buildWS").classList.add("btn-gray");
      } else {
        document.getElementById("buildWS").classList.add("btn-disabled");
        document.getElementById("nextStepButton").classList.remove("btn-disabled");
        document.getElementById("nextStepButton").classList.add("btn-gray");
      }
    });
  });
}

function sortTable(tableId, dataList, sortFor) {
  const headers = document.querySelectorAll(`#${tableId} thead th`);
  headers.forEach((header, index) => {
    let ascending = true;
    header.addEventListener("click", () => {
      const sortKey = sortFor === "account" && index === 0 ? getSortKey() : "currency";
      dataList.sort((a, b) => {
        const valA = isNaN(a[sortKey]) ? String(a[sortKey] || "").toLowerCase() : Number(a[sortKey]);
        const valB = isNaN(b[sortKey]) ? String(b[sortKey] || "").toLowerCase() : Number(b[sortKey]);
        return ascending ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
      });
      ascending = !ascending;
      sortFor === "account"
        ? renderTable(dataList, sortKey)
        : sortFor === "transactions"
          ? renderTransactions(dataList)
          : renderRemindersTable(dataList);
    });
  });
}

function getSortKey() {
  return document.getElementById("view-account-name").checked ? "accountName" : "accountNumber";
}

function populateDropdown(dropdown, storageKey, key1?, key2?, isConcat?) {
  const items = JSON.parse(localStorage.getItem(storageKey) || "[]");
  console.log(`📦 Populating dropdown for key: ${storageKey}`, items);

  items.forEach((item: any) => {
    const option = document.createElement("option");
    option.value = key1 ? item[key1] : item; // If key is provided, use item[key]; otherwise, use item itself
    option.textContent = isConcat && key1 && key2 ? item[key1] + " " + item[key2] : key2 ? item[key2] : item;
    dropdown.appendChild(option);
  });
}

function renderTable(data, viewBy) {
  const availableTable = document.getElementById("available-accounts").querySelector("tbody");
  availableTable.innerHTML = "";
  data.forEach((account) => {
    let row = document.createElement("tr");
    row.innerHTML = `<td>${viewBy === "accountName" ? account.accountName : account.accountNumber}</td><td>${account.currency}</td>`;
    availableTable.appendChild(row);
  });
}

function renderTransactions(data) {
  const availableTx = document.getElementById("available-tx").querySelector("tbody");
  availableTx.innerHTML = "";
  data.forEach((transaction) => {
    let row = document.createElement("tr");
    row.innerHTML = `<td>${transaction.description}</td>`;
    availableTx.appendChild(row);
  });
}

function updateAccountCount(isAccount) {
  const available = document.getElementById(isAccount ? "available-accounts" : "available-tx").querySelector("tbody");
  const selected = document.getElementById(isAccount ? "selected-accounts" : "selected-tx").querySelector("tbody");
  document.getElementById(isAccount ? "accounts-total" : "total-tx").textContent = `${available.children.length} items`;
  document.getElementById(isAccount ? "accounts-selected" : "selected-avb-tx").textContent =
    `${available.querySelectorAll(".selected").length} Selected`;
  document.getElementById(isAccount ? "accounts-total-sel" : "total-sel-tx").textContent =
    `${selected.children.length} items`;
  document.getElementById(isAccount ? "accounts-selected-sel" : "selected-sel-tx").textContent =
    `${selected.querySelectorAll(".selected").length} Selected`;
}

function selectRow(event, isAccount) {
  const row = event.target.closest("tr");
  if (!row) return; // Ensure a row was clicked
  if (event.ctrlKey || event.metaKey) {
    row.classList.toggle("selected");
  } else {
    row
      .closest("tbody")
      .querySelectorAll(".selected")
      .forEach((r) => r.classList.remove("selected"));
    row.classList.add("selected");
  }
  updateAccountCount(isAccount);
}
