import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

export interface ContactInfo {
  name: string;
  phone: string;
  email?: string;
  department?: string;
}

@Component({
  selector: 'app-contact-popup',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './contact-popup.component.html',
  styleUrls: ['./contact-popup.component.scss']
})
export class ContactPopupComponent {
  contactInfo: ContactInfo;

  constructor(
    public dialogRef: MatDialogRef<ContactPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ContactInfo
  ) {
    this.contactInfo = data;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onCall(): void {
    window.open(`tel:${this.contactInfo.phone}`, '_self');
  }

  onEmail(): void {
    if (this.contactInfo.email) {
      window.open(`mailto:${this.contactInfo.email}`, '_self');
    }
  }

  onCopyPhone(): void {
    navigator.clipboard.writeText(this.contactInfo.phone).then(() => {
      // You can add a toast notification here if needed
      console.log('Phone number copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy phone number: ', err);
    });
  }
}
