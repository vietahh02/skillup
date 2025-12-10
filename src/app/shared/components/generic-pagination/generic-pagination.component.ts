import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PaginationInfo } from './generic-pagination.model';

@Component({
  selector: 'app-generic-pagination',
  imports: [
    CommonModule,
    MatPaginatorModule
  ],
  templateUrl: './generic-pagination.component.html',
  styleUrl: './generic-pagination.component.scss'
})
export class GenericPaginationComponent {
  @Input() pagination!: PaginationInfo;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  @Input() loading: boolean = false;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  onPaginatorChange(event: PageEvent) {
    if (event.pageSize !== this.pagination.pageSize) {
      this.pageSizeChange.emit(event.pageSize);
    } else {
      this.pageChange.emit(event.pageIndex + 1);
    }
  }
}

