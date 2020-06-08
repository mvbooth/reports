import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { DataLayerService } from '../../data/data-layer.service';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { NotificationService } from '../../shared/notification.service';
// tslint:disable:max-line-length

// tslint:disable:max-line-length
@Injectable()
export class ReportControls implements OnDestroy {
    globalReportData: any = {};
    eFinishedReportAction = new EventEmitter<boolean>(true);
    reportTimer = {
        interval: 0,
        seconds: 0,
        errorFlag: false,
    };

    isNotificationTriggered = false;
    destroySubject$: Subject<void> = new Subject();

    // Notification || Dialog Data
    msgTitle = 'Empty Report';
    msgBody = ' you are trying to view does not contain data.';
    confirmButton = 'OK';

    // global form method calls and properties for schedule report, run in background, save  template, generate report
    globalControlErrors: ValidationErrors = {
        tooMany: 'Too many parameters selected',
    };

    reportNotifyMessages = {
        genericError: {
            msgType: 'error',
            msgTitle: 'Application Error',
            msgBody: 'An unknown error has occurred. Please contact the application support team.',
        },
        cognosError: {
            msgType: 'error',
            msgTitle: 'Cognos Connection Error',
            msgBody: 'There was an error when connecting to Cognos. Please refresh the browser. If the problem persists please contact the application support team.',
        },
        optionsError: {
            msgType: 'error',
            msgTitle: 'Error With Options',
            msgBody: 'There was an error with the selected options. Please try different options. If the problem persists please contact the application support team.',
        },
        optionAmountError: {
            msgType: 'error',
            msgTitle: 'Error With Options',
            msgBody: 'There was an error with the amount of selected options. Please try fewer options. If the problem persists please contact the application support team.',
        },
        optionAmountWarn: {
            msgType: 'warn',
            msgTitle: 'Too Many Options',
            msgBody: 'Too many options have been selected. Please try fewer options. If the problem persists please contact the application support team.',
        },
        backgroundSuccess: {
            msgType: 'success',
            msgTitle: 'Success',
            msgBody: 'Report will be run in the background.',
        },
    };

    constructor(readonly _dataLayer: DataLayerService, readonly _dialog: MatDialog, readonly _notify: NotificationService, private messageService: MessageService) {
        this.globalReportData.REG = 'GMNA';
        this.globalReportData.format = 'spreadsheetML';
    }

    ngOnDestroy() {
        this.destroySubject$.next();
    }

