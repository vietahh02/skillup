export interface Partner {
    id: number;
    partnerCode: string;
    partnerName: string;
    partnerType: string | null;
    partnerStatus: number;
    contactInfo: string | null;
    partnerStatusStr: string;
    phoneNumber: string;
    balance?: number | string;
    _disabled?: boolean;
    _enabled?: boolean;
}

export interface PartnerPageResponse<T> {}

export interface PartnerPagePayload {
    partnerId?: string | null;
    keyword?: string;
    partnerType?: string;
    partnerStatus?: string;
    page: number;
    size: number;
    sort?: string[];
}

export interface PartnerFilterCriteria {
    keyword?: string;
    partnerType?: string;
    partnerStatus?: string;
}

export interface CreateUpdatePartnerDto {
    request: any;
    files?: any[];
}

export interface CreateUpdatePartnerRequest {
    id?: string | number;
    partnerCode: string;
    partnerType: string;
    partnerName: string;
    cityId: number | string;
    townshipId: number | string;
    address: string;
    contactPhone: string;
    contactEmail: string;
    contactPerson: string;
    taxId?: string;
    notes?: string;
    contractNumber: string;
    phoneNumber?: string;
    contractStartDate?: string;
    contractEndDate?: string;
    requestId: string;
}

export interface PartnerDetail {
    id: string;
    partnerCode: string;
    partnerName: string;
    partnerType: string;
    cityId: string | null;
    townshipId: string | null;
    address: string;
    contactEmail: string;
    contactPhone: string;
    contactPerson: string;
    taxId: string;
    notes: string;
    contractNumber: string;
    contractStartDate: string | null;
    contractEndDate: string | null;
    partnerStatus: number;
    fileContractId: string;
    fileName: string | null;
    cityName: string | null;
    townshipName: string | null;
}
