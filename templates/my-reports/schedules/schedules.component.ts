import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataLayerService } from '../../../../data/data-layer.service';
import { NotificationService } from '../../../../shared/notification.service';
import { ScheduleReportComponent } from '../../../modals/schedule-report/schedule-report.component';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss'],
})

export class SchedulesComponent implements OnInit, OnDestroy, AfterViewInit {
  columnsToDisplay = ['report', 'description', 'frequency'];
  @Output() eToggleLoading = new EventEmitter<any>(true);
  @Output() eLoadTemplate = new EventEmitter<any>();

  schedules: any;
  subArray: Subscription[] = [];
  isLoading: boolean;
  tableData: MatTableDataSource<{}>;
  editScheduleData: any;
  reportName: any;
  selectedRow: any;
  disableActions = true;
  destroySubject$: Subject<void> = new Subject();
  reportInfo = {group: 'Schedules', name: ''};

  constructor(
    private _reportService: ReportService,
    private _dataLayerService: DataLayerService,
    private _notify: NotificationService,
    private _dialog: MatDialog,
    private readonly _router: Router) { }

  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    this._reportService.updateReportInfo(this.reportInfo);
   }

  ngAfterViewInit() {
    this.getUserSchedules();
  }

  getUserSchedules() {
    this.schedules = [];
    this.eToggleLoading.emit(true);
    this._dataLayerService.getAllSchedulesForUser().pipe(takeUntil(this.destroySubject$)).subscribe(
      (schedules: any) => {
        schedules.forEach(
          (obj) => {
            this.schedules.push({
              report: obj.reportName,
              description: obj.reportDescription,
              frequency: obj.reportFrequency,
            });
          },
        );
        this.tableData = new MatTableDataSource(this.schedules);
        this.tableData.sort = this.sort;
        this.eToggleLoading.emit(false);
      });
  }

  openScheduleModal(scheduleData) {
    if (!scheduleData) {
      this._notify.notify('error', 'Error!', `No data found for schedule report ${this.reportName}`);
    } else {
      const editSchedule = this._dialog.open(ScheduleReportComponent, {
        data: {
          scheduleData,
          isEditSchedule: true,
          reportName: this.reportName,
        },
        width: '70vw',
      });
      editSchedule.afterClosed().pipe(takeUntil(this.destroySubject$)).subscribe(() => {
        this.getUserSchedules();
        this.disableActions = true;
      });
    }
  }

  editSchedule(reportDescription, reportName) {
    this.eToggleLoading.emit(true);
    this.isLoading = true;
    this.reportName = reportName;
    this.subArray.push(this._dataLayerService.editSchedule(reportDescription.toString())
      .subscribe((response: any) => {
        this.editScheduleData = response;
        this.eToggleLoading.emit(false);
        this.isLoading = false;
        this.openScheduleModal(this.editScheduleData);
      }));
  }

  loadPrompts(reportDescription) {
    if (this.selectedRow) {
      this._reportService.loadTemplateFromSchedule = true;
      this._reportService.showingReportTemplate = false;
      this._router.navigateByUrl(
        `report/${this.selectedRow.report.replace(/ /g, '-').toLowerCase()}/${encodeURIComponent(reportDescription)}`);
    } else {
      // put this notify back
    }

  }

  deleteSchedule() {
    this.eToggleLoading.emit(true);
    this.isLoading = true;
    this.subArray.push(this._dataLayerService.deleteSchedule(this.selectedRow.description)
      .subscribe((response: any) => {
        if (response.statusCode === 200) {
          this._notify.notify('success', 'Success', response.message);
          this.eToggleLoading.emit(false);
          this.isLoading = false;
          this.getUserSchedules();
          this.disableActions = true;
        }
      }, (error) => {
        if (error.error) {
          this._notify.notify('error', error.error.status, error.error.message[0]);
        }
      },
    ));
  }

  applyFilter(filterValue: string) {
    if (filterValue) {
      filterValue = filterValue.trim();
      filterValue = filterValue.toLowerCase();
    } else {
      filterValue = '';
    }
    this.tableData.filter = filterValue;
  }

  setSelectedRow(row: any) {
    this.selectedRow = row;
    this.disableActions = false;
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }
}
