import {Component, inject, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {CommonModule} from '@angular/common';
import {
    CreateUpdateDocumentDto,
    Document,
    DocumentDetail,
    getNotificationOptions
} from '../../../models/document.model';
import {ApiDocumentServices} from '../../../services/system-document.service';
import {finalize} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatProgressBar} from "@angular/material/progress-bar";
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslatePipe} from '../../../utils/translate.pipe';
import {LanguageService} from '../../../services/language.service';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {
    DOCUMENT_LAYOUTS,
    EMAIL_TEMPLATES,
    extractContentBody,
    getRequiredFieldsByCode,
    getTemplateByCode,
    mergeLayoutWithContent,
    parseLayoutFromContent,
    validateRequiredFields
} from '../../../utils/shared/constants/document-layout.constants';

export interface DialogData {
  mode: 'create' | 'edit';
  document?: Document;
  loadDocuments: () => void;
}

@Component({
  selector: 'app-create-update-document-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBar,
      MatTooltipModule,
    TranslatePipe
],
  templateUrl: './create-update-document.component.html',
  styleUrl: './create-update-document.component.scss'
})
export class CreateUpdateDocumentDialogComponent implements OnInit {
  private translate = inject(LanguageService);
    private sanitizer = inject(DomSanitizer);

  documentForm: FormGroup;
  isSubmitting = false;
  loading = false;

    // Sample data for preview placeholders
    private readonly sampleData: { [key: string]: string } = {
        'Username': 'username',
        'Password': 'abc123',
        'Link': '/reset/abc',
        'BaseUrl': 'https://example.com',
        'Ip': '192.168.1.1'
    };

  codeOptions = getNotificationOptions();
  typeOptions = [
      {value: 'EMAIL', label: 'Email'}
  ]
  languageOptions = [
    { value: 'en', label: 'English' },
      {value: 'mm', label: 'Myanmar'},
  ];

