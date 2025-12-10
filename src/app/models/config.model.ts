
export interface PageSetting {
    id: number;
    orders: number;
    pageName: string;
    path: string;
    enabled: boolean;
    _enabled?: boolean;
}

export interface ActionSetting {
    id: number;
    actionId: string;
    permissionCode?: string;
    permissionName?: string;
    resourceName?:string;
    name: string;
    isEnabled: boolean;
    isOtpRequired: boolean;
    approvalSetting: string;
}

export interface ConfigPagePayload {
    page: number;
    size: number;
}

export interface ActionSettingUpdate {
    permissionId: string | number;
    optRequired: boolean;
    enabled: boolean;
}

export interface PageSettingUpdate {
    pageSettingIds: string | number[];
}

export interface DocumentTemplate {
    id: number;
    key: string;
    type: string;
    title: string;
}

export interface DocumentFilterCriteria {
    keyword?: string;
}