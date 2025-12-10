import { Component, inject, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { ApiDocumentServices } from '../../../services/system-document.service';
import { finalize } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBar } from "@angular/material/progress-bar";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LanguageService } from '../../../services/language.service';
import { TranslatePipe } from '../../../utils/translate.pipe';

@Component({
  selector: 'app-preview-mail',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBar,
    TranslatePipe
],
  templateUrl: './preview-mail.component.html',
  styleUrls: ['./preview-mail.component.scss', '../../../../../node_modules/quill/dist/quill.core.css',
  '../../../../../node_modules/quill/dist/quill.snow.css']
})
export class PreviewMailComponent implements OnInit {
  private translate = inject(LanguageService);  

  mailTitle: string = this.translate.translate('system.document.preview');
  mailContent!: SafeHtml;
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<PreviewMailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private documentApi: ApiDocumentServices,
    private snack: MatSnackBar,private sanitizer: DomSanitizer
  ) {
    this.mailTitle = this.data.title;
  }

  ngOnInit(): void {
    if (this.data.document) {
      this.loading = true;
      this.documentApi.getDocumentDetail(this.data.document.id).pipe(finalize(() => {this.loading = false})).subscribe({
        next: (res) => {
            this.mailContent = this.sanitizer.bypassSecurityTrustHtml(res.content);
        },
        error: (err: any) => {
          this.snack.open(err?.error?.errorMessage || this.translate.translate('system.document.failedToGetDocumentDetail'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
