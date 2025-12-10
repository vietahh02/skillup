import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { TranslatePipe } from '../../../utils/translate.pipe';

@Component({
  selector: 'generic-drawer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBar,
    TranslatePipe
  ],
  templateUrl: './generic-drawer.component.html',
  styleUrls: ['./generic-drawer.component.scss']
})
export class GenericDrawerComponent {
  @Input() title: string = '';
  @Input() loading: boolean = false;
  @Input() isSubmit: boolean = false;
  @Input() showSaveButton: boolean = true;
  @Input() showCloseButton: boolean = true;
  @Input() saveButtonText: string = 'common.save';
  @Input() closeButtonText: string = 'common.close';
  @Input() saveButtonDisabled: boolean = false;

  @Output() onSave = new EventEmitter<void>();
  @Output() onClose = new EventEmitter<void>();

  handleSave() {
    this.onSave.emit();
  }

  handleClose() {
    this.onClose.emit();
  }
}

