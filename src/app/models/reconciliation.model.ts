export interface Reconciliation {
    id?: string;
    partnerId?: string;
    partnerCode?: string;
    partnerName?: string;
    filename?: string;
    date?: string;
    transCount?: number;
    totalAmount?: number;
    totalAmountStr?: string;
    status?: number | string;
    statusStr?: string;
    result?: string;
    passedCount?: number;
    failCount?: number;
    missedCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ReconciliationPageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface ReconciliationFilterCriteria {
    partnerId?: string | null;
    date?: string | Date | null;
    keyword?: string | null;
}

export interface ReconciliationPagePayload {
    requestId: string;
    client: string;
    version: string;
    partnerId?: string | null;
    date?: string | null;
    keyword?: string | null;
    page: number;
    size: number;
    sort?: string;
}

