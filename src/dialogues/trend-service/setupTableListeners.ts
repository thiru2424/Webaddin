import { updateBuildButtonState } from "../trends";
import { moveSelected, moveAll } from "../trends";
export function setupTableListeners(availableId: string, selectedId: string) {
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

export function toggleRowSelection(event: MouseEvent) {
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
