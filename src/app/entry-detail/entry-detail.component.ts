import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';

import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'app-entry-detail',
  templateUrl: './entry-detail.component.html',
  styleUrls: ['./entry-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntryDetailComponent implements OnInit, AfterViewInit {
  @ViewChild('entryModal') public entryModal: ModalDirective;
  @Output() canceled = new EventEmitter<boolean>();
  @Input() entry: any;
  tabs = [
    {
      title: 'Full entry data',
      data: (entry) => {
        return entry
      }
    },
    {
      title: 'Response data',
      data: (entry) => {
        return entry.response.content.text
      }
    },
    {
      title: 'Response headers',
      data: (entry) => {
        return entry.response.headers
      }
    },
    {
      title: 'Response cookies',
      data: (entry) => {
        return entry.response.cookies
      }
    },
    {
      title: 'Request headers',
      data: (entry) => {
        return entry.request.headers
      }
    },
    {
      title: 'Request cookies',
      data: (entry) => {
        return entry.request.cookies
      }
    }
  ]
  selectedTab: any;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.entryModal.onHide.subscribe(modal => this.cancel());
    this.entryModal.show();
  }

  public cancel() {
    this.canceled.emit(false);
  }

  selectTab(tab) {
    this.selectedTab = tab;
  }
}
