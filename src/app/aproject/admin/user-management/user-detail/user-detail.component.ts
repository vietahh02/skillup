import { Component, inject } from '@angular/core';
import { MatCard, MatCardHeader, MatCardContent } from "@angular/material/card";
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ApiUserServices } from '../../../../services/user.service';


@Component({
    selector: 'app-admin-user-detail',
    imports: [MatCard, MatCardHeader, MatCardContent, RouterLink],
    templateUrl: './user-detail.component.html',
    styleUrls: ['./user-detail.component.scss'],
})
export class AdminUserDetail {  
    constructor(private snack: MatSnackBar) {}

    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private api = inject(ApiUserServices)
    id!: string;

    detail: any | null = null;

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id')!;
        this.fetchDetail();
    }
    
    private fetchDetail() {
        this.api.getUserDetail(this.id).subscribe({
            next: (res) => {
                this.detail = {
                    ...res,
                  };
              },
              error: (e) => {
                this.snack.open('Failed to load project detail.', '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
              },
        })
    }

}

