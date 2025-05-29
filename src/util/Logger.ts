export class Logger {
  static info(message: string, ...args: any[]) {
    console.info(`[INFO] ${message}`, ...args);
  }

  static warn(message: string, ...args: any[]) {
    console.warn(`[WARN] ${message}`, ...args);
  }

  static error(message: string, ...args: any[]) {
    console.error(`[ERROR] ${message}`, ...args);
  }

  static showErrorDialog(message: string) {
    Office.context.ui.displayDialogAsync(
      window.location.origin + "/error.html?msg=" + encodeURIComponent(message),
      { height: 30, width: 40, displayInIframe: true },
      (result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          const dialog = result.value;
          dialog.addEventHandler(Office.EventType.DialogMessageReceived, () => dialog.close());
        } else {
          console.error("Failed to show error dialog:", result.error.message);
        }
      }
    );
  }
}
