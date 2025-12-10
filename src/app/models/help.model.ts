export interface Help {
    id: string;
  createdAt: string;     // hoặc Date
  updatedAt: string;     // hoặc Date
  createdBy: string;
  deleted: boolean;
  code: string;
  title: string;
  contentMd: string;
  contentHtml: string;
}

export interface HelpPagePayload {
  keyword?: string;
}

export interface HelpFilterCriteria {
  keyword?: string;
}

export interface HelpPageResponse<T> {
  data: T[];
  total: number;
}

export interface HelpDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  deleted: boolean;
  code: string;
  title: string;
  contentMd: string;
  contentHtml: string;
}

export interface CreateUpdateHelpPayload {
  code: string;
  title: string;
  contentMd: string;
  contentHtml: string;
}