    requiredFields: string[] = [];
    missingFields: string[] = [];
    isContentValid = true;
    showHelpPanel = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateUpdateDocumentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private documentApi: ApiDocumentServices,
    private snack: MatSnackBar
  ) {
    this.documentForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.data.document) {
      this.loading = true;
      this.documentApi.getDocumentDetail(this.data.document.id).pipe(finalize(() => {this.loading = false})).subscribe({
        next: (res) => {
          this.populateForm(res);
        },
        error: () => {
          this.snack.open('Failed to get document detail', '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
        }
      });
    }
  }

  private createForm(): FormGroup {
      const form = this.fb.group({
      code: ['', [Validators.required]],
      type: ['', [Validators.required]],
      language: ['', [Validators.required]],
      title: ['', [Validators.required, Validators.maxLength(255)]],
      content: ['', [Validators.required]],
    });

      // Watch code changes to load template
      form.get('code')?.valueChanges.subscribe((code: string | null) => {
          if (code && !this.data.document?.id) {
              const language = form.get('language')?.value || 'en';
              this.loadTemplateForCode(code, language);
          }
          if (code) {
              this.updateRequiredFields(code);
          }
      });

      // Watch language changes to update template
      form.get('language')?.valueChanges.subscribe((language: string | null) => {
          if (language && form.get('code')?.value && !this.data.document?.id) {
              const code = form.get('code')?.value;
              if (code) {
                  this.loadTemplateForCode(code, language);
              }
          }
      });

      // Watch content changes to validate required fields
      form.get('content')?.valueChanges.subscribe(() => {
          this.validateContentFields();
      });

      return form;
  }

    private loadTemplateForCode(code: string, language: string): void {
        const template = getTemplateByCode(code, language);
        if (template) {
            this.documentForm.patchValue({
                content: template
            }, {emitEvent: false});
        }
    }

    private updateRequiredFields(code: string): void {
        this.requiredFields = getRequiredFieldsByCode(code);
        this.validateContentFields();
    }

    private validateContentFields(): void {
        const content = this.documentForm.get('content')?.value || '';
        if (this.requiredFields.length > 0) {
            const validation = validateRequiredFields(content, this.requiredFields);
            this.isContentValid = validation.isValid;
            this.missingFields = validation.missingFields;
        } else {
            this.isContentValid = true;
            this.missingFields = [];
        }
  }

  private populateForm(document: DocumentDetail): void {
    this.documentForm.patchValue({
      code: document.code,
      type: document.type,
      language: document.language,
      title: document.title,
      content: document.content
    });
      this.updateRequiredFields(document.code);
      this.validateContentFields();
  }

  onSubmit(): void {
    this.documentForm.markAllAsTouched();
      this.validateContentFields();

      if (!this.isContentValid) {
          this.snack.open(`Missing required fields: ${this.missingFields.join(', ')}`, '', {
              duration: 3000,
              panelClass: ['error-snackbar', 'custom-snackbar'],
              horizontalPosition: 'right',
              verticalPosition: 'top'
          });
          return;
      }

    if (this.documentForm.valid && !this.isSubmitting) {
      this.loading = true;
      this.isSubmitting = true;

      const formValue = this.documentForm.value;
        const rawContent = formValue.content || '';

        // Parse layout and merge with content for saving
        const layoutKey = parseLayoutFromContent(rawContent);
        const bodyContent = extractContentBody(rawContent);
        const finalContent = layoutKey ? mergeLayoutWithContent(layoutKey, bodyContent) : rawContent;

      const payload: CreateUpdateDocumentDto = {
        requestId: "string123",
        code: formValue.code,
        type: formValue.type,
        language: formValue.language,
        title: formValue.title,
          content: finalContent // Save merged content with layout
      };

      if (this.data.document?.id) {
        // payload.id = this.data.document.id;
      }

      if (this.data.document?.id) {
        this.documentApi.updateDocument(this.data.document.id, payload).pipe(finalize(() => {this.loading = false, this.isSubmitting = false})).subscribe({
          next: () => {
            this.onCancel();
            this.snack.open(this.translate.translate('system.document.updatedSuccessfully'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            this.data.loadDocuments();
          },
          error: (err: any) => {
            this.snack.open(err?.error?.errorMessage || this.translate.translate('system.document.failedToUpdate'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          }
        });
      } else {
        this.documentApi.createDocument(payload).pipe(finalize(() => {this.loading = false, this.isSubmitting = false})).subscribe({
          next: () => {
            this.onCancel();
            this.snack.open(this.translate.translate('system.document.createdSuccessfully'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            this.data.loadDocuments();
          },
          error: (err: any) => {
            this.snack.open(err?.error?.errorMessage || this.translate.translate('system.document.failedToCreate'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get title(): string {
    return this.data.document?.id ? this.translate.translate('system.document.editDocument') : this.translate.translate('system.document.createDocument');
  }

  get submitButtonText(): string {
    return this.data.document?.id ? this.translate.translate('common.update') : this.translate.translate('common.create');
  }

    get previewContent(): SafeHtml {
        const content = this.documentForm.get('content')?.value || '';
        if (!content) {
            return '';
        }

        // Parse layout from content
        const layoutKey = parseLayoutFromContent(content);
        const bodyContent = extractContentBody(content);

        // Merge layout with content if layout exists
        let finalContent = layoutKey ? mergeLayoutWithContent(layoutKey, bodyContent) : bodyContent;

        // Replace @FieldName placeholders with sample data
        let previewHtml = finalContent;
        Object.keys(this.sampleData).forEach(field => {
            const placeholder = `@${field}`;
            const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            previewHtml = previewHtml.replace(regex, `<span class="placeholder-value">${this.sampleData[field]}</span>`);
        });

        // Also replace @Model.FieldName format
        Object.keys(this.sampleData).forEach(field => {
            const placeholder = `@Model.${field}`;
            const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            previewHtml = previewHtml.replace(regex, `<span class="placeholder-value">${this.sampleData[field]}</span>`);
        });

        return this.sanitizer.bypassSecurityTrustHtml(previewHtml);
    }

    get detectedLayout(): string | null {
        const content = this.documentForm.get('content')?.value || '';
        return parseLayoutFromContent(content);
    }

    get availableLayouts() {
        return Object.keys(DOCUMENT_LAYOUTS).map(key => ({
            key,
            name: DOCUMENT_LAYOUTS[key as keyof typeof DOCUMENT_LAYOUTS].name
        }));
    }

    get availableTemplates() {
        return Object.keys(EMAIL_TEMPLATES).map(key => ({
            key,
            name: EMAIL_TEMPLATES[key as keyof typeof EMAIL_TEMPLATES].name,
            requiredFields: EMAIL_TEMPLATES[key as keyof typeof EMAIL_TEMPLATES].requiredFields
        }));
    }

    get currentTemplate() {
        const code = this.documentForm.get('code')?.value;
        if (!code) return null;
        return EMAIL_TEMPLATES[code as keyof typeof EMAIL_TEMPLATES];
    }

    get currentLang(): string {
        return this.translate.getCurrentLanguage();
    }

    get helpTitle(): string {
        return this.currentLang === 'my'
            ? 'Content အသုံးပြုနည်းလမ်းညွှန်'
            : 'Content Usage Guide';
    }

    get helpSections() {
        const lang = this.currentLang;
        const isMy = lang === 'my';

        return {
            layoutsTitle: isMy ? 'Layouts များ' : 'Available Layouts',
            templatesTitle: isMy ? 'Templates များ' : 'Available Templates',
            placeholdersTitle: isMy ? 'Placeholders (Dynamic Fields)' : 'Placeholders (Dynamic Fields)',
            notesTitle: isMy ? 'အရေးကြီးသတိပေးချက်များ' : 'Important Notes',
            exampleTitle: isMy ? 'ဥပမာ' : 'Example',
            layoutUsageText: isMy
                ? 'အသုံးပြုရန်:'
                : 'Usage:',
            layoutUsageCode: '@{ Layout = "base-layout-content-en-us"; }',
            layoutUsageNote: isMy
                ? 'ကို content ၏အစတွင် ထည့်ပါ'
                : 'at the beginning of content',
            templateNote: isMy
                ? 'Code ကို ရွေးချယ်သောအခါ template သည် အလိုအလျောက် load လုပ်မည်။ Language ကို ပြောင်းလဲသောအခါ template သည် ဘာသာစကားအလိုက် အလိုအလျောက် ပြောင်းလဲမည်။'
                : 'Template will automatically load when Code is selected. When Language is changed, template will automatically change according to the language.',
            placeholderNote: isMy
                ? 'ဤ placeholders များကို email ပို့သောအခါ တန်ဖိုးများဖြင့် အစားထိုးမည်ဖြစ်သည်။'
                : 'These placeholders will be replaced with actual values when sending email.',
            requiredFields: isMy ? 'Required fields' : 'Required fields',
            note1: isMy
                ? 'အမျိုးအစားအလိုက် required fields များကို အလိုအလျောက် validate လုပ်မည်'
                : 'Required fields will be automatically validated by template type',
            note2: isMy
                ? 'Preview သည် sample values များဖြင့်ြသမည်ဖြစ်သည်'
                : 'Preview will display with sample values',
            note3: isMy
                ? 'Save လုပ်သောအခါ layout ကို content နှင့် merge လုပ်ပြီး backend သို့ ပို့မည်'
                : 'When saving, layout will be merged with content and sent to backend',
            note4: isMy
                ? 'သင်သည် template နှင့် layout ကို လိုအပ်သလို တည်းဖြတ်နိုင်သည်'
                : 'You can edit template and layout as needed'
        };
    }
}
