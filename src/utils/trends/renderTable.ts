export function renderTable(data: any[], viewBy: string, tableId: string = "available-accounts"): void {
  const tbody = document.getElementById(tableId)!.querySelector("tbody")!;

  // Store selected row identifiers (accountNumber or accountName)
  const selectedKeys = Array.from(tbody.querySelectorAll("tr.selected")).map((row) =>
    row.querySelector("td")?.textContent?.trim()
  );

  tbody.innerHTML = "";

  data.forEach((account) => {
    const key = viewBy === "accountName" ? account.accountName : account.accountNumber;
    const currency = account.currency;

    const row = document.createElement("tr");
    row.innerHTML = `<td>${key}</td><td>${currency}</td>`;

    if (selectedKeys.includes(String(key))) {
      row.classList.add("selected");
    }

    tbody.appendChild(row);
  });
}
