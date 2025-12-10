import { Component, inject, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { ApiHelpServices } from '../../../services/help.service';
import { finalize } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBar } from "@angular/material/progress-bar";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LanguageService } from '../../../services/language.service';
import { TranslatePipe } from '../../../utils/translate.pipe';
import { ActivatedRoute, Router } from '@angular/router';
import { HelpDetail } from '../../../models/help.model';

@Component({
  selector: 'app-preview-help',
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
  templateUrl: './preview-help.component.html',
  styleUrls: ['./preview-help.component.scss', '../../../../../node_modules/quill/dist/quill.core.css',
  '../../../../../node_modules/quill/dist/quill.snow.css']
})
export class PreviewHelpComponent implements OnInit {
  private translate = inject(LanguageService);  

  helpTitle: string = this.translate.translate('system.help.preview');
  helpContent!: SafeHtml;
  loading = false;
  helpCode: string = '';
  helpDetail?: HelpDetail;

  constructor(
    private helpApi: ApiHelpServices,
    private snack: MatSnackBar,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.helpCode = this.route.snapshot.params['code'];
  }

  ngOnInit(): void {
    if (this.helpCode) {
      this.loading = true;
      this.helpApi.getHelpDetail(this.helpCode).pipe(finalize(() => {this.loading = false})).subscribe({
        next: (res) => {
          this.helpDetail = res;
          this.helpContent = this.sanitizer.bypassSecurityTrustHtml(res.contentHtml);
        },
        error: (err: any) => {
          this.snack.open(err?.error?.errorMessage || this.translate.translate('system.help.failedToGetHelpDetail'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
        }
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/system/help-management']);
  }

}
