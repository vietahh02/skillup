export interface Role {
  id: number | string;
  enabled: boolean;
  status?: string;
  roleName: string;
  roleCode: string;
  enabledInt: number;
  permissionCount: number;
  pageSettingCount: number;
  permissions?: string;
  partnerName?: string;
  _enabled?: boolean;
  _disabled?: boolean;
}

export interface RolePageResponse<T> {}

export interface RolePagePayload {
  keyword?: string;
  partnerId?: number | string;
  isEnabled?: string | number;
  isHub?: boolean;
  page: number;
  size: number;              
  sort?: string[];           
}

export interface RoleFilterCriteria {
  keyword?: string;
  partnerId?: number | string | boolean;
  isEnabled?: string | number;
  isHub?: boolean;
}

export interface CreateRoleDto {
  roleCode: string;
  roleName: string;
  permissionIds: string[];
  pageSettingIds: string[];
}

export interface RoleDetail {
  id: string;
  roleCode: string;
  roleName: string;
  permissions: PermissionRoleDetail[];
  pageSettings: PageSettingRoleDetail[];
  enabled: boolean;
}

export interface PermissionRoleDetail {
  id: string;
  permissionName: string;
  permissionCode: string;
  enabled: boolean;
}

export interface PageSettingRoleDetail {
  id: string;
  pageName: string;
  path: string;
  parentId: string | null;
  orders: number;
}
