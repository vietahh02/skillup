import {ApiDocumentServices} from './../../../services/system-document.service';
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatSelectModule} from "@angular/material/select";
import {CommonModule} from "@angular/common";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {Component, Inject, inject} from "@angular/core";
import {MatSnackBar} from "@angular/material/snack-bar";
import {finalize} from "rxjs/operators";
import {MatProgressBar} from "@angular/material/progress-bar";
import {TranslatePipe} from '../../../utils/translate.pipe';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Document, DocumentDetail, SendMail} from '../../../models/document.model';
import {generateUUID} from '../../../utils/uuid.util';
import {LanguageService} from '../../../services/language.service';

@Component({
    selector: 'send-mail',
    imports: [
      CommonModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatButtonModule,
      MatIconModule,
      MatProgressBar,
      TranslatePipe,
    ],
    templateUrl: './send-mail.component.html',
    styleUrl: './send-mail.component.scss'
  })
  export class SendMailComponent {
    private fb = inject(FormBuilder);
    private snack = inject(MatSnackBar);
    private documentApi = inject(ApiDocumentServices);
    private translate = inject(LanguageService);

    constructor(
      public dialogRef: MatDialogRef<SendMailComponent>,
      @Inject(MAT_DIALOG_DATA) public data: { document: Document }
    ) {
    }

    documentDetail!: DocumentDetail;
    isSubmitting = false;

    onCancel() {
      this.form.reset();
      this.dialogRef.close();
    }

    form = this.fb.group({
        email: ['', [Validators.required, Validators.maxLength(100), Validators.email]],
        language: ['', [Validators.required]],
        content: ['', [Validators.required]],
    });

    languageOptions = [
      { value: 'en', label: 'English' },
        {value: 'mm', label: 'Myanmar'},
    ];

    loading = false;

    ngOnInit() {
      this.loadDetail();
    }

    loadDetail() {
        this.loading = true;
      this.isSubmitting = true;
      if (this.data.document) {
        this.documentApi.getDocumentDetail(this.data.document.id).pipe(finalize(() => {this.loading = false, this.isSubmitting = false})).subscribe({
          next: (res) => {
            this.form.patchValue({
              language: res.language
            });
            this.documentDetail = res;
          },
          error: (err: any) => {
            this.snack.open(err?.error?.errorMessage || this.translate.translate('system.document.failedToGetDocumentDetail'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            this.onCancel();
          }
        });
      }
    }

    onSubmit() {
      this.form.markAllAsTouched();
      if (this.form.invalid) return;

        this.loading = true;
      this.isSubmitting = true;
      const formVal = this.form.getRawValue();
      const payload : SendMail = {
        requestId: generateUUID(),
        code: this.documentDetail.code,
        type: this.documentDetail.type,
        language: formVal.language || '',
        title: this.documentDetail.title,
        content: formVal.content || '',
        to: formVal.email || ''
      };

      this.documentApi.sendMail(payload).pipe(finalize(() => {this.loading = false, this.isSubmitting = false})).subscribe({
          next: () => {
            this.snack.open(this.translate.translate('system.document.mailSentSuccessfully'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            this.onCancel();
          },
          error: (err: any) => {
            this.snack.open(err?.error?.errorMessage || this.translate.translate('system.document.failedToSendMail'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          }
        });
    }

  }
