export interface Transaction {
    id: string;
    transId?: string;
    refPartnerTransId?: string;
    receiver?: string;
    amount?: number;
    amountStr?: string;
    product?: string;
    productName?: string;
    date?: string;
    createdAt?: string;
    updatedAt?: string;
    status?: number | string;
    statusStr?: string;
    partnerId?: string | number;
    partnerName?: string;
    partnerCode?: string;
    requestType?: string;
    transactionType?: string;
    createdBy?: string;
    _disabled?: boolean;
    _enabled?: boolean;
}

export interface TransactionPageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface TransactionPagePayload {
    requestId: string;
    client: string;
    version: string;
    partnerId?: string | null;
    signature?: string;
    status?: number | null;
    productId?: string | null;
    keyword?: string | null;
    fromDate?: string | null;
    toDate?: string | null;
    page?: number;
    size?: number;
    sort?: string;
}

export interface TransactionFilterCriteria {
    partnerId?: string | null;
    status?: number | null;
    productId?: string | null;
    keyword?: string | null;
    fromDate?: string | null;
    toDate?: string | null;
}

