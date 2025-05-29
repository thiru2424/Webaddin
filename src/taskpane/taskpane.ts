/* global Office, document, Excel, fetch */

import { loadLanguage, loadConfig, API_URLS } from "./Config";
import { ApiService } from "../service/ApiService";
import { CanCreatePayment, Currency, PaymentTemplate, UserAuthorized, accountData } from "./Interfaces";
import { SessionService } from "../service/SessionService";
import { CashPosition } from "./CashPosition";
import { ExchangeRate } from "./ExchangeRate";
import { Logger } from "../util/Logger";
import { initializeIdleTimer } from "../util/IdleTimer";

const sessionService = new SessionService();
const api = new ApiService();
let lastExtendedAt = 0;
const EXTEND_SESSION_TIME = 5 * 60 * 1000;
const cashPosition = new CashPosition();
const exchangeRate = new ExchangeRate();

Office.onReady(async (info) => {
  if (info.host === Office.HostType.Excel) {
    try {
      await loadConfig();
      await loadLanguage();
      initialize();
      initializeIdleTimer();
      extendSession();

      document.getElementById("create-table")!.onclick = () => tryCatch(createTable);
    } catch (error) {
      Logger.error("Failed to load config");
      Logger.showErrorDialog("Failed to load config");
    }

    document.getElementById("app-body")!.style.display = "flex";
    document.getElementById("login-dialog")!.onclick = openLogin;
    document.getElementById("create-table")!.onclick = createCashPosition;
    document.getElementById("exchangeRate")!.onclick = openFXRate;
    document.getElementById("build-new")!.onclick = openBuildNew;
    document.getElementById("create-table1")!.onclick = () => tryCatch(openTrends);
  }
});

async function handleUserActivity() {
  const now = Date.now();
  if (now - lastExtendedAt > EXTEND_SESSION_TIME) {
    lastExtendedAt = now;
    sessionService.extendSession();
  }
}

async function extendSession() {
  document.addEventListener("mousemove", handleUserActivity);
  document.addEventListener("keydown", handleUserActivity);
  document.addEventListener("scroll", handleUserActivity);
  document.addEventListener("touchstart", handleUserActivity);
}

async function initialize() {
  const initData = JSON.stringify(await api.get(API_URLS.GET_INIT_DATA()));
  let initialDataList = JSON.parse(initData).initData;
  let accountList = JSON.parse(initData).initData.accountInfoList;
  await OfficeRuntime.storage.setItem("initialData", JSON.stringify(initialDataList));
  await OfficeRuntime.storage.setItem("accountList", JSON.stringify(accountList));

  const canCreatePayment = JSON.stringify(await api.get(API_URLS.CAN_CREATE_PAYMENT()));
  let createPaymentList: CanCreatePayment[] = JSON.parse(canCreatePayment);
  await OfficeRuntime.storage.setItem("canCreatePayment", JSON.stringify(createPaymentList));

  const isUserAuthorized = JSON.stringify(await api.get(API_URLS.IS_USER_AUTHORIZED()));
  let userAuthorized: UserAuthorized[] = JSON.parse(isUserAuthorized);
  await OfficeRuntime.storage.setItem("isUserAuthorized", JSON.stringify(userAuthorized));

  const paymentTemplateList = JSON.stringify(await api.get(API_URLS.GET_PAYMENT_TEMPLATE()));
  let paymentTemplates: PaymentTemplate[] = JSON.parse(paymentTemplateList).paymentsTemplateList.paymentsTemplates;
  await OfficeRuntime.storage.setItem("paymentTemplates", JSON.stringify(paymentTemplates));

  const currencyList = JSON.stringify(await api.get(API_URLS.GET_CURRENCIES()));
  let currencies: Currency[] = JSON.parse(currencyList).currencyList.exchangeCurrency;
  await OfficeRuntime.storage.setItem("currencies", JSON.stringify(currencies));
}

async function createTable() {
  await Excel.run(async (context) => {
    let noaaData: any[] = [];

    const currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
    await context.sync();

    let headers = [["Account name", "Account number"]];
    let headerRange = currentWorksheet.getRange("A1:B1");
    headerRange.values = headers;
    headerRange.format.fill.color = "#4472C4";
    headerRange.format.font.color = "white";
    headerRange.format.font.bold = true;
    headerRange.format.autofitColumns();

    let noaaDataCount = noaaData.length;
    let dataToEnter: any[][] = [];

    for (let i = 0; i < noaaDataCount; i++) {
      let currentDataPiece = noaaData[i];
      dataToEnter[i] = [currentDataPiece.accountName, "" + currentDataPiece.accountNumber];
    }

    let dataRange = currentWorksheet.getRange(`A2:B${noaaDataCount + 1}`);
    dataRange.values = dataToEnter;

    currentWorksheet.comments.add("A1", `This data was taken from the JP Morgan openAPI on ${new Date(Date.now())}.`);
  });
}

