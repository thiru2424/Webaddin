import { getCurrencies, getExchangeRate } from './currencyService';

Office.onReady(async (info) => {
  if (info.host === Office.HostType.Excel) {
    const currencyFromSelect = document.getElementById('currencyFrom').value;
    const currencyToSelect = document.getElementById('currencyTo').value;
    const getRateButton = document.getElementById('getRate').value;
    const resultDiv = document.getElementById('result').value;

    try {
      const currencies = await getCurrencies();
      currencies.forEach(currency => {
        const optionFrom = document.createElement('option');
        optionFrom.value = currency;
        optionFrom.text = currency;
        currencyFromSelect.add(optionFrom);

        const optionTo = document.createElement('option');
        optionTo.value = currency;
        optionTo.text = currency;
        currencyToSelect.add(optionTo);
      });
    } catch (error) {
      console.error(error);
    }

    getRateButton.addEventListener('click', async () => {
      const currencyFrom = currencyFromSelect.value;
      const currencyTo = currencyToSelect.value;

      try {
        const exchangeRate = await getExchangeRate(currencyFrom, currencyTo);
        resultDiv.innerText = `Exchange Rate from ${currencyFrom} to ${currencyTo}: ${exchangeRate}`;
        
        // Write the exchange rate to the active cell in Excel
        await Excel.run(async (context) => {
          const sheet = context.workbook.worksheets.getActiveWorksheet();
          const cell = sheet.getActiveCell();
          cell.values = [[exchangeRate]];
          await context.sync();
        });
      } catch (error) {
        console.error(error);
      }
    });
  }
});
