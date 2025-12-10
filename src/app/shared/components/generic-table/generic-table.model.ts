export interface ColumnConfig {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  template?: 'text' | 'pill' | 'actions' | 'toggle' | 'custom';
  cellClass?: string;
  headerClass?: string;
  customValue?: (item?: any) => any;
  customColor?: {code : any, color: string}[];
  actionHandler?: ActionWithHandler;
  isTranslate?: boolean;
  isTruncate?: boolean;
}

export interface ActionWithHandler {
  type: string;
  label?: string;
  icon?: string;
  tooltip?: string;
  color?: string;
  visible?: boolean | ((item?: any) => boolean);
  disabled?: boolean | ((item?: any) => boolean);
  permission?: string;
  handler: (item?: any, event?: Event) => void;
}

export interface TableConfig {
  columns: ColumnConfig[];
  actions?: ActionWithHandler[];
  showAddButton?: boolean;
  addButtonLabel?: string;
  addButtonIcon?: string;
  enablePagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  showSearch?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  title?: string;
  showSequenceNumber?: boolean;
  enableStatusToggle?: boolean | ((item?: any) => boolean);
  loadingMessage?: string;
    rowClass?: (item: any) => string;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface TableAction {
  type: string;
  data: any;
  event?: Event;
}

export interface StatusConfig {
  activeValue: any;
  inactiveValue: any;
  activeLabel?: string;
  inactiveLabel?: string;
  activeClass?: string;
  inactiveClass?: string;
}
