import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PaginationInfo } from '../../services/state.service';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  @Input() pagination: PaginationInfo | null = null;
  @Input() currentPage: number = 0;
  @Input() loading: boolean = false;
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  pageSizeOptions = [5, 10, 20, 50];

  get isFirstPage(): boolean {
    return this.pagination ? this.pagination.first : true;
  }

  get isLastPage(): boolean {
    return this.pagination ? this.pagination.last : true;
  }

  get totalPages(): number {
    return this.pagination ? this.pagination.totalPages : 0;
  }

  get totalElements(): number {
    return this.pagination ? this.pagination.totalElements : 0;
  }

  get pageSize(): number {
    return this.pagination ? this.pagination.size : 10;
  }

  get startElement(): number {
    return this.currentPage * this.pageSize + 1;
  }

  get endElement(): number {
    const end = (this.currentPage + 1) * this.pageSize;
    return Math.min(end, this.totalElements);
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const newSize = parseInt(select.value);
    this.pageSizeChange.emit(newSize);
  }

  getPageNumbers(): number[] {
    if (!this.pagination) return [];

    const totalPages = this.pagination.totalPages;
    const currentPage = this.pagination.number;
    const pages: number[] = [];

    pages.push(0);

    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (i > 0 && i < totalPages - 1) {
        pages.push(i);
      }
    }

    if (totalPages > 1) {
      pages.push(totalPages - 1);
    }

    return pages;
  }
}