async function tryCatch(callback: Function) {
  try {
    await callback();
  } catch (error) {
    // empty
  }
}

async function createCashPosition() {
  await showProcessingDialog();
  try {
    await cashPosition.populateExcel();
    console.log("Excel populated successfully.");
  } catch (error) {
    console.log("Failed to populate Excel:", error);
  } finally {
    setTimeout(() => {
      closeProcessingDialog();
    }, 1000);
  }
}

let processingDialog: Office.Dialog;
let dialog: Office.Dialog;

function showProcessingDialog() {
  Office.context.ui.displayDialogAsync(
    window.location.origin + "/splash.html",
    { height: 30, width: 30, displayInIframe: true },
    function (asyncResult) {
      if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
        processingDialog = asyncResult.value;
      } else {
        Logger.error("Failed to open dialog", asyncResult.error.message);
      }
    }
  );
}

function closeProcessingDialog() {
  if (processingDialog) {
    processingDialog.close();
  }
}

function openLogin() {
  const loginUrl = "https://localhost:3000/login.html";
  Office.context.ui.displayDialogAsync(
    loginUrl,
    { height: 55, width: 55 },
    function (result) {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        const dialog = result.value;
        dialog.addEventHandler(Office.EventType.DialogEventReceived, (event) => {});
        console.log("Popup opened successfully");
      } else {
        console.log("Failed to open popup");
      }
    }
  );
}

function openFXRate() {
  Office.context.ui.displayDialogAsync(
    window.location.origin + "/fxRate.html",
    { height: 81, width: 65 },
    function (result) {
      dialog = result.value;
      dialog.addEventHandler(Office.EventType.DialogMessageReceived, async (arg) => {
        const message = JSON.parse(arg.message);
        if (message.type === "Ready") {
          const currencies = await getLocalStorageData("currencies");
          dialog.messageChild(JSON.stringify({ type: "currencies", currencies }));
        }
        if (message.type === "Close") {
          dialog.close();
        }
        if (message.type === "Build") {
          exchangeRate.populateExchangeRates(message.fxData);
          dialog.close();
        }
      });
    }
  );
}

async function getLocalStorageData(key: string): Promise<any[]> {
  const outputList = await OfficeRuntime.storage.getItem(key);
  return JSON.parse(outputList) || [];
}

async function openBuildNew() {
  Office.context.ui.displayDialogAsync(
    window.location.origin + "/buildNew.html",
    { height: 81, width: 65 },
    async (result) => {
      dialog = result.value;
      dialog.addEventHandler(Office.EventType.DialogMessageReceived, async (arg) => {
        const message = JSON.parse(arg.message);
        if (message.type === "Ready") {
          const initialData = await getLocalStorageData("initialData");
          const currencies = await getLocalStorageData("currencies");
          dialog.messageChild(JSON.stringify({ type: "initialData", initialData }, { type: "currencies", currencies }));
        }
      });
    }
  );
}

function openTrends() {
  Office.context.ui.displayDialogAsync(
    window.location.origin + "/trends.html",
    { height: 81, width: 65 },
    function (result) {
      dialog = result.value;
      dialog.addEventHandler(Office.EventType.DialogMessageReceived, async (arg) => {
        const message = JSON.parse(arg.message);
        if (message.type === "Ready") {
          const accountList = await getLocalStorageData("accountList");
          dialog.messageChild(JSON.stringify({ type: "accountList", accountList }));
        }
        if (message.type === "Close") {
          dialog.close();
        }
        if (message.type === "Build") {
          exchangeRate.populateExchangeRates(message.fxData);
          dialog.close();
        }
      });
    }
  );
}

function processMessage(arg: any) {
  document.getElementById("user-name")!.innerHTML = arg.message;
  dialog.close();
}

async function addWorksheetAndWriteValues(currencies: any) {
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      sheet.activate();
      await context.sync();
      sheet.getRange("A1").values = [
        ["The exchange rate for " + currencies.fromCurrency + " and " + currencies.toCurrency + " is 0.91"],
      ];
      await context.sync();
    });
  } catch (error) {
    // empty
  }
}
