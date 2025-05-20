export async function insertBarChart(data: { account: string, balance: number }[], startRow: number) {
  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();

    const accounts = data.map(d => d.account);
    const balances = data.map(d => d.balance);

   const keyRange = sheet.getRange(`A${startRow}`).getResizedRange(accounts.length - 1, 0);
keyRange.values = accounts.map(a => [a]);

const valueRange = sheet.getRange(`B${startRow}`).getResizedRange(balances.length - 1, 0);
valueRange.values = balances.map(b => [b]);


    const chart = sheet.charts.add(Excel.ChartType.columnClustered, sheet.getRange(`A${startRow}:B${startRow + accounts.length - 1}`));
    chart.title.text = "Projected Cash Position";
    chart.axes.categoryAxis.title.text = "Account #";
    chart.axes.valueAxis.title.text = "Value";

    await context.sync();
  });
}
