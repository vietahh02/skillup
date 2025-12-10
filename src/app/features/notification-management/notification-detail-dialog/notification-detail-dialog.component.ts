import {Component, Inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslatePipe} from '../../../utils/translate.pipe';
import {Notification} from '../notification-list/notification-list.component';
import {ApiPurchaseOrderServices} from '../../../services/purchase-order.service';
import {ApiAuthServices} from '../../../services/auth.service';
import {OtpDialogComponent} from '../../../shared/components/otp-dialog/otp-dialog.component';
import {generateUUID} from '../../../utils/uuid.util';
import {PurchaseOrder} from '../../../models/purchase-order.model';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-notification-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBar,
    MatTooltipModule,
    TranslatePipe
  ],
  templateUrl: './notification-detail-dialog.component.html',
  styleUrls: ['./notification-detail-dialog.component.scss']
})
export class NotificationDetailDialogComponent implements OnInit {
  notification: Notification | null = null;
  loading = false;
  purchaseOrderDetail: PurchaseOrder | null = null;
    isHubAdmin = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { notification: Notification },
    private dialogRef: MatDialogRef<NotificationDetailDialogComponent>,
    private purchaseOrderService: ApiPurchaseOrderServices,
    private authService: ApiAuthServices,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.notification = this.data.notification;
      this.isHubAdmin = this.authService.isHubAdmin();
    // Load purchase order detail to get full information
    if (this.notification?.orderId || this.notification?.id) {
      this.loadPurchaseOrderDetail();
    }
  }

  loadPurchaseOrderDetail(): void {
    const orderId = this.notification?.orderId || this.notification?.id;
    if (!orderId) return;

    this.loading = true;
    this.purchaseOrderService.getPurchaseOrderDetail(orderId).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (data: PurchaseOrder) => {
        this.purchaseOrderDetail = data;
      },
      error: (error) => {
        console.error('Error loading purchase order detail:', error);
      }
    });
  }

  getStatusString(status: number | undefined): string {
    // Mock status - sẽ thay bằng API response sau
    if (status === 0) return 'system.purchaseOrder.statusPending';
    if (status === 1) return 'system.purchaseOrder.statusApproved';
    if (status === -1) return 'system.purchaseOrder.statusRejected';
    return 'system.purchaseOrder.statusPending';
  }

  getStatusColor(status: number | undefined): string {
    if (status === 0) return '#fbbc04'; // Pending - Orange
    if (status === 1) return '#137333'; // Approved - Green
    if (status === -1) return '#f3412a'; // Rejected - Red
    return '#fbbc04'; // Default to Pending
  }

  getRequestTypeLabel(requestType?: 'DEPOSIT' | 'WITHDRAW'): string {
    if (!requestType) return '';
    return requestType === 'DEPOSIT'
      ? 'system.purchaseOrder.typeDeposit'
      : 'system.purchaseOrder.typeWithdrawal';
  }

  getRequestTypeColor(requestType?: 'DEPOSIT' | 'WITHDRAW'): string {
    if (requestType === 'DEPOSIT') return '#137333';
    if (requestType === 'WITHDRAW') return '#f63e26';
    return '#666';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    } catch {
      return '-';
    }
  }

  formatAmount(amount: number | undefined): string {
    if (!amount) return '0';
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getStatusNumber(status: string | number | undefined): number | undefined {
    if (status === undefined || status === null) return undefined;
    return typeof status === 'string' ? Number(status) : status;
  }

  getRequestType(requestType: string | undefined): 'DEPOSIT' | 'WITHDRAW' | undefined {
    if (!requestType) return undefined;
    return requestType === 'DEPOSIT' || requestType === 'WITHDRAW' ? requestType : undefined;
  }

  onApprove(): void {
    const orderId = this.notification?.orderId || this.notification?.id;
    if (!orderId) {
      this.snackBar.open('Order ID not found', '', {
        duration: 3000,
        panelClass: ['error-snackbar'],
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
      return;
    }

    this.loading = true;
    // Step 1: Check approve API (POST)
    const checkPayload = {
      requestId: generateUUID(),
      client: 'CMS',
      version: '1.0'
    };
    this.purchaseOrderService.checkApprove(orderId, checkPayload).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response) => {
        // Step 2: Show OTP dialog
        this.openOtpDialog(orderId);
      },
      error: (error) => {
        console.error('Error checking approve:', error);
        const errorMessage = error?.error?.errorMessage || error?.message || 'Failed to check approve';
        this.snackBar.open(errorMessage, '', {
          duration: 3000,
          panelClass: ['error-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
    });
  }

  openOtpDialog(orderId: string): void {
    const otpDialog = this.dialog.open(OtpDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        title: 'Enter OTP',
        message: 'Please enter the OTP code to approve this purchase order'
      }
    });

    otpDialog.afterClosed().subscribe(result => {
      if (result && result.otp) {
        this.submitApprove(orderId, result.otp);
      }
    });
  }

  submitApprove(orderId: string, otp: string): void {
    // Build approve payload - simplified version
    const payload = {
      requestId: generateUUID(),
      client: 'CMS',
      version: '1.0',
      isApprove: true,
      originalRequestId: orderId, // This is the purchase order id
      otp: otp
    };

    this.loading = true;
    this.purchaseOrderService.approvePurchaseOrder(payload).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response) => {
        this.snackBar.open('Purchase order approved successfully', '', {
          duration: 3000,
          panelClass: ['success-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        this.dialogRef.close({ action: 'approve', notification: this.notification });
      },
      error: (error) => {
        console.error('Error approving purchase order:', error);
        const errorMessage = error?.error?.errorMessage || error?.message || 'Failed to approve purchase order';
        this.snackBar.open(errorMessage, '', {
          duration: 3000,
          panelClass: ['error-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
    });
  }

  onReject(): void {
    const orderId = this.notification?.orderId || this.notification?.id;
    if (!orderId) {
      this.snackBar.open('Order ID not found', '', {
        duration: 3000,
        panelClass: ['error-snackbar'],
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
      return;
    }

    this.loading = true;
    const checkPayload = {
      requestId: generateUUID(),
      client: 'CMS',
      version: '1.0'
    };
    this.purchaseOrderService.checkApprove(orderId, checkPayload).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response) => {
        // Step 2: Show OTP dialog
        this.openOtpDialogForReject(orderId);
      },
      error: (error) => {
        console.error('Error checking reject:', error);
        const errorMessage = error?.error?.errorMessage || error?.message || 'Failed to check reject';
        this.snackBar.open(errorMessage, '', {
          duration: 3000,
          panelClass: ['error-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
    });
  }

  openOtpDialogForReject(orderId: string): void {
    const otpDialog = this.dialog.open(OtpDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        title: 'Enter OTP',
        message: 'Please enter the OTP code to reject this purchase order'
      }
    });

    otpDialog.afterClosed().subscribe(result => {
      if (result && result.otp) {
        this.submitReject(orderId, result.otp);
      }
    });
  }

  submitReject(orderId: string, otp: string): void {
    // Build reject payload - same as approve but with isApprove: false
    const payload = {
      requestId: generateUUID(),
      client: 'CMS',
      version: '1.0',
      isApprove: false,
      originalRequestId: orderId, // This is the purchase order id
      otp: otp
    };

    this.loading = true;
    this.purchaseOrderService.approvePurchaseOrder(payload).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response) => {
        this.snackBar.open('Purchase order rejected successfully', '', {
          duration: 3000,
          panelClass: ['success-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        this.dialogRef.close({ action: 'reject', notification: this.notification });
      },
      error: (error) => {
        console.error('Error rejecting purchase order:', error);
        const errorMessage = error?.error?.errorMessage || error?.message || 'Failed to reject purchase order';
        this.snackBar.open(errorMessage, '', {
          duration: 3000,
          panelClass: ['error-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
    });
  }

  onBack(): void {
    this.dialogRef.close();
  }

  onDownloadFile(): void {
    // TODO: Implement file download logic
    console.log('Download file for notification:', this.notification?.id);


  }
}

