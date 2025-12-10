import { Observable } from 'rxjs';

export interface SelectableItem {
  value: any;
  displayName: string;
  translate?: boolean;
  handleItem?: (item?: any) => any;
  [key: string]: any;
}

export interface SearchableSelectConfig {
  placeholder?: string;
  searchPlaceholder?: string;
  displayProperty?: keyof SelectableItem;
  noResultsMessage?: string;
  loadingMessage?: string;
  pageSize?: number;
  debounceTime?: number;
  multiple?: boolean;
  scrollThreshold?: number; // Percentage (0-100) to trigger load more, default 60
}

export interface SearchParams {
  page: number;
  size: number;
  keyword?: string;
}

export interface errorOption {
  key: string;
  value: string;
}

export interface DataSourceFunction {
  (params: SearchParams): Observable<SelectableItem[]>;
}

