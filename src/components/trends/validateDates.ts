export function validateDates(): boolean {
  const startDate = document.getElementById("startDate") as HTMLInputElement;
  const endDate = document.getElementById("endDate") as HTMLInputElement;
  const dateOption = document.getElementById("dateOption") as HTMLSelectElement;
  const errorBox = document.getElementById("dateError");

  const from = new Date(startDate.value);
  const to = new Date(endDate.value);
  const today = new Date();

  errorBox!.textContent = "";

  from.setHours(0, 0, 0, 0);
  to.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const mode = dateOption.value;

  if (mode === "prior") return true;

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
      errorBox!.textContent = "Select both dates.";
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
