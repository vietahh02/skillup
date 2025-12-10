export interface Document {
    requestId: string;
    client: string;
    version: string;
    keyword: string;
    id: string;
    code: string;
    type: string;
    description: string;
    language: string;
    title: string;
    content: string;
}

export interface DocumentPageResponse<T> {}

export interface DocumentPagePayload {
    keyword?: string;
    page: number;
    size: number;
    sort?: string[];
}

export interface DocumentFilterCriteria {
    keyword?: string;
}

export interface CreateUpdateDocumentDto {
    id?: string;
    requestId: string;
    code: string;
    type: string;
    language: string;
    title: string;
    content: string;
}

export interface DocumentDetail {
    id: string;
    code: string;
    type: string;
    language: string;
    title: string;
    content: string;
}

export interface SendMail {
    requestId: string;
    code: string;
    type: string;
    language: string;
    title: string;
    content: string;
    to: string;
}

export enum NotificationType {
    NOTIFICATION_NEW_PASSWORD = 'NOTIFICATION_NEW_PASSWORD',
    WELCOME_USER = 'WELCOME_USER',
    USER_RECOVERY_PASS = 'USER_RECOVERY_PASS',
    NOTIFICATION_CHANGED_PASS = 'NOTIFICATION_CHANGED_PASS',
}

export function formatEnumName(value: string): string {
    return value
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getNotificationOptions() {
    return Object.values(NotificationType).map(value => ({
      value: value,
      label: value
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase())
    }));
}
  