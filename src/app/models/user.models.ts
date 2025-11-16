export interface UserInfo {
    userId: number;
    fullName: string;
    email: string;
    roles: string[];
    avatarUrl?: string;
}

export interface UserAdmin {
    userId: number;
    fullName: string;
    email: string;
    roles: string[];
    avatar?: string;
    createdAt?: string;
    active?: boolean;
}

export interface UserDetail {
  userId: number;
  fullName: string;
  email: string;
  avatarUrl: string;
  phone: string;
  location: string;
  dateOfBirth: string;
  gender: string;
  level: string;
  active: boolean;
  createdAt: string;
  roles: string[];
}

export interface PaginatedResponse<T> {
    page: number;
    pageSize: number;
    total: number;
    items: T[];
}

export interface UserManager {
    userId: number;
    fullName: string;
    email: string;
    avatarUrl: string;
    phone: string;
    location: string;
    dateOfBirth: string; // ISO datetime string
    gender: string;
    level: string;
    active: boolean;
    createdAt: string; // ISO datetime string
    roles: string[];
}