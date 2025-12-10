export interface User {
    id: string;
    username: string;
    latestLogTime: string;
    latestIps: string;
    lastActivity:string;
    roleNames: string;
    enabled: boolean;
    status: string;
    partnerName: string;
    email: string;
    phoneNumber: string;
    _enabled?: boolean;
    _disabled?: boolean;
}

export interface UserPageResponse<T> {}

export interface UserPagePayload {
  keyword?: string;          
  partnerId?: number | string;  
  isEnabled?: string;
  isHub?: boolean;
  page: number;              
  size: number;              
  sort?: string[];           
}

export interface UserFilterCriteria {
  keyword?: string;
  partnerId?: number | string | boolean;
  isEnabled?: string;
  isHub?: boolean;
}

export interface CreateUserDto {
  requestId?: number | string;
  fullName: string;
  phoneNumber: string;
  username: string;
  email: string;
  roleIds: number[] | string[];
  language: string;
}

export interface UserDetail {
  id: string;
  username: string;
  email: string;
  roles: {id: number, roleName: string, roleCode: string}[];
  language: string;
}