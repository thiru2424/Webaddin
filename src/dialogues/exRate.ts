import { currencyList } from "../utils/currencyList";
import { registerRefresh } from "../utils/refreshManger";
import { FXMapping, FXMappingResponse } from "../models/fxRateInterface";
Office.onReady(() => {

  const fxMappings: FXMapping[] = [];

  const addButton = document.getElementById("addButton") as HTMLButtonElement | null;
  const buildButton = document.getElementById("buildButton") as HTMLButtonElement | null;
  const deleteButton = document.getElementById("deleteButton") as HTMLButtonElement | null;

  populateCurrencySelects();
  colorChange();


  function colorChange() {
    const options = document.querySelectorAll('#currencyList option');
    options.forEach((opt, index) => {
      if (index % 2 === 0) {
        opt.style.backgroundColor = 'white';
        opt.style.color = "#000";
      } else {
        opt.style.color = "#000";

      }
    });
  }
  function populateCurrencySelects() {
    const fromSelect = document.getElementById("currencyList") as HTMLSelectElement;
    const toSelect = document.getElementById("targetCurrency") as HTMLSelectElement;
    const addButton = document.getElementById("addButton") as HTMLButtonElement;

    Object.entries(currencyList).forEach(([code, name], index) => {
      const fullLabel = `${code} - ${name}`;
      const option1 = new Option(fullLabel, fullLabel);
      const option2 = new Option(code, code);

      if (index % 2 === 0) {
        option1.style.backgroundColor = "white";
      } else {
      }

      fromSelect.appendChild(option1);
      toSelect.appendChild(option2);
    });

    fromSelect.addEventListener("change", checkEnableAddButton);
    toSelect.addEventListener("change", checkEnableAddButton);

    function checkEnableAddButton() {
      const fromSelected = fromSelect.selectedOptions.length > 0;
      const toSelected = toSelect.value !== "";
      addButton.disabled = !(fromSelected && toSelected);
    }

  }

  function renderFXTable() {
    const list = document.getElementById("selectedCurrencyList") as HTMLSelectElement | null;
    const deleteBtn = document.getElementById("deleteButton") as HTMLButtonElement | null;
    const buildBtn = document.getElementById("buildButton") as HTMLButtonElement | null;

    console.log("🔍 renderFXTable called");
      debugger; // will pause here if DevTools are open

    console.log("✅ list exists:", !!list);
    console.log("✅ buildBtn exists:", !!buildBtn);
    console.log("✅ deleteBtn exists:", !!deleteBtn);

    if (!list) {
      console.warn("❌ selectedCurrencyList not found");
      return;
    }

    list.innerHTML = "";
    console.log("📛 list cleared");

    fxMappings.forEach((entry, idx) => {
      const option = document.createElement("option");

      const col1 = entry.fromCurrency.padEnd(19, "\u00A0");
      const col2 = entry.toCurrency;

      option.textContent = `${col1}${col2}`;
      option.value = `${entry.fromCurrency}:${entry.toCurrency}`;
      option.style.backgroundColor = idx % 2 === 0 ? "#ffffff" : "#f0f0f0";
      option.style.color = "#000"; // <- Make text visible


      list.appendChild(option);
    });

    console.log("📦 list.options.length:", list.options.length);

    if (buildBtn) {
      buildBtn.disabled = list.options.length === 0;
      console.log(`🔁 buildBtn.disabled = ${buildBtn.disabled}`);
    }

    if (deleteBtn) {
      deleteBtn.disabled = true;
      console.log("🛑 deleteBtn disabled");
    }

    list.addEventListener("change", () => {
      if (deleteBtn) {
        deleteBtn.disabled = list.selectedOptions.length === 0;
        console.log("🖱️ Change detected: deleteBtn.disabled =", deleteBtn.disabled);
      }

      if (buildBtn) {
        buildBtn.disabled = list.options.length === 0;
        console.log("🖱️ Change detected: buildBtn.disabled =", buildBtn.disabled);
      }
    });
  }

  (window as any).addFXMappings = function () {
    const fromSelect = document.getElementById("currencyList");
    const toSelect = document.getElementById("targetCurrency");
    const toCurrency = toSelect.value;

    Array.from(fromSelect.selectedOptions).forEach(option => {
      const fromCurrency = option.value.split(" - ")[0].trim();
      if (fromCurrency === toCurrency) return;
      if (!fxMappings.some(fx => fx.fromCurrency === fromCurrency && fx.toCurrency === toCurrency)) {
        fxMappings.push({ fromCurrency, toCurrency });
      }
    });

    renderFXTable();
  };

  (window as any).deleteFXMapping = function () {
    const select = document.getElementById("selectedCurrencyList") as HTMLSelectElement;
    const selected = Array.from(select.selectedOptions);

    selected.forEach(option => {
      const [from, to] = option.value.split(":");
      const index = fxMappings.findIndex(m => m.fromCurrency === from && m.toCurrency === to);
      if (index !== -1) {
        fxMappings.splice(index, 1);
      }
    });

    renderFXTable();
  };

  (window as any).submitFXRequest = async function () {
    let payload;

    // if (fxMappings.length === 0) {
    //   console.warn("⚠️ No mappings provided. Using mock default data.");
    //   payload = {
    //     getFXMarketRates: {
    //       fxMarketRateList: [
    //         { fromCurrency: "USD", toCurrency: "EUR", fxRate: "" },
    //         { fromCurrency: "GBP", toCurrency: "USD", fxRate: "" },
    //         { fromCurrency: "JPY", toCurrency: "INR", fxRate: "" }
    //       ]
    //     }
    //   };
    // } else {
    //   payload = {
    //     getFXMarketRates: {
    //       fxMarketRateList: fxMappings.map(item => ({
    //         fromCurrency: item.fromCurrency,
    //         toCurrency: item.toCurrency,
    //         fxRate: ""
    //       }))
    //     }
    //   };
    // }
    const response = await callRealFXApiWithProxy(fxMappings);
    if (
      response?.getFXMarketRatesResponse?.fxMarketRateList?.fxMarketRates) {
      const rates = response.getFXMarketRatesResponse.fxMarketRateList.fxMarketRates;
      Office.context.ui.messageParent(JSON.stringify({ type: "FX_RATES", data: rates }));
    } else {
      console.error("❌ Invalid API response shape:", response);
    }


    // mockFXApi(payload).then(res => {
    //   const rates = res.getFXMarketRatesResponse.fxMarketRateList.fxMarketRates;
    //   Office.context.ui.messageParent(JSON.stringify({ type: "FX_RATES", data: rates }));
    // });
  };

  
setTimeout(() => {
    if (typeof (window as any).submitFXRequest === "function") {
      registerRefresh(() => (window as any).submitFXRequest());
    }
  }, 0);

  window.closeFXDialog = function () {
    Office.context.ui.messageParent(JSON.stringify({ type: "CLOSE_DIALOG" }));
  };

  function mockFXApi(req: any): Promise<any> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          getFXMarketRatesResponse: {
            success: true,
            fxMarketRateList: {
              fxMarketRates: req.getFXMarketRates.fxMarketRateList.map(item => ({
                ...item,
                fxRate: (Math.random() * (75 - 0.5) + 0.5).toFixed(4)
              }))
            }
          }
        });
      }, 500);
    });
  }

  async function callRealFXApiWithProxy(fxMappings: { fromCurrency: string; toCurrency: string }[]) {
    const proxyUrl = "https://cors-anywhere.herokuapp.com/";
    const apiUrl = "https://apirequest.azure-api.net/REST_APIs/fxrate/getfxmarketrates";

    const payload = {
      getFXMarketRates: {
        fxMarketRateList: fxMappings.map(item => ({
          fromCurrency: item.fromCurrency,
          toCurrency: item.toCurrency,
          fxRate: ""
        }))
      }
    };

    try {
      const response = await fetch(proxyUrl + apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
          // Add API key header here if needed
          // "Ocp-Apim-Subscription-Key": "your-api-key"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`🌐 API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ FX API response:", data);
      return data;
    } catch (error) {
      console.error("❌ Error calling real FX API:", error);
      return null;
    }
  }


    if (addButton) addButton.onclick = addFXMappings;
  if (buildButton) buildButton.onclick = submitFXRequest;
  if (deleteButton) deleteButton.onclick = deleteFXMapping;

});
