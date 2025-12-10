export interface DocumentModel {
    documentId: number;
    courseId: number;
    courseName: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileSizeFormatted: string;
    fileUrl: string;
    publicId: string;
    createdBy: number;
    createdByName: string;
    createdAt: string;
    updatedAt?: string | null;
  }
  