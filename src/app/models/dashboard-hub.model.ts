export interface DashboardSummary {
    totalProfit: number;
    totalProfitChange: number;
    totalProfitChangePercent: number;
    activeProducts: number;
    lowStockCount: number;
}

export interface ProfitData {
    date: string;
    earnings: number;
    expectedEarnings?: number;
}

export interface InventoryItem {
    id: string;
    sku: string;
    name: string;
    currentStock: number;
    maxStock: number;
    dailySales: number;
    daysRemaining: number;
    stockPercent: number;
    status: 'critical' | 'low' | 'normal';
    supplierName?: string;
    supplierContact?: string;
    supplierPhone?: string;
}

export interface DashboardHubData {
    summary: DashboardSummary;
    profitData: ProfitData[];
    inventoryItems: InventoryItem[];
}

