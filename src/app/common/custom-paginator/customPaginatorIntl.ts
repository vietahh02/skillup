import { Injectable, OnDestroy } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';

@Injectable()
export class CustomPaginatorIntl extends MatPaginatorIntl implements OnDestroy {
    private languageSubscription?: Subscription;

    constructor(private languageService: LanguageService) {
        super();
        this.updateLabels();
        
        this.languageSubscription = this.languageService.getCurrentLanguage$().subscribe(() => {
            this.updateLabels();
            this.changes.next();
        });
    }

    ngOnDestroy() {
        this.languageSubscription?.unsubscribe();
    }

    private updateLabels() {
        this.itemsPerPageLabel = this.languageService.translate('pagination.itemsPerPageLabel');
        this.nextPageLabel = this.languageService.translate('pagination.nextPageLabel');
        this.previousPageLabel = this.languageService.translate('pagination.previousPageLabel');
        this.firstPageLabel = this.languageService.translate('pagination.firstPageLabel');
        this.lastPageLabel = this.languageService.translate('pagination.lastPageLabel');
    }

    override getRangeLabel = (page: number, pageSize: number, length: number): string => {
        if (length === 0 || pageSize === 0) {
            return `0 / ${length}`;
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
        
        const template = this.languageService.translate('pagination.rangeLabel');
        return template
            .replace('{{startIndex}}', String(startIndex + 1))
            .replace('{{endIndex}}', String(endIndex))
            .replace('{{length}}', String(length));
    };
}