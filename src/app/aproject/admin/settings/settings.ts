import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class SettingsComponent implements OnInit {
  aiApiKey: string = '';
  isLoading = false;
  showApiKey = false;

  constructor(
    private settingsService: SettingsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAiKey();
  }

  loadAiKey(): void {
    this.isLoading = true;
    this.settingsService.getAiKey().subscribe({
      next: (data) => {
        this.aiApiKey = data.apiKey;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load API key', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  saveAiKey(): void {
    if (!this.aiApiKey || this.aiApiKey.trim() === '') {
      this.snackBar.open('API key cannot be empty', 'Close', { duration: 3000 });
      return;
    }

    if (!confirm('Update AI API Key?')) {
      return;
    }

    this.isLoading = true;
    this.settingsService.updateAiKey(this.aiApiKey).subscribe({
      next: (data) => {
        this.aiApiKey = data.apiKey;
        this.snackBar.open('AI API Key updated successfully', 'Close', { duration: 3000 });
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to update API key', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }
}
