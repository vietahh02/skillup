export interface Product {
  productId: number;
  productCode: string;
  productName: string;
  productDescription: string;
  status: number;
  statusName: string;
  _enabled?: boolean;
  _disabled?: boolean;
} 

export interface ProductPageResponse<T> {}

export interface ProductPagePayload {
  keyword?: string;
  status?: number | string;          
  page: number;              
  size: number;              
  sort?: string[];           
}

export interface ProductFilterCriteria {
  keyword?: string;
  status?: number | string;
}

export interface CreateUpdateProductPayload {
  productCode: string;
  productName: string;
  productType: string;
  description: string;
  unit: string;
  requestId: string;
}

export interface ProductDetail {
  productId: string;
  productCode: string;
  productName: string;
  productType: string;
  description: string;
  unit: string;
  serviceId: string;
  priceTag: string;
  requestId: string;
  status?: number;
}

export interface ProductACL {
  id: number;
  partnerCode: string;
  serviceId: string;
  status: number;
  statusName?: string;
}

export interface ProductPolicy {
  policyId: number;
  policyName: string;
  policyDescription: string;
  partnerId: string;
  partnerLevel: number;
  productId: string;
  currency: string;
  price: number;
  unit: string;
  status: number;
  validFrom: string;
  validTo: string;
  // Mapped fields for display
  id?: number;
  name?: string;
  partner?: string;
  transactionFee?: number;
  discount?: number;
  commission?: number;
  effectedDate?: string;
  endDate?: string;
  statusName?: string;
  _disabled?: boolean;
}

export interface ProductACLPagePayload {
  productId: string;
  partnerCode?: string;
  page: number;
  size: number;
}

export interface ProductPolicyPagePayload {
  productId?: string;
  partnerId?: string;
  partnerCode?: string;
  status?: number;
  page: number;
  size: number;
}



