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