import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import * as _sortBy from 'lodash/sortBy';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataLayerService } from '../data/data-layer.service';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { ReportControls } from './classes/ReportControls';
import { NavigationComponent } from './navigation/navigation.component';
import { ReportService } from './report-service';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'mvp-reports',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
})

export class ReportComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(NavigationComponent) navigation: NavigationComponent;
  @ViewChild(SidebarComponent) sidebar: SidebarComponent;

  isLoading = false;
  holdReportData: any;
  templateData: any;
  isFirstLoad: boolean;
  destroySubject$: Subject<void> = new Subject();
  reportInfo: any;

  constructor(
    private _reportService: ReportService,
    readonly _datalayer: DataLayerService,
    readonly _rc: ReportControls,
    private _dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private _router: ActivatedRoute) { }

  ngOnInit() {
    this.isLoading = true;
    this.isFirstLoad = true;
    this.loadDropdowns();
    this._reportService.getReportInfoData().subscribe((data) => {
      this.reportInfo = data;
      this.cdr.detectChanges();
    });
    this._reportService.showSideBar.subscribe((data: boolean) => {
      this.sidebar.showingReport = data;
    });
  }

  ngOnDestroy() {
    this.destroySubject$.next();
  }

  loadDropdowns(): any {
    this._datalayer.loadReportDropdowns().pipe(takeUntil(this.destroySubject$)).subscribe(
      (reportFolders) => {
        this.navigation.setReportsArr(this.alphabetizeDropdowns(reportFolders));
        this.isLoading = false;
        this.isFirstLoad = false;
      });
  }

  alphabetizeDropdowns(reports: any) {
    const holdReports = reports;
    holdReports.forEach(
      (obj, index) => {
        holdReports[index].reports = _sortBy(obj.reports, ['reportName']);
      },
    );
    return holdReports;
  }

  ngAfterViewInit() {

    this._reportService.validationStatus.pipe(takeUntil(this.destroySubject$)).subscribe(
      (formData) => {
        if (formData) {
          this.holdReportData = formData;
          this.enableReportActions();
        } else {
          this.disableReportActions();
        }
      },
    );

    this._rc.eFinishedReportAction.pipe(takeUntil(this.destroySubject$)).subscribe(
      (event) => {
        if (event) {
          this.isLoading = false;
          this.enableReportActions();
        } else {
          this.isLoading = false;
          this.disableReportActions();
        }
      },
    );
  }

  loadMyReport() {
    this.reportInfo = null;
    this.sidebar.showingReport = false;
  }

  getReportTitle(reportsArr: any, folder: string, reportId: string): any {
    const reportInfo: any = {};

    reportsArr.forEach(
      (rptFolder) => {
        if (folder === rptFolder.folderName) {
          reportInfo.group = rptFolder.folderName;
          rptFolder.reports.forEach(
            (report) => {
              if (report.id === reportId) {
                reportInfo.name = report.reportName;
                reportInfo.modified = moment(report.lastModifiedTime).format('MM/DD/YYYY h:mm:ss a');
              }
            },
          );
        }
      },
    );
    return reportInfo;
  }

  enableReportActions() {
    this.sidebar.reportValid = true;
  }

  disableReportActions() {
    this.sidebar.reportValid = false;
  }

  processFormAction(buttonClickedId: any) {
    this.isLoading = true;
    this.disableReportActions();

    const reportInfoObj = { folderName: this.reportInfo.group, reportName: this.reportInfo.name };
    const reportFetchData = Object.assign(reportInfoObj, this.holdReportData);
    switch (buttonClickedId) {
      case 1:
        // Run In Background
        this._rc.runInBackground(reportFetchData);
        break;
      case 2:
        // Generate Report
        if (reportFetchData.isLongReport) {
          this.isLoading = false;
          this.enableReportActions();
          const modal = this._dialog.open(ConfirmationDialogComponent, {
            data: {
              title: 'Notification',
              message: 'It is recommended to run this report in Background.',
              confirmButtonValue: 'Run In Background',
              cancelButtonValue: 'View Anyway',
              showCancel: true,
            },
          });
          modal.afterClosed().pipe(takeUntil(this.destroySubject$)).subscribe( ( result ) => {
            if (result) {
              this.isLoading = true;
              this.disableReportActions();
              this._rc.runInBackground( reportFetchData );
            } else if ( result === false ) {
              this.isLoading = true;
              this.disableReportActions();
              this._rc.generateReport( reportFetchData );
            }
          } );
        } else {
          this._rc.generateReport( reportFetchData );
        }
        break;
      case 3:
        // Schedule Report variable
        this.sidebar.reportFetchData = reportFetchData;
        this.isLoading = false;
        this.enableReportActions();
        break;
      case 4:
        // Save As Template
        reportFetchData.description = reportFetchData.description.trim();
        this._rc.saveTemplate(reportFetchData);
        break;
      case 5:
        // Update Template
        const oldNameTemplate = this._reportService.reportDescription;
        if (oldNameTemplate) {
          reportFetchData.newDescription = reportFetchData.description;
          reportFetchData.description = oldNameTemplate;
        } else {
          reportFetchData.newDescription = reportFetchData.description;
        }
        this._rc.updateTemplate(reportFetchData);
        break;
      case 6:
        // Update Schedule Prompts
        const oldName = this._reportService.reportDescription;
        if (oldName) {
          reportFetchData.newDescription = reportFetchData.description;
          reportFetchData.description = oldName;
        } else {
          reportFetchData.newDescription = reportFetchData.description;
        }
        this._rc.updateSchedulePrompts(reportFetchData);
        break;
    }
  }

  reportToastClosed() {
    this._rc.isNotificationTriggered = false;
  }
}
