/*global Office, document, Excel, localStorage, fetch*/
import translations from "../i18n.json";
import { fetchCurrencyData } from "../dialogues/trend-service/fetchCurrencyData";
import { fetchInitData } from "../dialogues/trend-service/fetchInitData";
Office.onReady((info) => {
  if (info.host === Office.HostType.Excel) {
    loadTranslations();
    document.addEventListener("DOMContentLoaded", () => {
      loadData();
    });
    // insertPieChart(ledgerData.credits, "Ledger Credits By Transaction Types", 35);
    // insertPieChart(ledgerData.debits, "Ledger Debits By Transaction Types", 60);
    // insertBarChart(projectedCashData, 80);

    document.getElementById("create-table").onclick = () => tryCatch(createTable);
    //  document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("open-dialog").onclick = openDialog;
    document.getElementById("exchangeRate").onclick = openFXRate;
    document.getElementById("build-new").onclick = openBuildNew;
    document.getElementById("create-table1").onclick = () => tryCatch(openTrends);

    document.addEventListener("popupLoaded", function () {
      loadTranslations();
    });
  }
});
async function loadData() {
  try {
    // Fetch account data
    const accountData = await fetchInitData();
    localStorage.setItem("accountList", JSON.stringify(accountData));

    // Fetch currency data
    const currencyData = await fetchCurrencyData();
    localStorage.setItem("currencyList", JSON.stringify(currencyData));
    console.log("both success", accountData, currencyData);
    // Ensure context is synced before opening the dialog
  } catch (error) {
    console.error("Error in openTrends:", error);
  }
}
function loadTranslations() {
  const texts = translations["en"]; // Default to English
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n") as string;
    const text = key.split(".").reduce((obj, keyPart) => obj && obj[keyPart], texts);
    if (text) element.textContent = text;
  });
}

async function createTable() {
  await Excel.run(async (context) => {
    const proxyUrl = "https://cors-anywhere.herokuapp.com/";
    const strQuery = `https://apirequest.azure-api.net/REST_APIs/Logon&Logoff/Initialize/GetInitData`;
    const response = await fetch(proxyUrl + strQuery, {
      method: "POST",
      body: JSON.stringify('{"getInitData": {"request": ""}}'),
    });
    const currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
    await context.sync();
    const rawJson: string = await response.json();
    // Translate the raw JSON into a usable state.
    const stringifiedJson = JSON.stringify(rawJson);
    // Note that we're only taking the data part of the JSON and excluding the metadata.
    let noaaData: NOAAData[] = JSON.parse(stringifiedJson).getInitDataResponse.initData.accountInfoList;
    localStorage.setItem("accountList", JSON.stringify(noaaData));
    let transactions: Transactions[] =
      JSON.parse(stringifiedJson).getInitDataResponse.initData.uiExtracts.extractTransTypeList;
    localStorage.setItem("transactionList", JSON.stringify(transactions));
    let paymentMethods: PaymentMethod[] =
      JSON.parse(stringifiedJson).getInitDataResponse.initData.uiExtracts.paymentMethodsList;
    localStorage.setItem("paymentMethodList", JSON.stringify(paymentMethods));
    const currencyQuery = `https://apirequest.azure-api.net/REST_APIs/Masterdata/GetAllAvailableCurrencies`;
    const currencyResponse = await fetch(proxyUrl + currencyQuery, {
      method: "POST",
      body: JSON.stringify('{"getAllAvailableCurrencies": {"request": ""}}'),
    });
    const currencyJson: string = await currencyResponse.json();
    // Translate the raw JSON into a usable state.
    const stringCurrencyJson = JSON.stringify(currencyJson);
    // Note that we're only taking the data part of the JSON and excluding the metadata.
    let currencyData: CurrencyData[] = JSON.parse(stringCurrencyJson).getAllAvailableCurrenciesResponse.currencyList;
    localStorage.setItem("currencyList", JSON.stringify(currencyData));
    localStorage.removeItem("remindersList");
    let remindersList: Reminders[] = [
      {
        accountNumber: "",
        threshold: "",
        action: "",
        template: "",
        from: "",
        to: "",
      },
    ];
    localStorage.setItem("remindersList", JSON.stringify(remindersList));
    // Create table headers and format them to stand out.
    let headers = [["Account name", "Account number"]];
    let headerRange = currentWorksheet.getRange("A1:B1");
    headerRange.values = headers;
    headerRange.format.fill.color = "#4472C4";
    headerRange.format.font.color = "white";
    headerRange.format.font.bold = true;
    headerRange.format.autofitColumns();

    // Insert all the data in rows from JSON.
    let noaaDataCount = noaaData.length;
    let dataToEnter = [[], []];
    for (let i = 0; i < noaaDataCount; i++) {
      let currentDataPiece = noaaData[i];
      dataToEnter[i] = [currentDataPiece.accountName, "'" + currentDataPiece.accountNumber];
    }

    let dataRange = currentWorksheet.getRange("A2:B" + String(noaaDataCount + 1)); /* +1 to account for the title row */
    dataRange.values = dataToEnter;
    // dataRange.getColumn(0).numberFormatLocal = "[$-en-US]mm/dd/yyyy hh:mm AM/PM;@";

    /*   let chart = currentWorksheet.charts.add(Excel.ChartType.xyscatterSmooth, dataRange);
    chart.title.text = "Balances";
    chart.top = 0;
    chart.left = 200;
    chart.width = 500;
    chart.height = 300;
    chart.axes.valueAxis.showDisplayUnitLabel = false;
    chart.axes.categoryAxis.textOrientation = 60;
    chart.legend.visible = false; */

    // Add a comment with the data attribution.
    currentWorksheet.comments.add("A1", `This data was taken from the JP Morgan openAPI on ${new Date(Date.now())}.`);
    /**
     * An interface to wrap the parts of the JSON we need.
     * These properties must match the names used in the JSON.
     */
    interface NOAAData {
      accountName: string;
      accountNumber: string;
      currency: string;
    }

    interface Transactions {
      code: string;
      description: string;
      transactionsType: string;
    }

    interface CurrencyData {
      currency: string;
    }

    interface PaymentMethod {
      code: string;
      description: string;
      methodType: Number;
    }

    interface Reminders {
      accountNumber: string;
      threshold: string;
      action: string;
      template: string;
      from: string;
      to: string;
    }
  });
}

