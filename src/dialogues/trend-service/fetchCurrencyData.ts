export async function fetchCurrencyData(): Promise<CurrencyData[]> {
  const proxyUrl = "https://cors-anywhere.herokuapp.com/";
  const url = `${proxyUrl}https://apirequest.azure-api.net/REST_APIs/Masterdata/GetAllAvailableCurrencies`;

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({ getAllAvailableCurrencies: { request: "" } }),
    headers: { "Content-Type": "application/json" },
  });

  const result = await response.json();
  return result.getAllAvailableCurrenciesResponse.currencyList as CurrencyData[];
}
interface CurrencyData {
  currency: string;
}
