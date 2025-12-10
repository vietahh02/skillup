export interface Stock {
  id: string;
  partnerId: string;
  partnerName: string;
  balance: number;
  holdingBalance: number;
  stockType: string;
  createdAt: string;
  lastUpdatedAt: string;
  status: string;
}

export interface StockPageResponse<T> {}

export interface StockPagePayload {
  keyword?: string;
  partnerId?: string | null;
  page?: number;
  size?: number;              
  sort?: string[];           
}

export interface StockFilterCriteria {
  keyword?: string;
  partnerId?: string | null;
}

export interface StockCreateUpdatePayload {
  stockType: string;
  partnerId: number | string;
  partnerName?: string;
}