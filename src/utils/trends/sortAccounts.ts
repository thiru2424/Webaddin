import { renderTable } from "./renderTable";
export function sortTable(tableId: string, dataList: any[]): void {
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


export function getSortKey(): string {
  return (document.getElementById("view-account-name") as HTMLInputElement).checked ? "accountName" : "accountNumber";
}