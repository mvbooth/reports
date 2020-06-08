import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatSort, MatTableDataSource } from '@angular/material';
import {Sort} from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import * as _moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataLayerService } from '../../../../data/data-layer.service';
import { ConfirmationDialogComponent } from '../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { NotificationService } from '../../../../shared/notification.service';
import { MYREPORTS } from '../../../report-data';
import { ReportService } from '../../../report-service';
import { ReportComponent } from '../../../report.component';

const moment = _moment;
@Component({
  selector: 'mvp-scheduled-report-output',
  templateUrl: './scheduled-report-output.component.html',
  styleUrls: ['./scheduled-report-output.component.scss'],
})
export class ScheduledReportOutputComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() eToggleLoading = new EventEmitter<any>(true);

  columnsToDisplay = ['report', 'description', 'lastRun'];
  scheduledReportOutputList: any = [];
  chosenScheduledReportOutputList: any = [];
  tableData = MYREPORTS;
  dataSource: any;
  showReportOutput = false;
  selectedDescription: any;
  selectedVersionDate: any;
  reportPath: any;
  disableActions = true;
  historyDataSource: any;
  disableHistoryActions = true;
  selectedHistoryRow: any;
  isLoading: boolean;
  errorMessage: any;
  scheduleHistory: any[];
  destroySubject$: Subject<void> = new Subject();
  reportInfo = {group: 'Scheduled Report Output', name: ''};

  // Notification || Dialog Data
  msgTitle = 'Empty Report';
  msgBody = ' you are trying to view does not contain data.';
  confirmButton = 'OK';

  constructor(
    private route: ActivatedRoute,
    private _datalayer: DataLayerService,
    private _dialog: MatDialog,
    private _notify: NotificationService,
    private _reportService: ReportService) { }

  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    this._reportService.updateReportInfo(this.reportInfo);
    const downloadId = this.route.snapshot.paramMap.get('downloadReportId');
    if (downloadId) {
      this.downLoadReport(downloadId);
    }
   }

  ngOnDestroy() {
    this.destroySubject$.next();
  }

  ngAfterViewInit() {
    this.getScheduledReportOutputList();
  }

  downLoadReport(id) {
    const url = `/api/scheduleReports/downloadReport?storedReportId=${id}`;
    window.open(url);
  }

  getScheduledReportOutputList() {
    this.eToggleLoading.emit(true);
    this._datalayer.getAllScheduleReportOutputsByUser().pipe(takeUntil(this.destroySubject$)).subscribe((obj: any) => {
      if (obj.length > 0) {
        obj.forEach((curr) => {
          this.scheduledReportOutputList.push({
            report: curr.reportName,
            description: curr.reportDescription,
            frequency: curr.reportFrequency,
            lastrun: curr.lastRunTimeStampString,
          });
        });
      } else {
        this._notify.notify('info', 'Information', 'No schedules were found.');
        this.eToggleLoading.emit(false);
      }
      this.dataSource = new MatTableDataSource(this.scheduledReportOutputList);
      this.dataSource.sort = this.sort;
      this.dataSource.sort.active = 'lastrun';
      this.dataSource.sort.direction = 'desc';
      this.sortData(this.dataSource.sort);
      this.eToggleLoading.emit(false);
    });
  }

  convertUTCtoLocal(utc: any) {
    utc = new Date(utc);
    return moment(new Date(utc.getTime() - (utc.getTimezoneOffset() * 60 * 1000))).format('MM/DD/YY hh:mm A');
  }

  getHistory() {
    this.isLoading = true;
    this.scheduleHistory = [];
    const viewName = this.selectedDescription;

    this._datalayer.getScheduleReportOutputs(viewName).pipe(takeUntil(this.destroySubject$)).subscribe((obj: any) => {
      obj.forEach((item: any) => {
        if (item.searchPath.includes(viewName)) {
          this.scheduleHistory.push({
            description: viewName,
            runDate: this.convertUTCtoLocal(item.reportSubmissionTime),
            status: item.status,
            versionDate: item.reportName,
            emptyFlag: item.reportIsEmpty,
          });
        }
      });

      if (this.scheduleHistory.length < 1) {
        this._notify.notify('info', 'Information', 'No output history found for selected schedule.');
      }

      // Sorted records
      this.scheduleHistory.sort((a, b) => (a.reportSubmissionTime > b.reportSubmissionTime) ? 1 : -1);

      // Sorted again
      this.scheduleHistory.sort((a, b) => (a.reportSubmissionTime > b.reportSubmissionTime) ? -1 : 1);

      let filteredList: any;
      if (this.scheduleHistory.length > 2) {
        filteredList = this.scheduleHistory.slice(0, 3);
      } else {
        filteredList = this.scheduleHistory;
      }

      this.historyDataSource = new MatTableDataSource(filteredList);
      this.historyDataSource.sort = this.sort;
      this.isLoading = false;
    },
      (error) => {
        this.errorMessage = error;
        this._notify.notify('error', 'Error', error.error.message);
        this.isLoading = false;
      },
    );
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
        case 'frequency': return this.compare(a.frequency, b.frequency, isAsc);
        case 'lastrun': return this.compareDates(a.lastrun, b.lastrun, isAsc);
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

  deleteOutput() {
    this.eToggleLoading.emit(true);
    this._datalayer.deleteScheduledOutput(this.selectedDescription).pipe(takeUntil(this.destroySubject$)).subscribe((deleteReport: any) => {
      if (deleteReport.statusCode === 200) {
        this.scheduledReportOutputList.forEach(
          (obj, index) => {
            if (obj.description === this.selectedDescription) {
              this.scheduledReportOutputList.splice(index, 1);
              this.tableData = new MatTableDataSource(this.scheduledReportOutputList);
            }
          },
        );
        this._notify.notify('success', 'Delete Successful', deleteReport.message.join(', '));
        this.dataSource = new MatTableDataSource(this.scheduledReportOutputList);
        this.historyDataSource = [];
        this.disableHistoryActions = true;
        this.eToggleLoading.emit(false);
        this.sortData(this.sort);
      }
    },
      (error) => {
        this.errorMessage = error;
        this._notify.notify('error', 'Error', error.error.message);
        this.eToggleLoading.emit(false);
      });
  }

  fetchReport() {
    const viewName = this.selectedDescription;
    const versionDate = this.selectedVersionDate;
    let reportName;
    let isEmpty;

    for (const report of this.historyDataSource.data) {
      if (report.versionDate === versionDate) {
        isEmpty = report.emptyFlag;
      }
    }

    this._datalayer.getScheduledOutputUrl(viewName, versionDate).pipe(takeUntil(this.destroySubject$)).subscribe((obj) => {
      this.reportPath = obj.toString();

      if (isEmpty) {
        for (const report of this.dataSource.data) {
          if (report.description === viewName) {
            reportName = report.report.toLowerCase().indexOf('report') === -1
              ? 'The ' + report.report + ' Report' : 'The ' + report.report;
          }
        }

        const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
          data: {
            title: this.msgTitle,
            message: reportName + this.msgBody,
            confirmButtonValue: this.confirmButton,
            showCancel: false,
          },
        });
        dialogRef.afterClosed().subscribe(() => {
          window.open(this.reportPath);
        });
      } else {
        window.open(this.reportPath);
      }
    });
  }

  selectRow(viewName: any) {
    this.selectedDescription = viewName;
    if (viewName) {
      this.disableActions = false;
    }
  }

  selectHistoryRow(description: any, versionDate: any) {
    this.selectedDescription = description;
    this.selectedVersionDate = versionDate;
    if (description && versionDate) {
      this.disableHistoryActions = false;
    }
  }

  applyFilter(filterValue: string) {
    if (filterValue) {
      filterValue = filterValue.trim();
      filterValue = filterValue.toLowerCase();
    } else {
      filterValue = '';
    }
    this.dataSource.filter = filterValue;
  }
}
