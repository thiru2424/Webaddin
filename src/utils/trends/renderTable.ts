export function renderTable(data: any[], viewBy: string, tableId: string = "available-accounts"): void {
  const tbody = document.getElementById(tableId)!.querySelector("tbody")!;
  tbody.innerHTML = "";

  data.forEach((account) => {
    const row = document.createElement("tr");

    row.innerHTML = `<td>${viewBy === "accountName" ? account.accountName : account.accountNumber}</td>
                     <td>${account.currency}</td>`;

    // ✅ Fix: Enable row selection for moveSelected/moveAll
    row.addEventListener("click", () => {
      row.classList.toggle("selected");
    });

    tbody.appendChild(row);
  });
}
