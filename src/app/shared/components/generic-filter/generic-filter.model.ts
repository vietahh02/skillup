import {
    DataSourceFunction,
    SearchableSelectConfig,
    SelectableItem
} from "../generic-searchable-select/generic-searchable-select.model";

export interface FilterFieldConfig {
    type: 'text' | 'select' | 'select-searchable' | 'date' | 'dateRange' | 'number';
    key: string;
    label?: string;
    class?: string;
    placeholder?: string;
    options?: SelectableItem[];
    defaultValue?: any;
    dateConfig?: DateFilterConfig;
    searchableConfig?: SearchableSelectFilterConfig;
    icon?: string;
    visible?: boolean | ((item: any) => boolean);
    isTranslate?: boolean;
}

export interface DateFilterConfig {
    minDate?: Date;
    maxDate?: Date;
    dateClear?: boolean;
    dateFormat?: string;
    dateTimeFormat?: string;
}

export interface CustomButtonConfig {
    label: string;
    icon?: string;
    color?: string;
    backgroundColor?: string;
    textColor?: string;
    buttonType?: 'flat' | 'stroked' | 'raised';
    disabled?: boolean;
    key: string;
}

export interface FilterConfig {
    fields: FilterFieldConfig[];
    showApplyButton?: boolean;
    showClearButton?: boolean;
    applyButtonText?: string;
    clearButtonText?: string;
    applyButtonIcon?: string;
    classButton?: string;
    customButtons?: CustomButtonConfig[];
}

export interface FilterCriteria {
    [key: string]: any;
}

export interface SearchableSelectFilterConfig {
    dataSource: DataSourceFunction;
    config?: SearchableSelectConfig;
    multiple?: boolean;
    disabled?: boolean;
}
