import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from './skeleton.component';

@Component({
  selector: 'app-table-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="table-skeleton">
      <div class="table-skeleton__header">
        <div class="table-skeleton__title">
          <app-skeleton type="title" width="200px"></app-skeleton>
        </div>
        <div class="table-skeleton__actions">
          <app-skeleton type="text" width="100px" height="36px"></app-skeleton>
          <app-skeleton type="text" width="120px" height="36px"></app-skeleton>
        </div>
      </div>
      
      <div class="table-skeleton__filters">
        <app-skeleton type="text" width="150px" height="40px"></app-skeleton>
        <app-skeleton type="text" width="150px" height="40px"></app-skeleton>
        <app-skeleton type="text" width="150px" height="40px"></app-skeleton>
        <app-skeleton type="text" width="150px" height="40px"></app-skeleton>
      </div>
      
      <div class="table-skeleton__table">
        <div class="table-skeleton__thead">
          <div class="table-skeleton__th">
            <app-skeleton type="text" width="80%"></app-skeleton>
          </div>
          <div class="table-skeleton__th">
            <app-skeleton type="text" width="60%"></app-skeleton>
          </div>
          <div class="table-skeleton__th">
            <app-skeleton type="text" width="40%"></app-skeleton>
          </div>
          <div class="table-skeleton__th">
            <app-skeleton type="text" width="60%"></app-skeleton>
          </div>
        </div>
        
        <div class="table-skeleton__tbody">
          <div 
            *ngFor="let item of rowsArray" 
            class="table-skeleton__tr"
          >
            <div class="table-skeleton__td">
              <app-skeleton type="text" width="90%"></app-skeleton>
            </div>
            <div class="table-skeleton__td">
              <app-skeleton type="text" width="70%"></app-skeleton>
            </div>
            <div class="table-skeleton__td">
              <app-skeleton type="text" width="50%"></app-skeleton>
            </div>
            <div class="table-skeleton__td">
              <app-skeleton type="text" width="80px" height="32px"></app-skeleton>
              <app-skeleton type="text" width="80px" height="32px"></app-skeleton>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table-skeleton {
      padding: 20px;
    }

    .table-skeleton__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .table-skeleton__actions {
      display: flex;
      gap: 10px;
    }

    .table-skeleton__filters {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .table-skeleton__table {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }

    .table-skeleton__thead {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: 20px;
      padding: 15px 20px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }

    .table-skeleton__tbody {
      background-color: white;
    }

    .table-skeleton__tr {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: 20px;
      padding: 15px 20px;
      border-bottom: 1px solid #f0f0f0;
    }

    .table-skeleton__tr:last-child {
      border-bottom: none;
    }

    .table-skeleton__td {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .table-skeleton__th {
      display: flex;
      align-items: center;
    }
  `]
})
export class TableSkeletonComponent {
  @Input() rows: number = 5;

  get rowsArray() {
    return Array.from({ length: this.rows }, (_, i) => i);
  }
} 