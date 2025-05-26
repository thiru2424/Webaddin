export function renderTable(data: any[], viewBy: string, tableId: string = "available-accounts"): void {
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