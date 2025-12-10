import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type DialogType = 'success' | 'warning' | 'error' | 'confirm';

export interface ConfirmOptions {
  type?: DialogType;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean; // style confirm button as warn
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmOptions,
    private ref: MatDialogRef<ConfirmDialogComponent>
  ) {}

  icon(): string {
    switch (this.data.type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error':   return 'error';
      default:        return 'help';
    }
  }

  // color for the icon (uses Material theme classes)
  iconClass(): string {
    switch (this.data.type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-amber-600';
      case 'error':   return 'text-red-600';
      default:        return 'text-gray-600';
    }
  }

  confirmColor(): 'primary' | 'warn' {
    // warn if destructive flag OR explicit error/warning type
    if (this.data.destructive || this.data.type === 'error' || this.data.type === 'warning') return 'warn';
    return 'primary';
  }

  close(ok: boolean) { this.ref.close(ok); }
}