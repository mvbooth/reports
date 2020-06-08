import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataLayerService } from '../data/data-layer.service';
import { AuthService } from '../shared/auth.service';
import { NotificationService } from '../shared/notification.service';
import { ReportControls } from './classes/ReportControls';

@Injectable()
export class ReportService implements OnDestroy {

    loadTemplateFromSchedule = false;
    showingReportTemplate = false;
    reportDescription = '';

    constructor(
        private readonly _authService: AuthService,
        private readonly _notifyService: NotificationService,
        private readonly _dataLayer: DataLayerService,
        private readonly _rc: ReportControls) {

        this._dataLayer.launchMainPage().pipe(takeUntil(this.destroySubject$)).subscribe(
            (reportPrefs) => { this.reportPrefs = reportPrefs; },
        );

    }

    reportPrefs: any;

    reportName: any;

    reportGroup: any;

    destroySubject$: Subject<void> = new Subject();

    private reportDataSource = new Subject();

    private templateDataSource = new Subject();

    private reportValidDataSource = new Subject();
    validationStatus = this.reportValidDataSource.asObservable();

    private reportInfoDataSource = new Subject();
    reportInfo = this.reportInfoDataSource.asObservable();

    private showSideBarDataSource = new Subject();
    showSideBar = this.showSideBarDataSource.asObservable();

    ngOnDestroy() {
        this.destroySubject$.next();
    }

    getReportData() {
       return this.reportDataSource.asObservable();
    }

    getReportInfo() {
        return this.reportInfoDataSource.asObservable();
    }

    getTemplateData() {
        return this.templateDataSource.asObservable();
    }

    getReportInfoData() {
        return this.reportInfoDataSource.asObservable();
    }

    handleInit(templateName, reportInfo) {
        this.reportInfoDataSource.next(reportInfo);
        this.reportDescription = templateName;
        
        if (templateName) {
            if (this.loadTemplateFromSchedule) {
                this.loadReport(reportInfo.name, reportInfo.group, templateName, true);
             
            } else {
                this.loadReport(reportInfo.name, reportInfo.group, templateName, false);
                this.showingReportTemplate = true;
            }
        } else {
            this.loadTemplateFromSchedule = false;
            this.showingReportTemplate = false;
            const data = this.loadSelectedVehicleLineData(reportInfo.group);
            if (data) {
                setTimeout(() => {
                    this.templateDataSource.next(data.template);
                });
            } else {
                setTimeout(() => {
                    this.templateDataSource.next({});
                });
            }
            this.loadReport(reportInfo.name, reportInfo.group);
        }
    }

    loadTemplate(templateName , reportName, reportGroup?) {
          this._dataLayer.getTemplateForEdit(templateName).pipe(takeUntil(this.destroySubject$)).subscribe(
            (template) => {
                this.templateDataSource.next(template);
            },
          );
        } 

    loadReport(reportName, reportGroup?, templateName?, isSchedule = false) {
        this._dataLayer.initQueryPage({reportName}).pipe(takeUntil(this.destroySubject$)).subscribe(
          (data) => {
              
              if (reportGroup && reportGroup === 'Marketing') {
                this.reportDataSource.next({reportData: data, userPrefs: this.reportPrefs});
              } else {
                this.reportDataSource.next(data);
              }

              if (templateName) {
                  if (isSchedule) {
                    this.loadTemplateForScheduledReport(templateName, reportName);
                  } else {
                    this.loadTemplate(templateName, reportName, reportGroup);
                  }
              }
          },
          (error) => {
            this._rc.showNotification(this._rc.reportNotifyMessages.genericError);
          },
        );
    
    }

    loadTemplateForScheduledReport(reportDescription, reportName) {
      this._dataLayer.getTemplateForScheduledReport(reportDescription)
      .pipe(takeUntil(this.destroySubject$)).subscribe((template: any) => {
          this.templateDataSource.next(template);
      });
    }

    loadSelectedVehicleLineData(selectedReportGroup) {
        if (selectedReportGroup === 'Finance' 
        && this._authService.selectedVehicleLineObject
        && this._authService.selectedVehicleLineObject.id
        ) {
          const templateData = {
            template : {
              marketingGroup: [this._authService.selectedVehicleLineObject.marketingGroupID],
              modelYear: [this._authService.selectedVehicleLineObject.modelYear],
              namePlate: [this._authService.selectedVehicleLineObject.namePlateID],
              bookCode: [this._authService.selectedVehicleLineObject.bookID],
              vehicleLine: [this._authService.selectedVehicleLineObject.id],
            },
          }; 
          
          return templateData;
        } 
    
        return undefined;
      }

      updateReportData(data) {
          this.reportDataSource.next(data);
      }

      updateReportInfo(data) {
          this.reportInfoDataSource.next(data);
      }

      updateValidationStatus(status) {
          this.reportValidDataSource.next(status);
      }

      updateShowSideBar(show) {
          this.showSideBarDataSource.next(show);
      }
}
