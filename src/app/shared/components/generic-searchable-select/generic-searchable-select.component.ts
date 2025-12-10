import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule, MatSelect } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, debounceTime, distinctUntilChanged, finalize, takeUntil, fromEvent, throttleTime } from 'rxjs';
import { 
  SelectableItem, 
  SearchableSelectConfig, 
  DataSourceFunction, 
  SearchParams,
  errorOption
} from './generic-searchable-select.model';
import { TranslatePipe } from '../../../utils/translate.pipe';
import { LanguageService } from '../../../services/language.service';
import { inject } from '@angular/core';

@Component({
  selector: 'generic-searchable-select',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    TranslatePipe
  ],
  templateUrl: './generic-searchable-select.component.html',
  styleUrls: ['./generic-searchable-select.component.scss']
})
export class GenericSearchableSelectComponent implements OnInit, OnDestroy, OnChanges  {
  private languageService = inject(LanguageService);
  
  @ViewChild('selectRef', { static: false }) selectRef?: MatSelect;
  @ViewChild('selectRefStandalone', { static: false }) selectRefStandalone?: MatSelect;
  
  @Input() nameControl!: string;
  @Input() form?: FormGroup;
  @Input() errorList!: errorOption[];
  @Input() config: SearchableSelectConfig = {};
  @Input() dataSource!: DataSourceFunction;
  @Input() disabled: boolean = false;
  @Input() multiple: boolean = false;
  @Input() initialOptions: SelectableItem[] = [];
  @Input() options: SelectableItem[] = [];
  @Input() value: any;
  
  @Output() valueChange = new EventEmitter<any>();

  private defaultConfig: SearchableSelectConfig = {
    placeholder: 'Select items',
    searchPlaceholder: 'Search items...',
    displayProperty: 'displayName',
    noResultsMessage: 'No items found',
    loadingMessage: 'Loading...',
    pageSize: 30,
    debounceTime: 500,
    scrollThreshold: 60 // Load more when scrolled 60% down
  };

  // options: SelectableItem[] = [];
  searchTerm = '';
  search$ = new Subject<string>();
  loading = false;
  page = 0;
  hasMore = true;
  hasLoadedFromAPI = false;
  private destroy$ = new Subject<void>();

  internalValue: number[] = [];

  ngOnInit() {
    if (!this.dataSource) {
      console.error('SearchableMultiselectComponent: dataSource is required');
      return;
    }
    this.setupSearch();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] && changes['value'].currentValue !== undefined) {
      this.internalValue = changes['value'].currentValue;
    }
    
    // if (changes['initialOptions']) {
    //   console.log(this.initialOptions.length,this.initialOptions, this.options.length, this.options);
    //   this.options = this.initialOptions.concat(this.options);
    //   console.log(this.options.length);
    //   this.page = 0;
    //   this.hasMore = true;
    //   this.hasLoadedFromAPI = false;
    // }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get mergedConfig(): SearchableSelectConfig {
    return { ...this.defaultConfig, ...this.config } as SearchableSelectConfig;
  }

  onValueChange(value: any) {
    if (!this.form) {
      this.internalValue = value;
    }
    this.valueChange.emit(value);
  }

  private setupSearch() {
    this.search$.pipe(
      debounceTime(this.mergedConfig.debounceTime || 500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(keyword => {
      this.searchTerm = keyword;
      this.hasLoadedFromAPI = false;
      this.resetAndLoad();
    });
  }

  onPanelOpen(opened: boolean) {
    if (opened) {
      if (!this.hasLoadedFromAPI) {
        this.resetAndLoad();
      }
      setTimeout(() => this.bindPanelScroll(), 0);
    }
  }

  onSearch(keyword: string) {
    this.search$.next(keyword);
  }

  private resetAndLoad() {
    const selectedItems = this.getSelectedItems();
    const initialItems = [...this.initialOptions];
    
    const existingIds = new Set(initialItems.map(item => item.value));
    const uniqueSelectedItems = selectedItems.filter(item => !existingIds.has(item.value));
    
    this.options = [...initialItems, ...uniqueSelectedItems];
    this.page = 0;
    this.hasMore = true;
    this.load();
  }

  private load() {
    if (!this.hasMore || this.loading) return;
    
    this.loading = true;
    
    const params: SearchParams = {
      page: this.page,
      size: this.mergedConfig.pageSize || 20,
    };
    
    if (this.searchTerm && this.searchTerm.trim()) {
      params.keyword = this.searchTerm.trim();
    }

    this.dataSource(params)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (items: SelectableItem[]) => {
          const existingIds = new Set(this.options.map(item => item.value));
          const newItems = items.filter(item => !existingIds.has(item.value));
          
          this.options = [...this.options, ...newItems];
          this.hasMore = items.length === this.mergedConfig.pageSize;
          if (this.hasMore) {
            this.page += 1;
          }
          
          this.hasLoadedFromAPI = true;
          
          const currentSelect = this.form ? this.selectRef : this.selectRefStandalone;
          if (currentSelect?.panelOpen) {
            setTimeout(() => this.bindPanelScroll(), 0);
          }
        },
        error: (error) => {
          this.hasMore = false;
          const selectedItems = this.getSelectedItems();
          const initialItems = [...this.initialOptions];
          
          const existingIds = new Set(initialItems.map(item => item.value));
          const uniqueSelectedItems = selectedItems.filter(item => !existingIds.has(item.value));
          
          this.options = [...initialItems, ...uniqueSelectedItems];
        }
      });
  }

  private bindPanelScroll() {
    const currentSelect = this.form ? this.selectRef : this.selectRefStandalone;
    const panelEl = currentSelect?.panel?.nativeElement as HTMLElement | undefined;
    if (!panelEl) return;

    const scrollThreshold = this.mergedConfig.scrollThreshold || 60;
    const thresholdPixels = (panelEl.scrollHeight * scrollThreshold) / 100;

    fromEvent(panelEl, 'scroll')
      .pipe(throttleTime(150), takeUntil(this.destroy$))
      .subscribe(() => {
        const scrollPosition = panelEl.scrollTop + panelEl.clientHeight;
        if (scrollPosition >= thresholdPixels) {
          this.load();
        }
      });
  }

  getDisplayText(item: SelectableItem): string {
    const displayProp = this.mergedConfig.displayProperty;
    return String(item[displayProp as keyof SelectableItem] || '') as string;
  }

  getPlaceholder(): string {
    const placeholder = this.mergedConfig.placeholder || 'Select items';
    return this.languageService.translate(placeholder);
  }

  getSearchPlaceholder(): string {
    const searchPlaceholder = this.mergedConfig.searchPlaceholder || 'Search items...';
    return this.languageService.translate(searchPlaceholder);
  }

  getNoResultsMessage(): string {
    const message = this.mergedConfig.noResultsMessage || 'No items found';
    return this.languageService.translate(message);
  }

  getLoadingMessage(): string {
    const message = this.mergedConfig.loadingMessage || 'Loading...';
    return this.languageService.translate(message);
  }

  private getSelectedItems(): SelectableItem[] {
    let selectedValues: any[] = [];
    
    if (this.form && this.nameControl) {
      const control = this.form.get(this.nameControl);
      selectedValues = control?.value || [];
    } else {
      selectedValues = this.internalValue || [];
    }

    if (!Array.isArray(selectedValues)) {
      selectedValues = selectedValues ? [selectedValues] : [];
    }

    return this.options.filter(item => selectedValues.includes(item.value));
  }
}
