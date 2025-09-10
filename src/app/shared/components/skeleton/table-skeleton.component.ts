import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from './skeleton.component';

@Component({
  selector: 'app-table-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="card border-0 shadow-sm">
      <div class="card-body p-4">
        <!-- Header Skeleton -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div class="skeleton-title">
            <app-skeleton type="title" width="200px"></app-skeleton>
          </div>
          <div class="d-flex gap-2">
            <app-skeleton type="text" width="100px" height="36px"></app-skeleton>
            <app-skeleton type="text" width="120px" height="36px"></app-skeleton>
          </div>
        </div>
        
        <!-- Filters Skeleton -->
        <div class="d-flex gap-3 mb-4 flex-wrap">
          <app-skeleton type="text" width="150px" height="40px"></app-skeleton>
          <app-skeleton type="text" width="150px" height="40px"></app-skeleton>
          <app-skeleton type="text" width="150px" height="40px"></app-skeleton>
          <app-skeleton type="text" width="150px" height="40px"></app-skeleton>
        </div>
        
        <!-- Table Skeleton -->
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th class="border-0">
                  <app-skeleton type="text" width="80%"></app-skeleton>
                </th>
                <th class="border-0">
                  <app-skeleton type="text" width="60%"></app-skeleton>
                </th>
                <th class="border-0">
                  <app-skeleton type="text" width="40%"></app-skeleton>
                </th>
                <th class="border-0">
                  <app-skeleton type="text" width="60%"></app-skeleton>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of rowsArray" class="align-middle">
                <td>
                  <app-skeleton type="text" width="90%"></app-skeleton>
                </td>
                <td>
                  <app-skeleton type="text" width="70%"></app-skeleton>
                </td>
                <td>
                  <app-skeleton type="text" width="50%"></app-skeleton>
                </td>
                <td>
                  <div class="d-flex gap-2">
                    <app-skeleton type="text" width="80px" height="32px"></app-skeleton>
                    <app-skeleton type="text" width="80px" height="32px"></app-skeleton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-title {
      flex: 1;
    }
  `]
})
export class TableSkeletonComponent {
  @Input() rows: number = 5;

  get rowsArray() {
    return Array.from({ length: this.rows }, (_, i) => i);
  }
}
