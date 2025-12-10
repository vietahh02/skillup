import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs';
import { MatProgressBar } from "@angular/material/progress-bar";
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { TranslatePipe } from '../../../utils/translate.pipe';
import { LanguageService } from '../../../services/language.service';
import { ApiPartnerServices } from '../../../services/partner.service';
import { PartnerDetail } from '../../../models/partner.model';
@Component({
  selector: 'app-partner-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, MatProgressBar, MatTableModule, TranslatePipe],
  templateUrl: './partner-detail.component.html',
  styleUrls: ['./partner-detail.component.scss'],
})
export class PartnerDetailComponent {
  private snack = inject(MatSnackBar);
  private translate = inject(LanguageService);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiPartnerServices);

  id!: string;
  loading = false;
  error: string | null = null;
  detail: PartnerDetail | null = null; 

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.fetchDetail();
  }

  back() {
    this.router.navigate(['/system/partner-management']);
  }

  formatDate(date: string | null | undefined): string {
    return date ? date.split('T')[0] : '-';
  }

  fetchDetail() {
    this.loading = true;
    this.error = null;

    this.api
      .getPartnerDetail(this.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: PartnerDetail) => {
          this.detail = {
              ...res,
            };
        },
        error: (err: any) => {
          this.snack.open(err?.error?.errorMessage || this.translate.translate('system.partner.loadPartnerDetailFailed'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
        },
      });
  }

  // Copy to clipboard functionality
  copyToClipboard(value: string | null | undefined, labelKey: string): void {
    const label = this.translate.translate(labelKey);
    if (!value || value === '-') {
      this.snack.open(this.translate.translate('common.noValueToCopy'), '', { 
        duration: 2200, 
        panelClass: ['error-snackbar', 'custom-snackbar'], 
        horizontalPosition: 'right', 
        verticalPosition: 'top' 
      });
      return;
    }

    navigator.clipboard.writeText(value).then(() => {
      this.snack.open(this.translate.translate('common.valueCopiedToClipboard', { label }), '', { 
        duration: 2200, 
        panelClass: ['success-snackbar', 'custom-snackbar'], 
        horizontalPosition: 'right', 
        verticalPosition: 'top' 
      });
    }).catch((err) => {
      console.error('Failed to copy text: ', err);
      this.snack.open(this.translate.translate('common.failedToCopyToClipboard'), '', { 
        duration: 2200, 
        panelClass: ['error-snackbar', 'custom-snackbar'], 
        horizontalPosition: 'right', 
        verticalPosition: 'top' 
      });
    });
  }
}
