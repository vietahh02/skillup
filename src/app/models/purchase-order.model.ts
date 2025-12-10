export interface PurchaseOrder {
    id: string;
    orderId?: string | null;
    partnerId?: string | number;
    partnerName?: string;
    partnerCode?: string;
    requestType?: string;
    transactionType?: string;
    transactionTypeStr?: string;
    stockId?: string;
    createdAt?: string;
    updatedAt?: string;
    date?: string;
    amount?: number;
    totalAmount?: number;
    discount?: number;
    amountStr?: string;
    status?: number | string;
    statusStr?: string;
    createdBy?: string;
    approvedBy?: string;
    bankName?: string;
    bankAccount?: string;
    bankTransactionId?: string;
    bankCode?: string;
    paymentType?: string;
    note?: string;
    file?: string;
    _disabled?: boolean;
    _enabled?: boolean;
}

export interface PurchaseOrderPageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface PurchaseOrderPagePayload {
    requestId: string;
    client: string;
    version: string;
    partnerId?: string | null;
    signature?: string;
    status?: number | null;
    requestType?: string | null;
    fromDate?: string | null;
    toDate?: string | null;
    id?: string | null;
    page?: number;
    size?: number;
    sort?: string;
}

export interface PurchaseOrderFilterCriteria {
    keyword?: string;
    partnerId?: number | string;
    status?: string;
    transactionType?: string;
    dateRange?: {
        start?: Date | string;
        end?: Date | string;
    };
    startDate?: Date | string;
    endDate?: Date | string;
}

