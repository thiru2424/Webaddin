import { getLocalStorageData } from "../../dialogues/trends";
export function populateDropdown(dropdown: HTMLElement | null, items: any) {

  items.forEach((item: any) => {
    const option = document.createElement("option");
    option.value = item.currency || item; // Support both object or string format
    option.textContent = item.currency || item;
    dropdown.appendChild(option);
  });
}