import { Component, HostListener, OnInit, ApplicationRef, ElementRef, ViewChild } from '@angular/core';

import { FileUploader, FileItem } from 'ng2-file-upload';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title: string;
  showProgress: boolean = false;
  fileContentObj: any = {};
  hasDropZoneOver:boolean = false;
  isOrigFileXml: boolean = false;
  uploader: FileUploader = new FileUploader({});
  @ViewChild('fileInput') public fileInput: ElementRef;
  @ViewChild('downloadLink') public downloadLink: ElementRef;
  harFileTags: Set<string> = new Set([
    'pages',
    'entries',
    'cookies',
    'queryString',
    'headers',
  ]);
  pageEntries = {};
  isOpenedEntryModal: boolean = false;
  entryInModal: any;

  constructor(private ref: ApplicationRef) { }

  ngOnInit() {
    this.setUploader();
  }

  xmlToObj(element) {
    if (this.harFileTags.has(element.tagName)) {
      //console.log(element.childNodes)
      return Array.from(element.childNodes).map(e => this.xmlToObj(e)).filter(e => {
        return (typeof e === 'string' && e.trim()) || !(typeof e === 'string')
      })
    } else {
      if (element.childNodes && element.childNodes.length > 1) {
        // console.log(element.childNodes)
        let data = {};
        for (let e of element.childNodes) {
          if (e.tagName) data[e.tagName] = this.xmlToObj(e);
        }
        return data
      } else {
        //console.log(element.textContent)
        return element.textContent
      }
    }

  }

  xmlToJson(data: string) {
    let xml = new DOMParser().parseFromString(data, "text/xml");
    let objData = {};
    objData[`${xml.documentElement.tagName}`] = this.xmlToObj(xml.documentElement);
    return objData
  }

  setUploader() {
    this.uploader.setOptions({
      // maxFileSize: 10000000000,
    })
    this.uploader.onWhenAddingFileFailed = (item, filter, options) => {
      console.log("Soubor se nepodařilo přidat");
      this.fileInput.nativeElement.value = '';
    }
    this.uploader.onAfterAddingFile = (file: FileItem) => {
      // console.log(file);
      let fr = new FileReader();
      fr.onload = (event) =>
        {
          let result = (event.target as FileReader).result;
          let obj = {};
          // console.log(result[0] === '<');
          if (result && result[0] === '<') {
            this.fileContentObj = this.xmlToJson(result)['log'];
            this.isOrigFileXml = true;
          } else {
            this.fileContentObj = JSON.parse(result).log;
            this.isOrigFileXml = false;
          }
          // Use log attr because important data are in log property
          console.log(this.fileContentObj);
          this.title = file.file.name;
          for (let entry of this.fileContentObj.entries || []) {
            this.pageEntries[entry.pageref] = this.pageEntries[entry.pageref] || [];
            this.pageEntries[entry.pageref].push(entry)
          }
        };
      fr.readAsText(file._file);
    }
  }

  removeFile() {
    this.uploader.queue[0].remove();
    this.fileContentObj = {};
    this.pageEntries = {};
    this.title = '';
  }

  fileOver(e:any):void {
    this.hasDropZoneOver = e;
  }

  getClassesForRequestMethod(method: string) {
    return {
      'ml-3 badge badge-pill': true,
      'badge-primary': method === 'GET' ? true : false,
      'badge-success': method !== 'GET' ? true : false
    }
  }

  getClassesForStatusCode(status: number) {
    return {
      'ml-3 badge badge-pill': true,
      'badge-primary': status >= 0 && status < 200 ? true : false,
      'badge-info': status >= 300 && status < 400 ? true : false,
      'badge-success': status >= 200 && status < 300 ? true : false,
      'badge-warning': status >= 400 && status < 500 ? true : false,
      'badge-danger': status >= 500 ? true : false,
    }
  }

  getDefaultPageTitle(ind: number): string {
    return `Page ${ind}`
  }

  downloadHarFile() {
    let fileName: string = `${this.title.replace('.', '_')}ToJson.har`;
    let jsonStr = JSON.stringify({log: this.fileContentObj}, undefined, 2);
    let dataType: string = `data:application/json`;

    if (jsonStr !== null && navigator.msSaveBlob) {
      return navigator.msSaveBlob(new Blob([jsonStr], { type: dataType }), fileName);
    }

    let data = new Blob([jsonStr], {type: dataType});
    let url:any = window.URL.createObjectURL(data);
    this.downloadLink.nativeElement.href = url;
    this.downloadLink.nativeElement.download = fileName;
    this.downloadLink.nativeElement.click();
    window.URL.revokeObjectURL(url);
  }

  entryModalCanceled() {
    this.isOpenedEntryModal = false;
    this.entryInModal = null;
  }

  openEntryModal(entry) {
    this.entryInModal = entry;
    this.isOpenedEntryModal = true;
  }
}
