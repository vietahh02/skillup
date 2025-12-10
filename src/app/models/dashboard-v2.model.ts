export interface RevenueData {
    date: string;
    actualAmount: number;
    expectedAmount: number;
}

export interface WalletBalance {
    currentBalance: number;
    pendingRequests: PendingRequest[];
    totalPendingAmount: number;
    status: 'normal' | 'warning' | 'danger';
    requiredTopUp?: number;
}

export interface PendingRequest {
    id: string;
    orderId: string;
    amount: number;
    requestType: 'DEPOSIT' | 'WITHDRAW';
    createdAt: string;
    status: string;
}

export interface DashboardV2Data {
    revenueData: RevenueData[];
    walletBalance: WalletBalance;
    filterType: 'day' | 'week' | 'month';
}

export interface RevenueChartPayload {
    requestId: string;
    client: string;
    version: string;
    filterType: 'day' | 'week' | 'month';
    fromDate?: string;
    toDate?: string;
}

