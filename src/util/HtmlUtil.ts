export function populateDropdown(
  dropdown: HTMLSelectElement,
  items: any[],
  key1?: string,
  key2?: string,
  isConcat?: boolean
): void {
  items.forEach((item: any) => {
    const option = document.createElement("option");

    option.value = key2 ? item[key2] : item;

    option.textContent = isConcat && key1 && key2 ? `${item[key1]} ${item[key2]}` : key2 ? item[key2] : item;

    dropdown.appendChild(option);
  });
}
