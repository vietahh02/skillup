import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBar } from "@angular/material/progress-bar";
import { QuillModule } from 'ngx-quill';
import { EditorChangeContent, EditorChangeSelection } from 'ngx-quill';
import Quill from "quill/core";
import { TranslatePipe } from '../../../utils/translate.pipe';
import { LanguageService } from '../../../services/language.service';
import { CreateUpdateHelpPayload, HelpDetail } from '../../../models/help.model';
import { ApiHelpServices } from '../../../services/help.service';
import { ActivatedRoute, Router } from '@angular/router';

export interface DialogData {
  mode: 'create' | 'edit';
  help?: HelpDetail;
  loadHelp: () => void;
}

@Component({
  selector: 'app-create-update-help-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBar,
    QuillModule,
    TranslatePipe
],
  templateUrl: './create-update-help.component.html',
  styleUrl: './create-update-help.component.scss'
})
export class CreateUpdateHelpComponent implements OnInit {
  private translate = inject(LanguageService);
  
  helpForm: FormGroup;
  isSubmitting = false;
  loading = false;
  helpCode: string = '';

  constructor(
    private fb: FormBuilder,
    private helpApi: ApiHelpServices, 
    private snack: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.helpForm = this.createForm();
    this.helpCode = this.route.snapshot.params['code'];
  }

  ngOnInit(): void {
    if (this.helpCode) {
      this.loading = true;
      this.helpApi.getHelpDetail(this.helpCode).pipe(finalize(() => {this.loading = false})).subscribe({
        next: (res) => {
          this.populateForm(res);
        },
        error: () => {
          this.snack.open('Failed to get help detail', '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
        }
      });
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(255)]],
      title: ['', [Validators.required, Validators.maxLength(255)]],
      contentMd: ['', [Validators.required, Validators.maxLength(255)]],
      contentHtml: ['', [Validators.required]],
    });
  }

  private populateForm(help: HelpDetail): void {
    this.helpForm.patchValue({
      code: help.code,
      title: help.title,
      contentMd: help.contentMd,
      contentHtml: help.contentHtml
    });
  }

  onBack(): void {
    this.router.navigate(['/system/help-management']);
  }

  onSubmit(): void {
    this.helpForm.markAllAsTouched();
    if (!this.helpForm.valid) {
      this.snack.open(this.translate.translate('common.formInvalid'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
      return;
    };
      this.loading = true;
      this.isSubmitting = true;
      
      const formValue = this.helpForm.value;
      const payload: CreateUpdateHelpPayload = {
        code: formValue.code,
        title: formValue.title,
        contentMd: formValue.contentMd,
        contentHtml: formValue.contentHtml
      };

      if (this.helpCode) {
        // payload.id = this.data.document.id;
      }

      if (this.helpCode) {
        this.helpApi.updateHelp(this.helpCode, payload).pipe(finalize(() => {this.loading = false, this.isSubmitting = false})).subscribe({
          next: () => {
            this.onBack();
            this.snack.open(this.translate.translate('system.help.updatedSuccessfully'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          },
          error: (err: any) => {
            this.snack.open(err?.error?.errorMessage || this.translate.translate('system.help.failedToUpdate'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          }
        });
      } else {
        this.helpApi.createHelp(payload).pipe(finalize(() => {this.loading = false, this.isSubmitting = false})).subscribe({
          next: () => {
            this.onBack();
            this.snack.open(this.translate.translate('system.help.createdSuccessfully'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          },
          error: (err: any) => {
            this.snack.open(err?.error?.errorMessage || this.translate.translate('system.help.failedToCreate'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          }
        });
      }
    
  }

  getTileName(): string {
    return this.helpCode ? this.translate.translate('system.help.editHelp') : this.translate.translate('system.help.createHelp');
  }

  submitButtonText(): string {
    return this.helpCode ? this.translate.translate('common.update') : this.translate.translate('common.create');
  }

  created(event: Quill) {}
  changedEditor(event: EditorChangeContent | EditorChangeSelection) {}
  focus($event: any) {}
  blur($event: any) {}
}
