import { Logger } from "../util/Logger";
import { loadConfig, API_URLS } from "../taskpane/Config";
import { ApiService } from "./ApiService";

const api = new ApiService();

export class SessionService {
  async extendSession(): Promise<void> {
    try {
      await loadConfig();
      await api.get(API_URLS.EXTEND_SESSION());
    } catch (error) {
      Logger.error("Unable to extend session");
      Logger.showErrorDialog("Unable to extend session. Please contact support.");
    }
  }
}
