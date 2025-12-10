export interface Balance {
    id?: string;
    date: string;
    openBalance: number;
    deposit: number;
    withdraw: number;
    consumption: number;
    refund: number;
    closeBalance: number;
    openBalanceStr?: string;
    depositStr?: string;
    withdrawStr?: string;
    consumptionStr?: string;
    refundStr?: string;
    closeBalanceStr?: string;
}

export interface BalancePageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface BalanceFilterCriteria {
    fromDate?: string | null;
    toDate?: string | null;
    keyword?: string | null;
    dateRange?: { start: Date | null; end: Date | null };
}

export interface BalancePagePayload {
    requestId: string;
    client: string;
    version: string;
    fromDate?: string | null;
    toDate?: string | null;
    keyword?: string | null;
    page: number;
    size: number;
    sort?: string;
}

export interface BalanceSummary {
    totalDeposit: number;
    totalConsumption: number;
    totalWithdraw: number;
    totalRefund: number;
    overallBalanceChange: number;
    startBalance?: number;
    endBalance?: number;
}

