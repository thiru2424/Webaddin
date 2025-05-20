export async function insertPieChart(data: Record<string, number>, title: string, startRow: number) {
  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    
    const keys = Object.keys(data);
    const values = Object.values(data);

    const startCell = `A${startRow}`;
   const keyRange = sheet.getRange(startCell).getResizedRange(keys.length - 1, 0);
keyRange.values = keys.map(k => [k]);

const valueRange = sheet.getRange(`B${startRow}`).getResizedRange(values.length - 1, 0);
valueRange.values = values.map(v => [v]);


    const chart = sheet.charts.add(Excel.ChartType.pie, sheet.getRange(`A${startRow}:B${startRow + keys.length - 1}`));
    chart.title.text = title;
    
    await context.sync();
  });
}
