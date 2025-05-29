import { Logger } from "../util/Logger";

export let API_BASE_URL = "";

export const loadConfig = async (): Promise<void> => {
  try {
    const response = await fetch("/assets/Config.json");
    if (!response.ok) {
      Logger.error("Failed to load config: " + `${response.status}`);
      Logger.showErrorDialog("Failed to load config: " + `${response.status}`);
      return;
    }
    const config = await response.json();
    API_BASE_URL = config.API_BASE_URL;
  } catch (error) {
    Logger.error("Failed to load config");
    Logger.showErrorDialog("Failed to load config");
  }
};

export const loadLanguage = async (): Promise<void> => {
  try {
    const response = await fetch("/assets/i18n.json");
    if (!response.ok) {
      Logger.error("Failed to load language: " + `${response.status}`);
      Logger.showErrorDialog("Failed to load language: " + `${response.status}`);
      return;
    }
    const language = await response.json();
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n") as string;
      element.textContent = language["en"][key] || key;
    });
  } catch (error) {
    Logger.error("Failed to load language");
    Logger.showErrorDialog("Failed to load language");
  }
};

export const API_URLS = {
  GET_CASH_POSITION: () => `${API_BASE_URL}/getCashPositionReport-response`,
  GET_INIT_DATA: () => `${API_BASE_URL}/getInitData-response`,
  CAN_CREATE_PAYMENT: () => `${API_BASE_URL}/canCreatePayment-response`,
  IS_USER_AUTHORIZED: () => `${API_BASE_URL}/isUserAuthorized-response`,
  GET_PAYMENT_TEMPLATE: () => `${API_BASE_URL}/getPaymentTemplatesForUser-response`,
  EXTEND_SESSION: () => `${API_BASE_URL}/extendSessionResponse`,
  GET_CURRENCIES: () => `${API_BASE_URL}/getAllAvailableCurrencies-response`,
};
