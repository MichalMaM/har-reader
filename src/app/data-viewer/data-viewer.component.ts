import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-data-viewer',
  templateUrl: './data-viewer.component.html',
  styleUrls: ['./data-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataViewerComponent implements OnInit {
  _data: any;
  isViewMode: boolean = true;
  viewFailed: boolean = false;

  constructor(private element: ElementRef) { }

  ngOnInit() {
  }

  @Input()
  set data(data) {
    try {
      this._data = this.processData(data);
      this.viewFailed = false;
    } catch(e) {
      this._data = data;
      this.viewFailed = true;
    }
  }

  get data() {
    return this._data
  }

  get markdownData() {
    return '\n```javascript\n\n' + this.data + '\n\n```\n'
  }

  toogleMode() {
    this.isViewMode = !this.isViewMode;
  }

  processData(data) {
    if (typeof data === 'string') {
      return JSON.stringify(JSON.parse(data), undefined, 2)
    }
    return JSON.stringify(data, undefined, 2)
  }

}
