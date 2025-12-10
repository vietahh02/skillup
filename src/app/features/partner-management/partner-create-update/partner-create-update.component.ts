import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBar } from "@angular/material/progress-bar";
import { CreateUpdatePartnerDto, CreateUpdatePartnerRequest, PartnerDetail } from '../../../models/partner.model';
import { TranslatePipe } from '../../../utils/translate.pipe';
import { LanguageService } from '../../../services/language.service';
import { ApiPartnerServices } from '../../../services/partner.service';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { GeoCity, GeoTownship } from '../../../models/geo.model';
import { ApiGeoServices } from '../../../services/geo.service';
import { generateUUID } from '../../../utils/uuid.util';

interface PartnerSelectOption {
  code: string;
  label?: string;
  labelKey?: string;
}

@Component({
  selector: 'app-partner-create-update',
  imports: [
    CommonModule,
    ReactiveFormsModule,  
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBar,
    TranslatePipe,
    FileUploadModule
],
  templateUrl: './partner-create-update.component.html',
  styleUrl: './partner-create-update.component.scss'
})
export class PartnerCreateUpdateComponent {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  detail: PartnerDetail | null = null;

  @Input() typeOptions: PartnerSelectOption[] = [
    { code: 'SUPPLIER', labelKey: 'system.partner.partnerTypeSupplier' },
    { code: 'SELLER', labelKey: 'system.partner.partnerTypeSeller' },
    { code: 'BOTH', labelKey: 'system.partner.partnerTypeBoth' },
  ];

  cityOptions: GeoCity[] = [];
  townshipOptions: GeoTownship[] = [];

  isEdit = false;
  partnerId?: string | number;
  loading = false;
  submitting = false;

    form = this.fb.group({
      partnerName: ['', [Validators.required, Validators.maxLength(255)]],
      partnerCode: ['', [Validators.required, Validators.maxLength(255)]],
      partnerType: ['', [Validators.required]],
      cityId: ['', [Validators.required]],
      townshipId: [{value: '', disabled: true}, [Validators.required]],
      address: ['', [Validators.required, Validators.maxLength(255)]],
      contactPhone: ['', [Validators.required, Validators.maxLength(255), 
          Validators.pattern(/^\+?[0-9]{1,3}?[-.\s()]?[0-9]{1,4}[-.\s()]?[0-9]{3,4}[-.\s()]?[0-9]{3,4}$/)
      ]],
      email: ['', [Validators.required, Validators.maxLength(255), Validators.email]],
      contactPerson: ['', [Validators.required, Validators.maxLength(255)]],
      taxId: ['', [Validators.maxLength(255)]],
      notes: ['', [Validators.maxLength(5000)]],

      contractNumber: ['', [Validators.required, Validators.maxLength(255)]],
      // phoneNumber: ['', [Validators.required, Validators.maxLength(255), 
      //     Validators.pattern(/^\+?[0-9]{1,3}?[-.\s()]?[0-9]{1,4}[-.\s()]?[0-9]{3,4}[-.\s()]?[0-9]{3,4}$/)
      // ]],
      contractStartDate: ['', [Validators.required]],
      contractEndDate: ['', [Validators.required]],
      file: [null as File | null, []],
    }, { validators: this.contractEndDateValidator });

  constructor(
    private router: Router,
    private apiPartner: ApiPartnerServices,
    private snack: MatSnackBar,
    private translate: LanguageService,
    private apiGeo: ApiGeoServices,
  ) {
    this.loadCity();
  }

  ngOnInit(): void {
    const url = this.route.snapshot.routeConfig?.path;
    this.isEdit = url?.includes('edit') ?? false;
    this.partnerId = this.route.snapshot.paramMap.get('id') ?? undefined;

    if (this.isEdit && this.partnerId) {
        this.loadDetail(this.partnerId);
    }

    this.form.get('cityId')?.valueChanges.subscribe(cityId => {
      if (cityId && cityId !== null && cityId !== '') {
        this.form.get('townshipId')?.enable();
        this.loadTownship(cityId);
      } else {
        this.form.get('townshipId')?.disable();
        this.townshipOptions = [];
        this.form.get('townshipId')?.setValue('');
      }
    });
  }

