export interface AccountList {
  accountName: string;
  accountNumber: string;
  currency: string;
}

export interface CanCreatePayment {
  canCreateCHECKDRAFTPaymentFromTemplate: boolean;
  paymentUser: boolean;
  tspada: boolean;
  canCreateATRPaymentFromTemplate: boolean;
  canCreateGIROPaymentFromTemplate: boolean;
  canCreateATPaymentFromTemplate: boolean;
  canCreateReceiptsFromTemplate: boolean;
  canCreatePaymentsFromTemplate: boolean;
  canCreateFreeFormReceipts: boolean;
  canCreateFreeFormPayments: boolean;
  canCreateBOOKPaymentFromTemplate: boolean;
  canCreateWIREPaymentFromTemplate: boolean;
  canCreateDRAWDOWNPaymentFromTemplate: boolean;
}

export interface UserAuthorized {
  isAuthorized: boolean;
  userid: string;
}

export interface PaymentTemplate {}

export interface CashPositionResponse {}

export interface Transactions {
  code: string;
  description: string;
  transactionsType: string;
}

export interface Currency {
  currency: string;
}

export interface PaymentMethod {
  code: string;
  description: string;
  methodType: number;
}

export interface Reminders {
  accountNumber: string;
  threshold: string;
  action: string;
  template: string;
  from: string;
  to: string;
}

export interface accountData {
  accountName: string;
  accountNumber: string;
  currency: string;
}
