export function setupDateUI(validateDates: () => boolean) {
  const dateOption = document.getElementById("dateOption") as HTMLSelectElement;
  const startDate = document.getElementById("startDate") as HTMLInputElement;
  const endDate = document.getElementById("endDate") as HTMLInputElement;
  const startDateHead = document.getElementById("startHead") as HTMLElement;
  const endDateHead = document.getElementById("endHead") as HTMLElement;

  const today = new Date().toISOString().split("T")[0];
  startDate.max = today;
  endDate.max = today;

  dateOption.addEventListener("change", () => {
    const selected = dateOption.value;
    startDate.value = "";
    endDate.value = "";
    startDate.max = today;
    endDate.max = today;

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
}
