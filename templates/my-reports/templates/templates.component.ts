import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import {MatSort, MatTableDataSource} from '@angular/material';
import {Sort} from '@angular/material/sort';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataLayerService } from '../../../../data/data-layer.service';
import { NotificationService } from '../../../../shared/notification.service';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
})
export class TemplatesComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() eToggleLoading = new EventEmitter<any>(true);
  @Output() eLoadTemplate = new EventEmitter<any>();

  columnsToDisplay = ['reportName', 'reportDescription', 'lastModified'];
  templateReportOutputList: any = [];
  tableData: any;
  selectedRow: any;
  disableActions = true;
  destroySubject$: Subject<void> = new Subject();
  reportInfo = {group: 'Templates', name: ''};

  constructor(
    private _dataLayer: DataLayerService, 
    private _notifyService: NotificationService,
    private _reportService: ReportService,
    private _router: Router) { }

  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    this._reportService.updateReportInfo(this.reportInfo);
  }

  ngAfterViewInit() {
    this.loadTemplateTable();
  }

  loadTemplateTable() {
    this.templateReportOutputList = [];
    this.eToggleLoading.emit(true);
    this._dataLayer.getAllReportTemplatesByUser().pipe(takeUntil(this.destroySubject$)).subscribe(
      (templates: any) => {
        templates.forEach(
          (obj) => {
            const lastModified = obj.lastModifiedTimeStampString;
            this.templateReportOutputList.push({
              reportName: obj.reportName,
              reportDescription: obj.reportDescription,
              lastModified,
            });
          },
        );
        this.tableData = new MatTableDataSource(this.templateReportOutputList);
        this.tableData.sort = this.sort;
        this.tableData.sort.active = 'lastModified';
        this.tableData.sort.direction = 'desc';
        this.sortData(this.tableData.sort);
        this.eToggleLoading.emit(false);
      });
  }

  setSelectedRow(row: any) {
    this.selectedRow = row;
    if (row) {
      this.disableActions = false;
    }
  }

  deleteTemplate() {
    this.eToggleLoading.emit(true);
    if (this.selectedRow) {
      this._dataLayer.deleteTemplate(this.selectedRow.reportDescription).pipe(takeUntil(this.destroySubject$)).subscribe(
        (obj) => {
          this._notifyService.notify('success', 'Success', 'Delete Successful');
          this.tableData.sort = this.sort;
          this.loadTemplateTable();
        },
        (error) => {
          this._notifyService.notify('error', 'Error', 'Unable to delete report');
          this.eToggleLoading.emit(false);
        },
      );
    } else {
      this._notifyService.notify('info', 'Info', 'Please select a row to delete');
      this.eToggleLoading.emit(false);
    }
  }

  loadTemplate() {
    if (this.selectedRow) {
      this._reportService.showingReportTemplate = true;
      this._reportService.loadTemplateFromSchedule = false;
      this._router.navigateByUrl(
        `report/${this.selectedRow.reportName.replace(/ /g, '-').toLowerCase()}/${encodeURIComponent(this.selectedRow.reportDescription)}`);
    } else {
      this._notifyService.notify('info', 'Info', 'Please select a row to load a template');
      this.eToggleLoading.emit(false);
    }
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  sortData(sort: Sort) {
    const data = this.templateReportOutputList.slice();
    if (!sort.active || sort.direction === '') {
      return;
    }

    const sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'reportName': return this.compare(a.reportName, b.reportName, isAsc);
        case 'reportDescription': return this.compare(a.reportDescription, b.reportDescription, isAsc);
        case 'lastModified': return this.compareDates(a.lastModified, b.lastModified, isAsc);
        default: return 0;
      }
    });

    this.tableData = new MatTableDataSource(sortedData);
  }

  compare(a: number | string | Date, b: number | string | Date, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  compareDates(a: Date, b: Date, isAsc: boolean) {
    return (moment(a).isBefore(b) ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