async function tryCatch(callback) {
  try {
    await callback();
  } catch (error) {
    /* empty */
  }
}

let dialog = null;

function openDialog() {
  Office.context.ui.displayDialogAsync(
    "https://localhost:3000/popup.html",
    { height: 45, width: 55 }

    // function (result) {
    //   dialog = result.value;
    //   dialog.addEventHandler(Office.EventType.DialogMessageReceived, processMessage);
    // }
  );
}

function openFXRate() {
  Office.context.ui.displayDialogAsync(
    "https://localhost:3000/exRate.html",
    { height: 70, width: 40 },

    function (result) {
      const dialog = result.value;

      dialog.addEventHandler(Office.EventType.DialogMessageReceived, (message) => {
        const jsonObject = JSON.parse(message.message);

        if (jsonObject.type === "FX_RATES" && Array.isArray(jsonObject.data)) {
          addWorksheetAndWriteValues(jsonObject.data);
        } else {
          console.warn("Invalid FX data received:", jsonObject.data);
        }

        dialog.close();
      });
    }
  );
}

function openBuildNew() {
  Office.context.ui.displayDialogAsync(
    "https://localhost:3000/buildNew.html",
    { height: 80, width: 65 },
    function (result) {
      dialog = result.value;

      dialog.addEventHandler(Office.EventType.DialogMessageReceived, (message) => {
        const jsonObject = JSON.parse(message.message);
        console.log("Currency object being passed:", jsonObject);

        if (jsonObject.type === "CLOSE_DIALOG") {
          dialog.close(); // ✅ Close the dialog from taskpane
          return;
        }

        if (jsonObject.type === "FX_RATES") {
          addWorksheetAndWriteValues(jsonObject.data);
          dialog.close();
        }
      });
    }
  );
}

async function openTrends(): Promise<void> {
  Office.context.ui.displayDialogAsync(
    "https://localhost:3000/trends.html",
    { height: 80, width: 65 },
    function (result) {
      const dialog = result.value;

      dialog.addEventHandler(Office.EventType.DialogMessageReceived, (message) => {
        const jsonObject = JSON.parse(message.message);

        if (jsonObject.type === "CLOSE_DIALOG") {
          dialog.close(); // ✅ Close the dialog from taskpane
          return;
        }
      });
    }
  );
}

function processMessage(arg) {
  document.getElementById("user-name").innerHTML = arg.message;
  dialog.close();
}

export async function addWorksheetAndWriteValues(currencyList) {
  try {
    const data = Array.isArray(currencyList) ? currencyList : [currencyList];

    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      sheet.activate();

      // 🔄 Clear the whole sheet safely
      const usedRange = sheet.getUsedRange();
      usedRange.load("address");
      await context.sync();
      usedRange.clear();

      const output = [["From Currency", "Target Currency", "Rate"]];
      data.forEach((item) => {
        output.push([item.fromCurrency, item.toCurrency, item.fxRate]);
      });

      const range = sheet.getRangeByIndexes(0, 0, output.length, output[0].length);
      range.values = output;
      const headerRange = sheet.getRangeByIndexes(0, 0, 1, output[0].length);
      headerRange.format.font.bold = true;
      headerRange.format.fill.color = "#D9D9D9"; // light grey

      await context.sync();
    });
  } catch (error) {
    console.error("Excel write failed:", error);
  }
}
