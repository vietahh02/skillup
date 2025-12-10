import {Component, Inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBar} from '@angular/material/progress-bar';
import {TranslatePipe} from '../../../utils/translate.pipe';
import {PurchaseOrder} from '../../../models/purchase-order.model';
import {ApiPurchaseOrderServices} from '../../../services/purchase-order.service';
import {finalize} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material/snack-bar';
import {LanguageService} from '../../../services/language.service';
import {ApiAuthServices} from '../../../services/auth.service';
import {OtpDialogComponent} from '../../../shared/components/otp-dialog/otp-dialog.component';
import {generateUUID} from '../../../utils/uuid.util';

@Component({
  selector: 'app-purchase-order-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBar,
    TranslatePipe
  ],
  templateUrl: './purchase-order-detail-dialog.component.html',
  styleUrls: ['./purchase-order-detail-dialog.component.scss']
})
export class PurchaseOrderDetailDialogComponent implements OnInit {
  order: PurchaseOrder | null = null;
  loading = false;
    isHubAdmin = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: string | number },
    private dialogRef: MatDialogRef<PurchaseOrderDetailDialogComponent>,
    private api: ApiPurchaseOrderServices,
    private snack: MatSnackBar,
    private translate: LanguageService,
    private authService: ApiAuthServices,
    private dialog: MatDialog
  ) {
      this.isHubAdmin = this.authService.isHubAdmin?.() || this.authService.isAdminHub?.() || false;
  }

  ngOnInit(): void {
    this.loadDetail();
  }

  loadDetail(): void {
    this.loading = true;
    this.api.getPurchaseOrderDetail(this.data.id)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.order = response;
          // Map status và requestType
          if (this.order) {
            this.order.statusStr = this.getStatusString(this.order.status);
            this.order.transactionTypeStr = this.getTransactionTypeString(this.order.requestType);
          }
        },
        error: (error) => {
          this.snack.open(error?.error?.errorMessage || this.translate.translate('system.purchaseOrder.failedToLoadOrderDetail'), '', {
            duration: 2200,
            panelClass: ['error-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        }
      });
  }

  getStatusString(status: number | string | undefined): string {
    // 0 = pending, 1 = approved, -1 = rejected
    if (status === 0) return 'system.purchaseOrder.statusPending';
    if (status === 1) return 'system.purchaseOrder.statusApproved';
    if (status === -1) return 'system.purchaseOrder.statusRejected';
    return '';
  }

  getStatusColor(status: number | string | undefined): string {
    // 0 = pending, 1 = approved, -1 = rejected
    if (status === 0) return '#fbbc04';
    if (status === 1) return '#137333';
    if (status === -1) return '#d41900';
    return '#666';
  }

  getTransactionTypeString(requestType: string | undefined): string {
    // DEPOSIT, WITHDRAW
    if (requestType === 'DEPOSIT') return 'system.purchaseOrder.typeDeposit';
    if (requestType === 'WITHDRAW') return 'system.purchaseOrder.typeWithdrawal';
    return requestType || '';
  }

  getTransactionTypeColor(requestType: string | undefined): string {
    // DEPOSIT, WITHDRAW
    if (requestType === 'DEPOSIT') return '#137333';
    if (requestType === 'WITHDRAW') return '#d41900';
    return '#666';
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    try {
      const d = new Date(date);
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    } catch {
      return date || '-';
    }
  }

  formatAmount(amount: number | undefined): string {
    if (!amount) return '0';
    return amount.toLocaleString('vi-VN');
  }

  close(): void {
    this.dialogRef.close();
  }

    get isPending(): boolean {
        const status = this.order?.status;
        const statusNum = typeof status === 'string' ? Number(status) : status;
        return statusNum === 0;
    }

    get showActionButtons(): boolean {
        return this.isHubAdmin && this.isPending;
    }

    onApprove(): void {
        const orderId = this.order?.id || this.order?.orderId;
        if (!orderId) {
            this.snack.open('Order ID not found', '', {
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
        this.api.checkApprove(orderId, checkPayload).pipe(
            finalize(() => this.loading = false)
        ).subscribe({
            next: (response) => {
                this.openOtpDialog(orderId, true);
            },
            error: (error) => {
                console.error('Error checking approve:', error);
                const errorMessage = error?.error?.errorMessage || error?.message || 'Failed to check approve';
                this.snack.open(errorMessage, '', {
                    duration: 3000,
                    panelClass: ['error-snackbar'],
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                });
            }
        });
    }

    onReject(): void {
        const orderId = this.order?.id || this.order?.orderId;
        if (!orderId) {
            this.snack.open('Order ID not found', '', {
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
        this.api.checkApprove(orderId, checkPayload).pipe(
            finalize(() => this.loading = false)
        ).subscribe({
            next: (response) => {
                this.openOtpDialog(orderId, false);
            },
            error: (error) => {
                console.error('Error checking reject:', error);
                const errorMessage = error?.error?.errorMessage || error?.message || 'Failed to check reject';
                this.snack.open(errorMessage, '', {
                    duration: 3000,
                    panelClass: ['error-snackbar'],
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                });
            }
        });
    }

    openOtpDialog(orderId: string | number, isApprove: boolean): void {
        const otpDialog = this.dialog.open(OtpDialogComponent, {
            width: '500px',
            disableClose: true,
            data: {
                title: this.translate.translate('system.notification.enterOtpTitle') || 'Enter OTP',
                message: isApprove
                    ? (this.translate.translate('system.notification.enterOtpApprove') || 'Please enter the OTP code to approve this purchase order')
                    : (this.translate.translate('system.notification.enterOtpReject') || 'Please enter the OTP code to reject this purchase order')
            }
        });

        otpDialog.afterClosed().subscribe(result => {
            if (result && result.otp) {
                if (isApprove) {
                    this.submitApprove(orderId, result.otp);
                } else {
                    this.submitReject(orderId, result.otp);
                }
            }
        });
    }

    submitApprove(orderId: string | number, otp: string): void {
        const payload = {
            requestId: generateUUID(),
            client: 'CMS',
            version: '1.0',
            isApprove: true,
            originalRequestId: orderId.toString(),
            otp: otp
        };

        this.loading = true;
        this.api.approvePurchaseOrder(payload).pipe(
            finalize(() => this.loading = false)
        ).subscribe({
            next: (response) => {
                this.snack.open(this.translate.translate('system.purchaseOrder.approvedSuccessfully') || 'Purchase order approved successfully', '', {
                    duration: 3000,
                    panelClass: ['success-snackbar'],
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                });
                this.dialogRef.close({action: 'approve', order: this.order});
            },
            error: (error) => {
                console.error('Error approving purchase order:', error);
                const errorMessage = error?.error?.errorMessage || error?.message || 'Failed to approve purchase order';
                this.snack.open(errorMessage, '', {
                    duration: 3000,
                    panelClass: ['error-snackbar'],
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                });
            }
        });
    }

    submitReject(orderId: string | number, otp: string): void {
        const payload = {
            requestId: generateUUID(),
            client: 'CMS',
            version: '1.0',
            isApprove: false,
            originalRequestId: orderId.toString(),
            otp: otp
        };

        this.loading = true;
        this.api.approvePurchaseOrder(payload).pipe(
            finalize(() => this.loading = false)
        ).subscribe({
            next: (response) => {
                this.snack.open(this.translate.translate('system.purchaseOrder.rejectedSuccessfully') || 'Purchase order rejected successfully', '', {
                    duration: 3000,
                    panelClass: ['success-snackbar'],
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                });
                this.dialogRef.close({action: 'reject', order: this.order});
            },
            error: (error) => {
                console.error('Error rejecting purchase order:', error);
                const errorMessage = error?.error?.errorMessage || error?.message || 'Failed to reject purchase order';
                this.snack.open(errorMessage, '', {
                    duration: 3000,
                    panelClass: ['error-snackbar'],
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                });
            }
        });
    }
}

