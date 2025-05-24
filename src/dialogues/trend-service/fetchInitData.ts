export async function fetchInitData(): Promise<NOAAData[]> {
  const proxyUrl = "https://cors-anywhere.herokuapp.com/";
  const url = `${proxyUrl}https://apirequest.azure-api.net/REST_APIs/Logon&Logoff/Initialize/GetInitData`;

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({ getInitData: { request: "" } }),
    headers: { "Content-Type": "application/json" },
  });

  const result = await response.json();
  return result.getInitDataResponse.initData.accountInfoList as NOAAData[];
}
interface NOAAData {
  accountName: string;
  accountNumber: string;
  currency: string;
}
