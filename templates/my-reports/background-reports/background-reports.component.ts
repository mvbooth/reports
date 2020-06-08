import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatSort, MatTableDataSource } from '@angular/material';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataLayerService } from '../../../../data/data-layer.service';
import { ConfirmationDialogComponent } from '../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { NotificationService } from '../../../../shared/notification.service';
import { MYREPORTS } from '../../../report-data';
import { ReportService } from '../../../report-service';

interface IMyWindow extends Window {
  myFunction(): void;
}

@Component({
  selector: 'mvp-background-reports',
  templateUrl: './background-reports.component.html',
  styleUrls: ['./background-reports.component.scss'],
})

export class BackgroundReportsComponent implements OnInit, OnDestroy {

  @Output() eToggleLoading = new EventEmitter<any>(true);

  scheduledReportOutputList: any = [];
  tableData = MYREPORTS;
  dataSource: any;
  displayedColumns = ['report', 'description', 'time'];
  selectedRow: any;
  report: any;
  errorMessage: any;
  window: IMyWindow;
  disableActions = true;
  destroySubject$: Subject<void> = new Subject();

  // Notification || Dialog Data
  msgTitle = 'Empty Report';
  msgBody = ' you are trying to view does not contain data.';
  confirmButton = 'OK';
  reportInfo = {group: 'Background Reports', name: ''};

  // tslint:disable-next-line:max-line-length
  constructor(
    private _notifyService: NotificationService,
    private _dialog: MatDialog,
    private _datalayer: DataLayerService,
    public route: ActivatedRoute,
    private _reportService: ReportService ) { }

  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    this._reportService.updateReportInfo(this.reportInfo);
    this.getAllStaticReportsByUsers();
    const downloadId = this.route.snapshot.paramMap.get('downloadReportId');
    if (downloadId) {
      this.downLoadReport(downloadId);
    }
  }

  ngOnDestroy() {
    this.destroySubject$.next();
  }

  getAllStaticReportsByUsers() {
    this.eToggleLoading.emit(true);
    this._datalayer.getAllStaticReportsByUser().pipe(takeUntil(this.destroySubject$)).subscribe((obj: any) => {
      obj.forEach((curr) => {
        this.scheduledReportOutputList.push({
          report: curr.reportName,
          description: curr.reportDescription,
          time: curr.lastRunTimeStampString,
          param: curr.reportParameterVO,
          format: curr.outPutFormats,
          version: curr.versionName,
          emptyFlag: curr.reportIsEmpty,
        });
      });
      this.dataSource = new MatTableDataSource(this.scheduledReportOutputList);
      this.dataSource.sort = this.sort;
      this.dataSource.sort.direction = 'desc';
      this.dataSource.sort.active = 'time';
      this.sortData(this.dataSource.sort);
      this.eToggleLoading.emit(false);
    });
  }

  deleteReportOutput() {
    this.eToggleLoading.emit(true);
    this._datalayer.deleteRunInBackGroundOutput(this.selectedRow.description).pipe(takeUntil(this.destroySubject$)).subscribe(
      (deleteReport: any) => {
        this.scheduledReportOutputList.forEach(
          (obj, index) => {
            if (obj.description === this.selectedRow.description) {
              this.scheduledReportOutputList.splice(index, 1);
              this.dataSource = new MatTableDataSource(this.scheduledReportOutputList);
              this.dataSource.sort = this.sort;
            }
          },
        );
        this._notifyService.notify('success', 'Delete Successful', deleteReport.message.join(', '));
        this.selectedRow = null;
        this.disableActions = true;
        this.eToggleLoading.emit(false);
        this.sortData(this.dataSource.sort);
      }, (error) => {
        this.errorMessage = error;
        this._notifyService.notify('error', 'Unable to delete report', error.error.message);
        this.eToggleLoading.emit(false);
      },
    );
  }

  setSelectedRow(row: any) {
    this.selectedRow = row;
    if (row) {
      this.disableActions = false;
    }
  }

  downLoadReport(id) {
    const url = `/api/scheduleReports/downloadReport?storedReportId=${id}`;
    window.open(url);
  }

  getReports() {
    this.eToggleLoading.emit(true);
    this.scheduledReportOutputList.forEach(
      (obj) => {
        if (obj.description === this.selectedRow.description && obj.format === this.selectedRow.format) {
          this._datalayer.showSavedOutput(obj).pipe(takeUntil(this.destroySubject$)).subscribe(
            (reportUrl: any) => {
              if (this.selectedRow.emptyFlag) {
                const reportName = this.selectedRow.report.toLowerCase().indexOf('report') === -1
                  ? 'The ' + this.selectedRow.report + ' Report' : 'The ' + this.selectedRow.report;

                const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
                  data: {
                    title: this.msgTitle,
                    message: reportName + this.msgBody,
                    confirmButtonValue: this.confirmButton,
                    showCancel: false,
                  },
                });
                dialogRef.afterClosed().subscribe(() => {
                  window.open(reportUrl);
                  this.eToggleLoading.emit(false);
                });
              } else {
                window.open(reportUrl);
                this.eToggleLoading.emit(false);
              }
            },
            (error) => {
              this.errorMessage = error;
              this._notifyService.notify('error', 'Unable to open report', error.error.message);
              this.eToggleLoading.emit(false);
            },
          );
        }
    });
  }

  convertUtcToLocal(date: string): any {
    const format = 'MM/DD/YY hh:mm A';
    return moment(moment.utc(date, format).toDate()).local().format(format);
  }

  sortData(sort: Sort) {
    const data = this.scheduledReportOutputList.slice();
    if (!sort.active || sort.direction === '') {
      return;
    }

    const sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'report': return this.compare(a.report, b.report, isAsc);
        case 'description': return this.compare(a.description, b.description, isAsc);
        case 'time': return this.compareDates(a.time, b.time, isAsc);
        default: return 0;
      }
    });

    this.dataSource = new MatTableDataSource(sortedData);
  }

  compare(a: number | string | Date, b: number | string | Date, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  compareDates(a: Date, b: Date, isAsc: boolean) {
    return (moment(a).isBefore(b) ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
