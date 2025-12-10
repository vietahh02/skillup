import { Component, Input, Output, EventEmitter, OnInit, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-otp-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './otp-input.component.html',
  styleUrls: ['./otp-input.component.scss']
})
export class OtpInputComponent implements OnInit, AfterViewInit {
  @Input() length: number = 6;
  @Input() disabled: boolean = false;
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();
  @Output() completed = new EventEmitter<string>();

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  otpValues: string[] = [];
  focusedIndex: number = 0;

  ngOnInit(): void {
    this.otpValues = Array(this.length).fill('');
    if (this.value && this.value.length === this.length) {
      this.otpValues = this.value.split('');
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.focusInput(0);
    }, 100);
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const key = event.key;

    if (key.length === 1 && !/^\d$/.test(key)) {
      event.preventDefault();
      return;
    }

    if (key === 'Backspace') {
      event.preventDefault();
      
      this.otpValues[index] = '';
      
      if (index > 0) {
        setTimeout(() => {
          this.focusInput(index - 1);
        }, 0);
      }
      
      this.updateValue();
      return;
    }

    // Xử lý Delete
    if (key === 'Delete') {
      event.preventDefault();
      this.otpValues[index] = '';
      this.updateValue();
      return;
    }

    // Xử lý số
    if (/^\d$/.test(key)) {
      event.preventDefault();
      
      // Chỉ update array, không set input.value trực tiếp
      this.otpValues[index] = key;
      this.updateValue();
      
      // Tự động chuyển sang ô tiếp theo
      if (index < this.length - 1) {
        setTimeout(() => {
          this.focusInput(index + 1);
        }, 0);
      }
      return;
    }

    // Xử lý mũi tên
    if (key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusInput(index - 1);
    } else if (key === 'ArrowRight' && index < this.length - 1) {
      event.preventDefault();
      this.focusInput(index + 1);
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text/plain') || '';
    const numbers = pastedData.replace(/\D/g, '').slice(0, this.length);

    if (numbers.length > 0) {
      // Điền các số vào các ô
      for (let i = 0; i < numbers.length && i < this.length; i++) {
        this.otpValues[i] = numbers[i];
        const input = this.otpInputs.toArray()[i]?.nativeElement;
        if (input) {
          input.value = numbers[i];
        }
      }

      // Focus vào ô cuối cùng đã điền hoặc ô tiếp theo
      const nextIndex = Math.min(numbers.length, this.length - 1);
      this.focusInput(nextIndex);
      
      this.updateValue();
    }
  }

  onFocus(index: number): void {
    this.focusedIndex = index;
    const input = this.otpInputs.toArray()[index]?.nativeElement;
    if (input) {
      input.select();
    }
  }

  onBlur(index: number): void {
    // Optional logic
  }

  focusInput(index: number): void {
    const input = this.otpInputs.toArray()[index]?.nativeElement;
    if (input) {
      input.focus();
      input.select();
    }
  }

  updateValue(): void {
    const otpString = this.otpValues.join('');
    this.valueChange.emit(otpString);

    // Emit completed event khi điền đủ
    if (otpString.length === this.length) {
      this.completed.emit(otpString);
    }
  }

  clear(): void {
    this.otpValues = Array(this.length).fill('');
    const inputs = this.otpInputs.toArray();
    inputs.forEach(input => {
      input.nativeElement.value = '';
    });
    this.updateValue();
    this.focusInput(0);
  }

  setValue(value: string): void {
    const numbers = value.replace(/\D/g, '').slice(0, this.length);
    this.otpValues = numbers.split('');
    while (this.otpValues.length < this.length) {
      this.otpValues.push('');
    }
    
    const inputs = this.otpInputs.toArray();
    inputs.forEach((input, i) => {
      input.nativeElement.value = this.otpValues[i];
    });
    
    this.updateValue();
  }
}
