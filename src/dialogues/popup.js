/*global Office, window, document*/
Office.onReady(() => {
  window.location.href = "https://developer.jpmorgan.com";
  document.getElementById("ok-button").onclick = () => tryCatch1(sendStringToParentPage);
});

function sendStringToParentPage() {
  const userName = document.getElementById("name-box").value;
  Office.context.ui.messageParent(userName);
}

/** Default helper for invoking an action and handling errors. */
async function tryCatch1(callback) {
  try {
    await callback();
  } catch (error) {
    //empty
  }
}
