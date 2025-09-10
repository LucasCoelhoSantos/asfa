import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="skeleton"
      [class]="'skeleton--' + type"
      [style.width]="width"
      [style.height]="height"
      [style.border-radius]="borderRadius"
    ></div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      display: inline-block;
    }

    .skeleton--text {
      height: 1em;
      border-radius: 4px;
    }

    .skeleton--title {
      height: 1.5em;
      border-radius: 4px;
    }

    .skeleton--avatar {
      border-radius: 50%;
    }

    .skeleton--card {
      border-radius: 8px;
    }

    .skeleton--table-row {
      height: 60px;
      border-radius: 4px;
    }

    @keyframes loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `]
})
export class SkeletonComponent {
  @Input() type: 'text' | 'title' | 'avatar' | 'card' | 'table-row' = 'text';
  @Input() width: string = '100%';
  @Input() height: string = '1em';
  @Input() borderRadius: string = '4px';
}
