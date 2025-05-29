import { Logger } from "../util/Logger";
export class ApiService {
  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      this.handleErrors(response);
      return response.json();
    } catch (error) {
      Logger.error("Error while contacting API. Please contact support");
      Logger.showErrorDialog("Error while contacting API. Please contact support");
    }
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    this.handleErrors(response);
    return response.json();
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    this.handleErrors(response);
    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    this.handleErrors(response);
    return response.json();
  }

  private handleErrors(response: Response) {
    if (!response.ok) {
      Logger.error("HTTP error! status: " + `${response.status}`);
      Logger.showErrorDialog("HTTP error! status: " + `${response.status}`);
    }
  }

  async fetchConfig(configFile: string): Promise<any> {
    try {
      const response = await fetch(configFile);
      if (!response.ok) {
        Logger.error("Unable to load config files. " + configFile);
        Logger.showErrorDialog("Unable to load config files. Please contact support");
      }
      return await response.json();
    } catch (error) {
      Logger.error("Unable to load config files. " + configFile);
      Logger.showErrorDialog("Unable to load config files. Please contact support");
    }
  }
}
