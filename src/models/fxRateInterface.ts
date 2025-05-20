export type FXMapping = {
  fromCurrency: string;
  toCurrency: string;
};
export interface FXMappingResponse {
  fromCurrency: string;
  toCurrency: string;
  fxRate: string; 
}
