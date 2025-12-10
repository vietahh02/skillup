export interface Profile {
    language: string;
    fullName: string;
    email: string;
    partnerName: string | null;
    phoneNumber: string | null;
    avatarUrl: string | null;
    roleNames: string[] | null;
}

export interface ProfileUpdateDto {
    file?: File;
    request: string;
}