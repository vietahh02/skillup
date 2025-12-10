import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SequenceService {

  constructor() { }

  calculateSequenceNumber(currentPage: number, pageSize: number, index: number): number {
    return (currentPage - 1) * pageSize + index + 1;
  }

  
  getSequenceNumbers(currentPage: number, pageSize: number, items: any[]): number[] {
    return items.map((_, index) => this.calculateSequenceNumber(currentPage, pageSize, index));
  }
}
