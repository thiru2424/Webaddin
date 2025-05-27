import { updateBuildButtonState } from "../../utils/trends/updateBuildButtonState";
import { moveSelected, moveAll } from "../../utils/trends/moveAccounts";
export function setupTableListeners(availableId: string, selectedId: string) {
  const availableTable = document.getElementById(availableId)!;
  const selectedTable = document.getElementById(selectedId)!;
  const available = availableTable.querySelector("tbody")!;
  const selected = selectedTable.querySelector("tbody")!;
  console.log("setting up toggleRowSelection");
  available.addEventListener("click", (e) => toggleRowSelection(e));
  console.log("setting up toggleRowSelection");
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

export function toggleRowSelection(event: MouseEvent) {
  const row = (event.target as HTMLElement).closest("tr");
  if (!row) {
    console.log("⚠️ No <tr> found for the clicked element.");
    return;
  }

  if (event.ctrlKey || event.metaKey) {
    const wasSelected = row.classList.contains("selected");
    row.classList.toggle("selected");
  } else {
    const tbody = row.closest("tbody");
    const previouslySelected = tbody?.querySelectorAll(".selected") || [];

    previouslySelected.forEach((r) => {
      r.classList.remove("selected");
    });

    row.classList.add("selected");
  }

  updateAccountCount();
}

export function updateAccountCount() {
  const available = document.getElementById("available-accounts")!.querySelector("tbody")!;
  const selected = document.getElementById("selected-accounts")!.querySelector("tbody")!;
  document.getElementById("accounts-total")!.textContent = `${available.children.length} Accounts`;
  document.getElementById("accounts-selected")!.textContent =
    `${available.querySelectorAll(".selected").length} Selected`;
  document.getElementById("accounts-total-sel")!.textContent = `${selected.children.length} Accounts`;
  document.getElementById("accounts-selected-sel")!.textContent =
    `${selected.querySelectorAll(".selected").length} Selected`;
}
