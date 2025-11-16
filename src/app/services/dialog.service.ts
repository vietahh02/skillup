import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, tap } from 'rxjs';
import { ConfirmDialogComponent, ConfirmOptions } from '../common/confirm-dialog/confirm-dialog.component';

export interface ConfirmConfig extends ConfirmOptions {
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(private dialog: MatDialog) {}

  confirm(config: ConfirmConfig): Observable<boolean> {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: config,
      maxWidth: '420px',
      disableClose: true,
    });

    return ref.afterClosed().pipe(
      tap(async (ok) => {
        try {
          if (ok) {
            await config.onConfirm?.();
          } else {
            await config.onCancel?.();
          }
        } catch {
          // swallow callback errors to avoid breaking the stream
        }
      })
    );
  }
}