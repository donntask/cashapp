export interface UserData {
  firstName: string;
  lastName: string;
  cashtag: string;
  phoneNumber: string;
  email: string;
  zipCode: string;
}

export interface BankAccount {
  lastFourDigits: string;
  bankName: string;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'withdraw' | 'deposit';
  amount: number;
  recipient: string;
  note: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

export interface AppData {
  user: UserData | null;
  cashBalance: number;
  savingsBalance: number;
  bankAccount: BankAccount | null;
  transactions: Transaction[];
  lastUpdated: number;
}

export const DEFAULT_APP_DATA: AppData = {
  user: null,
  cashBalance: 0,
  savingsBalance: 0,
  bankAccount: null,
  transactions: [],
  lastUpdated: Date.now(),
};
