export interface UserMeInfo {
    userId: number;
    fullName: string;
    email: string;
    roles: string[];
    avatar?: string;
}

export interface UserProfile {
    userId: number;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    phone: string;
    location: string;
    dateOfBirth: string;
    gender: string;
    level: string;
    active: boolean;
    createdAt: string;
    roles: string[];
}