    generateReport(fetchReportData: any) {
        Object.assign(fetchReportData, this.globalReportData);
        const fileName = fetchReportData.description + '.xlsx';
        this.startTimeoutCounter();
        this._dataLayer.downloadReport(fetchReportData).pipe(takeUntil(this.destroySubject$)).subscribe(
            (fetchData: any) => {
                const isEmpty = fetchData.headers.get('report-is-empty') === 'true';
                if (isEmpty) {
                  const reportName = fetchReportData.reportName.toLowerCase().indexOf('report') === -1
                    ? 'The ' + fetchReportData.reportName + ' Report' : 'The ' + fetchReportData.reportName;

                  const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
                    data: {
                      title: this.msgTitle,
                      message: reportName + this.msgBody,
                      confirmButtonValue: this.confirmButton,
                      showCancel: false,
                    },
                  });
                  dialogRef.afterClosed().subscribe(() => {
                    saveAs(fetchData.body, fileName);
                  });
                } else {
                  saveAs(fetchData.body, fileName);
                }

                this.eFinishedReportAction.emit(true);
                this.stopTimeoutCounter();
            }, (error) => {
                const holdErr = error;
                // the service will return a Blob as an error so we need to read the Blob and convert to JSON
                if (holdErr.error instanceof Blob) {
                    const reader = new FileReader();
                    reader.readAsText(error.error);
                    reader.addEventListener('loadend', (e: any) => {
                        const text = e.srcElement.result;
                        holdErr.error = JSON.parse(text);
                        this.showNotification({}, holdErr.error);
                    });
                    this.eFinishedReportAction.emit(true);
                } else if (holdErr.error && holdErr.error.message) {
                    this._notify.notify('error', holdErr.error.status, holdErr.error.message[0] + '. Please notify the admin referencing the error code in this message.');
                } else if (this.reportTimer.seconds > 90 && error.name === 'HttpErrorResponse') {
                    this._notify
                        // tslint:disable-next-line:max-line-length
                        .notify('error', 'Application Error', 'Report generation has exceeded browser limits. Please try running in background.');
                    this.eFinishedReportAction.emit(true);
                } else {
                    this.showNotification(this.reportNotifyMessages.genericError);
                }
                this.reportTimer.errorFlag = true;
            },
        );
    }

    getFetchReportObject(fetchReportData: any) {
        return Object.assign({}, this.globalReportData, fetchReportData);
    }

    runInBackground(fetchReportData: any) {
        this._dataLayer.runReportInBackGround(Object.assign(fetchReportData, this.globalReportData)).pipe(take(1))
            .subscribe(() => {
                this.eFinishedReportAction.emit(true);
                this.showNotification(this.reportNotifyMessages.backgroundSuccess);
            }, (error) => {
                if (error.error) {
                    this.eFinishedReportAction.emit(true);
                    this.showNotification({}, error.error);
                }
            });
    }

    saveTemplate(fetchReportData: any) {
        this._dataLayer.saveReportTemplate(Object.assign(fetchReportData, this.globalReportData), false).pipe(take(1))
            .subscribe(
                (response: any) => {
                    this.eFinishedReportAction.emit(true);
                    this.showNotification(
                        {
                            msgType: 'success',
                            msgTitle: 'Success',
                            msgBody: response.message,
                        },
                    );
                }, (error) => {
                    if (error.error) {
                        this.showNotification({}, error.error);
                        this.eFinishedReportAction.emit(true);
                    }
                },
        );
    }

    updateTemplate(fetchReportData: any) {
        this._dataLayer.updateReportTemplate(Object.assign(fetchReportData, this.globalReportData), false).pipe(take(1))
            .subscribe(
                (response: any) => {
                    this.eFinishedReportAction.emit(true);
                    this.showNotification(
                        {
                            msgType: 'success',
                            msgTitle: 'Success',
                            msgBody: response.message,
                        },
                    );
                }, (error) => {
                    if (error.error) {
                        this.showNotification({}, error.error);
                        this.eFinishedReportAction.emit(true);
                    }
                },
        );
    }

    updateSchedulePrompts(fetchReportData: any) {
        this._dataLayer.updateSchedulePrompts(fetchReportData)
            .pipe(takeUntil(this.destroySubject$))
            .subscribe(
                (response: any) => {
                    this.eFinishedReportAction.emit(true);
                    this._notify.notify('success', 'Success', response.message);
                }, (error) => {
                    if (error.error) {
                        this._notify.notify('error', error.error.status, error.error.message[0]);
                        this.eFinishedReportAction.emit(true);
                    }
                },
        );
    }

    isValidInput(inputVal: any): boolean {
        const inputIsArray = Array.isArray(inputVal);
        if (inputIsArray && inputVal.length > 0) {
            return true;
        } else if (inputIsArray && inputVal.length === 0) {
            return false;
        } else if (inputVal) {
            return true;
        } else {
            return false;
        }
    }

    isFormValid(formGroup: FormGroup, loopCounter?: number) {
        for (const control in formGroup.controls) {
            if (formGroup.controls.hasOwnProperty(control)) {
                const holdFormControl = formGroup.controls[control];
                let controlLoading = false;
                if (holdFormControl.hasOwnProperty('controlType') && holdFormControl['controlType'].hasOwnProperty('controlLoading')) {
                    controlLoading = holdFormControl['controlType'].controlLoading;
                }
                // if the formControl has a validator on it and is disabled, it's value isn't set and the form should be invalid.
                if (holdFormControl.validator && (holdFormControl.disabled || holdFormControl.invalid || controlLoading)) {
                    return false;
                }
            }
        }
        return true;
    }

    formatDateInput(form: any) {
        // set date to YYYY-MM-DD
        return moment(form).format('YYYY-MM-DD');
    }

    formatReportDates(form: any) {
        form['fromDate'] = this.formatDateInput(form['fromDate']);
        form['toDate'] = this.formatDateInput(form['toDate']);
        if (form.hasOwnProperty('publishDate')) {
            form['publishDate'] = this.formatDateInput(form['publishDate']);
        }
        return form;
    }

    cleanReportClass(reportObj: any) {
        this.stopTimeoutCounter();
        this.eFinishedReportAction.emit(false);
        for (const prop in reportObj) {
            if (reportObj.hasOwnProperty(prop)) {
                const holdProperty: any = reportObj[prop];
                if (typeof holdProperty === 'object') {
                    if (holdProperty.hasOwnProperty('valueChanges')) {
                        // if the property of the object is an angular formControl based on having a valueChanges property
                        switch (prop) {
                            case 'status':
                                reportObj[prop].reset('WIP', { emitEvent: false });
                                break;
                            case 'publishId':
                                reportObj[prop].reset('0', { emitEvent: false });
                                break;
                            case 'sortOrder':
                                reportObj[prop].reset('optionCode', { emitEvent: false });
                                break;
                            case 'moDifferenceAll':
                                reportObj[prop].reset('D', { emitEvent: false });
                                break;
                            default:
                                if (reportObj[prop]) {
                                    reportObj[prop].reset('', { emitEvent: false });
                                }
                                break;
                        }
                        // disable all form controls except description
                        this.disableFormControls(reportObj, prop);
                    }
                }
            }
        }

        // clear arrays & array counters for arrays associated with p-listbox
        if (reportObj.hasOwnProperty('availableMarketOfferArray') && reportObj.availableMarketOfferArray.length > 0) {
            reportObj.availableMarketOfferArray = [];
        }
        if (reportObj.hasOwnProperty('selectedMarketOfferArray') && reportObj.selectedMarketOfferArray.length > 0) {
            reportObj.selectedMarketOfferArray = [];
        }
        if (reportObj.hasOwnProperty('selectCodesArray') && reportObj.selectCodesArray.length > 0) {
            reportObj.selectCodesArray = [];
        }
        if (reportObj.hasOwnProperty('selectedCodesArray') && reportObj.selectedCodesArray.length > 0) {
            reportObj.selectedCodesArray = [];
        }
        if (reportObj.hasOwnProperty('numberOfSelectedMOs')) {
            reportObj.numberOfSelectedMOs = 0;
        }
    }

    disableFormControls(reportObj: any, prop: string) {
        if (prop !== 'reportDescription') {
            reportObj[prop].disable({ emitEvent: false });
        }
    }

    startTimeoutCounter() {
        if (this.reportTimer.interval) {
            this.stopTimeoutCounter();
        }
        this.reportTimer.seconds = 0;
        this.reportTimer.interval = setInterval((temp: any) => {
            if (this.reportTimer.seconds > 90 && !this.reportTimer.errorFlag) {
                this._notify
                    .notify('warn', 'Warning', 'Report may be too large to view. Please run in background.');
                this.reportTimer.errorFlag = true;
            }
            this.reportTimer.seconds += 1;
        }, 1000);
    }

    stopTimeoutCounter() {
        this.reportTimer.seconds = 0;
        this.reportTimer.errorFlag = false;
        clearInterval(this.reportTimer.interval);
    }

    showNotification(msgObj: any, response: any = {}, errorField: any = null) {
        if (response.hasOwnProperty('name') && response.name === 'HttpErrorResponse') {
            msgObj = this.reportNotifyMessages.optionAmountError;
            if (errorField !== null) {
                if (Array.isArray(errorField)) {
                    errorField.forEach(
                        (formControlObj) => {
                            formControlObj.setErrors(this.globalControlErrors.tooMany);
                        },
                    );
                } else {
                    errorField.setErrors(this.globalControlErrors.tooMany);
                }
            }
        }

        const genErrCode = Math.floor(Math.random() * 10000000);
        const notifyTitle = response.hasOwnProperty('status') ? 'Error' : msgObj.msgTitle;
        const notifyMessage = response.hasOwnProperty('message') ? Array.isArray(response.message) ? response.message[0] : response.message : msgObj.msgBody;
        const notifyType = msgObj.hasOwnProperty('msgType') ? msgObj.msgType : 'error';

        this._notify.notify(notifyType, notifyTitle, notifyMessage + ' (' + genErrCode + ')');
    }
}
