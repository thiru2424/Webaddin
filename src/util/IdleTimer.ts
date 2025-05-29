import { Logger } from "./Logger";

Office.onReady(() => {
  initializeIdleTimer();
});

const IDLE_WARNING_TIME = 14 * 60 * 1000; // 15 minutes
let idleTimer: ReturnType<typeof setTimeout>;
let warningTimer: ReturnType<typeof setTimeout>;
let isWarningDisplayed = false;

export function initializeIdleTimer() {
  resetIdleTimer();
  document.addEventListener("mousemove", resetIdleTimer);
  document.addEventListener("keydown", resetIdleTimer);
  document.addEventListener("scroll", resetIdleTimer);
  document.addEventListener("touchstart", resetIdleTimer);
}

export function resetIdleTimer() {
  clearTimeout(idleTimer);
  clearTimeout(warningTimer);
  isWarningDisplayed = false;
  warningTimer = setTimeout(showIdleWarning, IDLE_WARNING_TIME);
}

export function showIdleWarning() {
  if (!Office.context || !Office.context.ui) {
    console.log("Office.js not ready, skipping warning.");
    return;
  }

  isWarningDisplayed = true;
  let countdown = 12;

  Office.context.ui.displayDialogAsync(
    "https://localhost:3000/session-warning.html",
    { height: 40, width: 30 },
    (asyncResult) => {
      if (asyncResult.status === Office.AsyncResultStatus.Failed) {
        Logger.error("Failed to open session warning:", asyncResult.error.message);
      } else {
        let dialog = asyncResult.value;

        let countdownInterval = setInterval(() => {
          countdown--;
          dialog.messageChild(countdown.toString());

          if (countdown <= 0) {
            clearInterval(countdownInterval);
            dialog.close();
            triggerSessionTimeout();
          }
        }, 1000);
      }
    }
  );
}

export function triggerSessionTimeout() {
  if (!Office.context || !Office.context.ui) {
    console.warn("Office.js not ready, skipping timeout.");
    return;
  }

  console.log("Session timed out. Redirecting to login.");

  Office.context.ui.displayDialogAsync(
    "https://localhost:3000/session-timeout.html",
    { height: 40, width: 30 },
    (asyncResult) => {
      if (asyncResult.status === Office.AsyncResultStatus.Failed) {
        if (asyncResult.error.code === 12007) {
          triggerSessionTimeout(); // Retry if dialog failed to open
        }
      }
    }
  );
}
