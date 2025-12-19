import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-register',
    imports: [CommonModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, ReactiveFormsModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

    hide = true;
    hideConfirm = true;
    registerForm!: FormGroup;

    constructor(private fb: FormBuilder) {
        this.registerForm = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(200)]],
            email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
            password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(25), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)]],
            confirmPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(25), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)]]
        });
    }

    onSubmit() {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }

        const { password, confirmPassword } = this.registerForm.value;
        if (password !== confirmPassword) {
            // You can add a custom validator or show error message here
            return;
        }

        // Handle registration logic here
    }

}