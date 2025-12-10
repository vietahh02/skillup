import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { MatProgressBar } from "@angular/material/progress-bar";
import { MatTooltipModule } from '@angular/material/tooltip';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS } from '../../../utils/shared/constants/pagination.constants';
import { SequenceService } from '../../../services/sequence.service';
import { 
  TableConfig, 
  ColumnConfig, 
  ActionWithHandler,
  PaginationInfo, 
  TableAction, 
  StatusConfig 
} from './generic-table.model';
import { GenericPaginationComponent } from "../generic-pagination/generic-pagination.component";
import { TranslatePipe } from '../../../utils/translate.pipe';

@Component({
  selector: 'generic-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressBar,
    MatTooltipModule,
    GenericPaginationComponent,
    TranslatePipe
  ],
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss']
})
export class GenericTableComponent implements OnInit, OnChanges {
  // Input properties
  @Input() dataSource: any[] = [];
  @Input() config: TableConfig = { columns: [] };
  @Input() loading = false;
  @Input() statusConfig?: StatusConfig;
  
  // Pagination inputs
  @Input() totalItems = 0;
  @Input() currentPage = 1;
  @Input() pageSize = DEFAULT_PAGE_SIZE;
  @Input() totalPages = 1;
  @Input() pageSizeOptions: number[] = DEFAULT_PAGE_SIZE_OPTIONS;

  // Output events
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() statusToggle = new EventEmitter<{item: any, event: any}>();
  @Output() sortChange = new EventEmitter<{column: string, direction: 'asc' | 'desc' | ''}>();
  // Component properties
  displayedColumns: string[] = [];
  sortColumn = '';
  sortDirection: 'asc' | 'desc' | '' = '';
  totalActions = 0;

  constructor(
    private sequenceService: SequenceService
  ) {}

  ngOnInit() {
    this.setupColumns();
    this.countVisibleActions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['config']) {
      this.setupColumns();
      this.countVisibleActions();
    }
  }

  countVisibleActions() {
    this.totalActions = (this.config?.actions?.length || 0) + (this.config?.enableStatusToggle || this.config?.enableStatusToggle === undefined ? 1 : 0);
    
    // Gán vào CSS
    document.documentElement.style.setProperty(
      '--total-actions',
      this.totalActions.toString()
    );
  }
  

  private setupColumns() {
    this.displayedColumns = [];
    
    // Add sequence number column if enabled
    if (this.config.showSequenceNumber !== false) {
      this.displayedColumns.push('no');
    }
    
    // Add configured columns
    this.config.columns.forEach(column => {
      this.displayedColumns.push(column.key);
    });
    
    // Add actions column if there are actions or status toggle
    if (this.shouldShowActionsColumn()) {
      this.displayedColumns.push('actions');
    }
  }

  // Event handlers
  onActionClick(action: ActionWithHandler, item: any, event?: Event) {
    action?.handler?.(item, event);
  }

  onPageChangeClick(page: number) { 
    this.pageChange.emit(page); 
  }

  onPageSizeChangeSelect(size: number) { 
    this.pageSizeChange.emit(size); 
  }

  onStatusToggleChange(item: any, event: any) { 
    event.source.checked = !event.checked;
    this.statusToggle.emit({item: item, event: event});
  }

  onToggleChange(item: any, column: ColumnConfig, event: any) {
    if (column.actionHandler?.handler) {
      column.actionHandler.handler(item, event);
    }
  }

  onPaginatorChange(event: PageEvent) {
    if (event.pageSize !== this.pageSize) {
      this.onPageSizeChangeSelect(event.pageSize);
    } else {
      this.onPageChangeClick(event.pageIndex + 1);
    }
  }

  onSort(column: ColumnConfig) {
    if (!column.sortable) return;
    
    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 
                          this.sortDirection === 'desc' ? '' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }
    
    this.sortChange.emit({ 
      column: this.sortColumn, 
      direction: this.sortDirection 
    });
  }

  // Utility methods
  getSequenceNumber(index: number): number {
    return this.sequenceService.calculateSequenceNumber(this.currentPage, this.pageSize, index);
  }

  getColumnValueNormalized(item: any, column: ColumnConfig): any {
    return this.getNestedProperty(item, column.key);
  }

  getColumnValue(item: any, column: ColumnConfig): any {
    const value = this.getNestedProperty(item, column.key);
    
    // If value is string and longer than 30 characters, truncate it
    if (column.isTruncate && typeof value === 'string' && value.length > 25) {
      return value.substring(0, 20) + '...' + value.substring(value.length - 5);
    }
    
    return value;
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  getToggleValue(item: any, column: ColumnConfig): boolean {
    return this.getColumnValue(item, column);
  }

  shouldShowActionsColumn(): boolean {
    let hasActions = false;
      this.config.actions?.forEach(action => {
        if (typeof action.visible === 'function') {
          if (action.visible(action) !== false) {
            hasActions = true;
            return;
          }
        }else {
          if (action.visible !== false) {
            hasActions = true;
            return;
          }
        }
      });
    
    const hasStatusToggle = this.isStatusToggleVisible(this.config);
    
    return hasActions ? hasActions : false && hasStatusToggle;
  }

  isStatusToggleVisible(item: any): boolean {
    if (this.config.enableStatusToggle === false) return false;
    if (this.config.enableStatusToggle === undefined) return true;
    if (typeof this.config.enableStatusToggle === 'function') {
      return this.config.enableStatusToggle(item);
    }
    return this.config.enableStatusToggle === true;
  }

  isActionVisible(action: ActionWithHandler, item: any): boolean {
    if (action.visible === false) return false;
    if (action.visible === undefined) return true;
    if (typeof action.visible === 'function') {
      return action.visible(item);
    }
    return action.visible === true;
  }

  isActionDisabled(action: ActionWithHandler, item: any): boolean {
    if (action.disabled === true) return true;
    if (action.disabled === undefined) return false;
    if (typeof action.disabled === 'function') {
      return action.disabled(item);
    }
    return action.disabled === false ? false : true;
  }

  getCustomColor(item: any, column: ColumnConfig): string {
    if (!column.customColor) return '#000';
    
    const value = this.getColumnValue(item, column);
    const colorConfig = column.customColor.find(color => color.code === value);
    
    return colorConfig?.color || '#000';
  }

  trackByFn = (index: number, item: any): any => {
    return item.id || item.roleCode || item.userCode || index;
  }
}
