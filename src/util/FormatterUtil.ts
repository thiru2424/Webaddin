export function formatCell(
  cell: Excel.Range,
  fontName: any,
  item: {
    valueAlign: any;
    align: any;
    cellBackground: any;
    textBackground: any;
    font: any;
    bold: any;
    italic: any;
  },
  isValueAlign: boolean
) {
  cell.format.horizontalAlignment = isValueAlign ? item.valueAlign : item.align;
  cell.format.verticalAlignment = "Center";
  cell.format.fill.color = item.cellBackground;
  cell.format.font.name = fontName;
  cell.format.font.color = item.textBackground;
  cell.format.font.size = item.font;
  cell.format.font.bold = item.bold;
  cell.format.font.italic = item.italic;
}

export function formatValueCell(
  cell: any,
  fontName: any,
  horizontalAlignment: string,
  currencyCode?: string,
  value?: any
) {
  cell.format.horizontalAlignment = horizontalAlignment;
  cell.format.verticalAlignment = "Center";
  cell.format.font.name = fontName;
  cell.format.font.size = 11;
  if (currencyCode) cell.numberFormat = [[getNumberFormat(currencyCode, value)]];
}

export function formatNumericValue(value: any) {
  const inputValue = String(value).trim();
  if (inputValue === "" || inputValue === "-") return "-";
  const toNumber = Number(inputValue);
  if (isNaN(toNumber)) return "Not a number";
  return toNumber === 0 ? "-" : inputValue;
}

export function formatBorder(range: Excel.Range) {
  const borders = range.format.borders;
  const borderTypes = [
    Excel.BorderIndex.edgeTop,
    Excel.BorderIndex.edgeBottom,
    Excel.BorderIndex.edgeLeft,
    Excel.BorderIndex.edgeRight,
    Excel.BorderIndex.insideHorizontal,
    Excel.BorderIndex.insideVertical,
  ];

  borderTypes.forEach((borderType) => {
    const border = borders.getItem(borderType);
    border.style = Excel.BorderLineStyle.continuous;
    border.color = "#000000";
    border.weight = Excel.BorderWeight.thin;
  });
}

export function formatColumnWidth(range: Excel.Range) {
  range.format.wrapText = false;
  range.format.autofitColumns();
  range.format.wrapText = true;
  range.format.autofitColumns();
}

export function getExcelColumnLetter(colIndex: number): string {
  let letter = "";
  while (colIndex >= 0) {
    letter = String.fromCharCode((colIndex % 26) + 65) + letter;
    colIndex = Math.floor(colIndex / 26) - 1;
  }
  return letter;
}

function getNumberFormat(currencyCode: string, value: any): string {
  !value ? (value = 1.01) : value;
  const formatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
  }).format(value);

  return formatted.includes(".") ? "#,##0.00" : "#,##0";
}
