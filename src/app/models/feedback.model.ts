export interface Feedback {
    feedbackId: number;
    userId: number;
    userName: string;
    courseId: number;
    courseName: string;
    userAvatarUrl: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    comments: FeedbackComment[];
  }
  
  export interface FeedbackComment {
    commentId: number;
    feedbackId: number;
    userId: number;
    userName: string;
    userAvatarUrl: string;
    commentText: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
  }
