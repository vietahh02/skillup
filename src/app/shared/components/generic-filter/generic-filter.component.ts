import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {CustomButtonConfig, FilterConfig, FilterCriteria, FilterFieldConfig} from './generic-filter.model';
import {TranslatePipe} from '../../../utils/translate.pipe';
import {GenericSearchableSelectComponent} from "../generic-searchable-select/generic-searchable-select.component";

@Component({
  selector: 'generic-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslatePipe,
    GenericSearchableSelectComponent
],
  templateUrl: './generic-filter.component.html',
  styleUrls: ['./generic-filter.component.scss']
})
export class GenericFilterComponent implements OnInit, OnChanges {
  @Input() config!: FilterConfig;
  @Input() isSearchLoading = false;
  @Input() initialValues?: FilterCriteria;

  @Output() applyFilters = new EventEmitter<FilterCriteria>();
  @Output() clearFilters = new EventEmitter<void>();
    @Output() customButtonClick = new EventEmitter<string>();

  filterValues: FilterCriteria = {};
  visibleFields: boolean = true;

  constructor() {}

  ngOnInit() {
    this.initializeValues();
    this.setupVisibleFields();
  }

  setupVisibleFields() {
    let visibleFields = false;
    this.config?.fields?.forEach(field => {
      if (typeof field.visible === 'function') {
        if (field.visible(this.filterValues) === false) return;
        visibleFields = field.visible(this.filterValues);
      } else {
        if (field.visible === false) return;
        visibleFields = true;
      }
    });
    this.visibleFields = visibleFields;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['config'] || changes['initialValues']) {
      this.initializeValues();
    }
  }

  private initializeValues() {
    this.filterValues = {};

    // Initialize with initial values if provided
    if (this.initialValues) {
      this.filterValues = { ...this.initialValues };

      // Handle dateRange fields - split object into start/end
      this.config?.fields?.forEach(field => {
        if (field.type === 'dateRange' && this.filterValues[field.key] && typeof this.filterValues[field.key] === 'object') {
          this.filterValues[field.key + 'Start'] = this.filterValues[field.key].start;
          this.filterValues[field.key + 'End'] = this.filterValues[field.key].end;
        }
      });
    }

    // Set default values for fields
    this.config?.fields?.forEach(field => {
      if (this.filterValues[field.key] === undefined) {
        if (field.defaultValue !== undefined) {
          this.filterValues[field.key] = field.defaultValue;
          if (field.type === 'dateRange' && typeof field.defaultValue === 'object') {
            this.filterValues[field.key + 'Start'] = field.defaultValue.start;
            this.filterValues[field.key + 'End'] = field.defaultValue.end;
          }
        } else if (field.type === 'select' && field.options?.length) {
          // Set first option as default for select fields
          this.filterValues[field.key] = field.options[0].value;
        } else if (field.type === 'dateRange') {
          this.filterValues[field.key] = { start: '', end: '' };
          this.filterValues[field.key + 'Start'] = '';
          this.filterValues[field.key + 'End'] = '';
        } else {
          this.filterValues[field.key] = '';
        }
      }
    });
  }

  onFieldChange(fieldKey: string, value: any) {
    this.filterValues[fieldKey] = value;
  }

  onApplyFilters() {
    const filters: FilterCriteria = {};

    // Only include non-empty values
    Object.keys(this.filterValues).forEach(key => {
      const value = this.filterValues[key];

      // Skip dateRange start/end keys - they will be handled separately
      if (key.endsWith('Start') || key.endsWith('End')) {
        return;
      }

      if (value !== '' && value !== null && value !== undefined) {
        // For text fields, trim whitespace
        const field = this.config.fields?.find(f => f.key === key);
        if (field?.type === 'text') {
          const trimmedValue = typeof value === 'string' ? value.trim() : value;
          if (trimmedValue) {
            filters[key] = trimmedValue;
          }
        } else if (field?.type === 'dateRange') {
          // For dateRange, combine start and end
          const startValue = this.filterValues[key + 'Start'];
          const endValue = this.filterValues[key + 'End'];
          if (startValue || endValue) {
            filters[key] = {
              start: startValue || null,
              end: endValue || null
            };
          }
        } else {
          filters[key] = value;
        }
      }
    });

    this.applyFilters.emit(filters);
  }

  onClearFilters() {
    this.initializeValues();
    this.clearFilters.emit();
    this.onApplyFilters();
  }

  getFieldValue(fieldKey: string): any {
    return this.filterValues[fieldKey] || '';
  }

  getColumnClass(field: FilterFieldConfig): string {
    return field.class || 'col-md-3';
  }

  getPlaceholder(field: FilterFieldConfig): string {
    return field.placeholder || '';
  }

  getButtonClass(): string {
    return this.config?.classButton || 'col-md-3';
  }

  shouldShowApplyButton(): boolean {
    return this.config?.showApplyButton !== false;
  }

  shouldShowClearButton(): boolean {
    return this.config?.showClearButton !== false;
  }

  getApplyButtonText(): string {
    return this.config?.applyButtonText || 'common.apply';
  }

  getClearButtonText(): string {
    return this.config?.clearButtonText || 'common.clear';
  }

  getApplyButtonIcon(): string {
    return this.config?.applyButtonIcon || 'filter_list';
  }

  getSearchableSelectConfig(field: FilterFieldConfig): any {
    const baseConfig = field.searchableConfig?.config || {};

    // Merge với placeholder từ field nếu không có trong config
    const mergedConfig = {
      placeholder: field.placeholder || baseConfig.placeholder || 'Chọn...',
      searchPlaceholder: baseConfig.searchPlaceholder || 'Tìm kiếm...',
      noResultsMessage: baseConfig.noResultsMessage || 'Không tìm thấy kết quả',
      loadingMessage: baseConfig.loadingMessage || 'Đang tải...',
      ...baseConfig
    };

    return mergedConfig;
  }

  onDateRangeChange(fieldKey: string, type: 'start' | 'end', value: any) {
    const startKey = fieldKey + 'Start';
    const endKey = fieldKey + 'End';

    if (type === 'start') {
      this.filterValues[startKey] = value;
    } else {
      this.filterValues[endKey] = value;
    }

    if (this.filterValues[startKey] || this.filterValues[endKey]) {
      this.onFieldChange(fieldKey, {
        start: this.filterValues[startKey],
        end: this.filterValues[endKey]
      });
    }
  }

  getDateRangeStart(fieldKey: string): any {
    return this.filterValues[fieldKey + 'Start'] || this.filterValues[fieldKey]?.start || '';
  }

  getDateRangeEnd(fieldKey: string): any {
    return this.filterValues[fieldKey + 'End'] || this.filterValues[fieldKey]?.end || '';
  }

  isFieldVisible(field: FilterFieldConfig): boolean {
    if (field.visible === false) return false;
    if (field.visible === undefined) return true;
    if (typeof field.visible === 'function') {
      return field.visible(this.filterValues);
    }
    return field.visible === true;
  }

    onCustomButtonClick(buttonKey: string) {
        this.customButtonClick.emit(buttonKey);
    }

    hasCustomButtons(): boolean {
        return !!(this.config?.customButtons && this.config.customButtons.length > 0);
    }

    getCustomButtons(): CustomButtonConfig[] {
        return this.config?.customButtons || [];
    }
}