  private loadDetail(id: string | number) {
    this.loading = true
    this.submitting = true;
    this.apiPartner
      .getPartnerDetail(id)
      .pipe(finalize(() => {
        this.loading = false
        this.submitting = false;
      }))
      .subscribe({
        next: (res: PartnerDetail) => {
          this.detail = res || null;

          this.form.patchValue({
            partnerName: res?.partnerName ?? '',
            partnerCode: res?.partnerCode ?? '',
            partnerType: res?.partnerType ?? '',
            cityId: res?.cityId ?? '',
            townshipId: res?.townshipId ?? '',
            address: res?.address ?? '',
            contactPhone: res?.contactPhone ?? '',
            email: res?.contactEmail ?? '',
            contactPerson: res?.contactPerson ?? '',
            taxId: res?.taxId ?? '',
            notes: res?.notes ?? '',
            contractNumber: res?.contractNumber ?? '',
            contractStartDate: res?.contractStartDate ?? '',
            contractEndDate: res?.contractEndDate ?? '',
            // file: res?.fileContractId ?? null,
          });

          this.form.markAsPristine();
        },
        error: (e) => {
            this.snack.open(this.translate.translate('system.partner.loadPartnerDetailFailed'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
        },
      });   
  }

  private loadCity() {
    this.apiGeo.getCities().subscribe({
      next: (res: GeoCity[]) => {
        this.cityOptions = res;
      },
    });
  }

  private loadTownship(cityId: number | string) {
    this.form.get('townshipId')?.setValue('');
    // this.loading = true;
    this.apiGeo.getTownships(cityId)
      .pipe(finalize(() => {
        // this.loading = false;
      }))
      .subscribe({
        next: (res: GeoTownship[]) => {
          this.townshipOptions = res;
        },
      });
  }

  onBack() {
    this.router.navigate(['/system/partner-management']);
  }

  getTileName() {
    return !this.isEdit
      ? this.translate.translate('system.partner.createNewPartner')
      : this.translate.translate('system.partner.editPartnerTitle', { partnerName: this.detail?.partnerName || '' });
  }
  
  submitButtonText(): string {
    return this.isEdit ? this.translate.translate('common.update') : this.translate.translate('common.create');
  }

  formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() từ 0–11
    const day = String(date.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }  

  onSubmit() {
    console.log(this.form.getRawValue());
    this.form.markAllAsTouched();
    console.log('form invalid:', this.form);
    if (this.form.invalid) {
      this.snack.open(this.translate.translate('common.formInvalid'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
      return;
    } 

    console.log(this.form.getRawValue());

    this.loading = true;
    this.submitting = true;

    const formVal = this.form.getRawValue();
    const request: CreateUpdatePartnerRequest = {
      partnerCode: formVal.partnerCode || '',
      partnerType: formVal.partnerType || '',
      partnerName: formVal.partnerName || '',
      cityId: formVal.cityId || '',
      townshipId: formVal.townshipId || '',
      address: formVal.address || '',
      contactPhone: formVal.contactPhone || '',
      contactEmail: formVal.email || '',
      contactPerson: formVal.contactPerson || '',
      taxId: formVal.taxId || '',
      notes: formVal.notes || '',
      contractNumber: formVal.contractNumber || '',
      // phoneNumber: formVal.phoneNumber || '',
      contractStartDate: this.formatDateToYYYYMMDD(new Date(formVal.contractStartDate || '')),
      contractEndDate: this.formatDateToYYYYMMDD(new Date(formVal.contractEndDate || '')),
      requestId: generateUUID(),
    };
    if (this.isEdit) {
      request.id = this.partnerId;
    }

    const payload : CreateUpdatePartnerDto = {
      request: request,
      files: formVal.file ? [formVal.file] : [],
    };
    console.log(payload);

    if (this.isEdit) {
      this.apiPartner.updatePartner(this.partnerId!, payload)
        .pipe(finalize(() => {
          this.submitting = false;
          this.loading = false;
        }))
        .subscribe({
          next: () => {
            this.snack.open(this.translate.translate('system.partner.updatePartnerSuccess'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            this.onBack();
          },
          error: (e: any) => {
            this.snack.open(e?.error?.errorMessage || this.translate.translate('system.partner.updatePartnerFailed'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          }
        });
    } else {
      this.apiPartner.createPartner(payload)
        .pipe(finalize(() => {
          this.submitting = false;
          this.loading = false;
        }))
        .subscribe({
          next: () => {
            this.snack.open(this.translate.translate('system.partner.createPartnerSuccess'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            this.onBack();
          },
          error: (e: any) => {
            this.snack.open(e?.error?.errorMessage || this.translate.translate('system.partner.createPartnerFailed'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          }
        });
    }
  }

  onUpload(event: any) {
    console.log(event);
  }

  contractEndDateValidator(control: AbstractControl): ValidationErrors | null {
    const contractEndDate = control.get('contractEndDate')?.value;
    const contractStartDate = control.get('contractStartDate')?.value;
    
    if (!contractEndDate || !contractStartDate) {
      return null;
    }
    
    const contractEndDateDate = new Date(contractEndDate);
    const contractStartDateDate = new Date(contractStartDate);
    
    contractEndDateDate.setHours(0, 0, 0, 0);
    contractStartDateDate.setHours(0, 0, 0, 0);
    
    if (contractEndDateDate <= contractStartDateDate) {
      control.get('contractEndDate')?.setErrors({ rangeDate: true });
      return null;
    }else {
      control.get('contractEndDate')?.setErrors(null);
    }
    
    return null;
  }
}
