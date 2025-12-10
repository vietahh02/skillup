import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { GenericSearchableSelectComponent } from '../generic-searchable-select/generic-searchable-select.component';
import { DataSourceFunction, SearchParams, SelectableItem, SearchableSelectConfig } from '../generic-searchable-select/generic-searchable-select.model';
import { ApiPartnerServices } from '../../../services/partner.service';
import { TranslatePipe } from '../../../utils/translate.pipe';

@Component({
  selector: 'partner-select',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GenericSearchableSelectComponent,

  ],
  templateUrl: './partner-select.component.html',
  styleUrls: ['./partner-select.component.scss']
})
export class PartnerSelectComponent implements OnInit {
  private partnerApi = inject(ApiPartnerServices);

  @Input() form?: FormGroup;
  @Input() nameControl?: string;
  @Input() value?: any;
  @Input() disabled: boolean = false;
  @Input() multiple: boolean = false;
  @Input() placeholder?: string;
  @Input() errorList?: Array<{ key: string; value: string }>;

  @Output() valueChange = new EventEmitter<any>();

  dataSource: DataSourceFunction;
  config: SearchableSelectConfig;

  constructor() {
    // Setup dataSource function
    this.dataSource = (params: SearchParams): Observable<SelectableItem[]> => {
      return this.partnerApi.getPartnerPage({
        page: params.page,
        size: params.size || 20,
        keyword: params.keyword
      }).pipe(
        map((response: any) => {
          const partners = response?.content || [];
          return partners.map((partner: any) => ({
            value: partner.partnerCode,
            displayName: partner.partnerCode
          }));
        })
      );
    };

    // Setup default config
    this.config = {
      placeholder: this.placeholder || 'system.product.selectPartner',
      searchPlaceholder: 'system.product.searchPartner',
      displayProperty: 'displayName',
      noResultsMessage: 'common.noData',
      loadingMessage: 'common.loading',
      pageSize: 20,
      debounceTime: 500,
      scrollThreshold: 60, // Load more when scrolled 60% down
      multiple: this.multiple
    };
  }

  ngOnInit() {
    // Update config if inputs change
    if (this.placeholder) {
      this.config.placeholder = this.placeholder;
    }
    if (this.multiple !== undefined) {
      this.config.multiple = this.multiple;
    }
  }

  onValueChange(value: any) {
    this.valueChange.emit(value);
  }
}

