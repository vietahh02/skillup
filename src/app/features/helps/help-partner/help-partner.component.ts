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
import { Help, HelpDetail } from '../../../models/help.model';

@Component({
  selector: 'app-help-partner',
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
  templateUrl: './help-partner.component.html',
  styleUrls: ['./help-partner.component.scss', '../../../../../node_modules/quill/dist/quill.core.css',
  '../../../../../node_modules/quill/dist/quill.snow.css']
})
export class HelpPartnerComponent implements OnInit {
  private translate = inject(LanguageService);  

  helpTitle: string = this.translate.translate('system.help.preview');
  helpContent!: SafeHtml;
  loading = false;
  helpCode: string = '';
  helpDetail?: HelpDetail;
  helpList: Help[] = [];
  currentPage = 1;
  totalPages = 1;

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
    this.helpApi.getHelpPage({}).pipe(finalize(() => {this.loading = false})).subscribe({
      next: (res: any) => {
        this.helpList = res;
        this.onSelectHelp(this.helpList[0]);
        this.totalPages = res.length;
      },
      error: (err: any) => {
        this.snack.open(err?.error?.errorMessage || this.translate.translate('system.help.failedToGetHelpList'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
      }
    });
  }

  onSelectHelp(help: Help): void {
    this.helpCode = help.code;
    this.helpContent = this.sanitizer.bypassSecurityTrustHtml(help.contentHtml);
    // Update current page based on selected help
    const index = this.helpList.findIndex(h => h.code === help.code);
    if (index !== -1) {
      this.currentPage = index + 1;
    }
    // this.helpApi.getHelpDetail(this.helpCode).pipe(finalize(() => {this.loading = false})).subscribe({
    //   next: (res) => {
    //     this.helpDetail = res;
    //     this.helpContent = this.sanitizer.bypassSecurityTrustHtml(res.contentHtml);
    //   },
    // });
  }

  onPreviousPage(): void {
    this.currentPage--;
    this.onSelectHelp(this.helpList[this.currentPage - 1]);
  }

  onNextPage(): void {
    this.currentPage++;
    this.onSelectHelp(this.helpList[this.currentPage - 1]);
  }

  getPreviousHelp(): Help | null {
    if (this.currentPage > 1) {
      return this.helpList[this.currentPage - 2];
    }
    return null;
  }

  getNextHelp(): Help | null {
    if (this.currentPage < this.totalPages) {
      return this.helpList[this.currentPage];
    }
    return null;
  }
}
