import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as _moment from 'moment';
import { SelectItem } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataLayerService } from '../../../data/data-layer.service';
import { NotificationService } from '../../../shared/notification.service';
import { ReportControls } from './../../classes/ReportControls';

const moment = _moment;

@Component({
  selector: 'mvp-schedule-report',
  templateUrl: './schedule-report.component.html',
  styleUrls: ['./schedule-report.component.scss'],
})

export class ScheduleReportComponent implements OnInit, OnDestroy {
  static readonly DATE_FORMAT = 'YYYY-MM-DD';
  static readonly READ_DATE_FORMAT = 'E MMM dd YYYY HH:mm:ss';
  date = moment.utc().format(ScheduleReportComponent.DATE_FORMAT);

  isLoading = false;
  isEndDateSelected = false;
  startDate: any;
  endDate: any;
  runTime = new Date();
  filterStartDate = moment.utc().format(ScheduleReportComponent.DATE_FORMAT);
  filterEndDate: any;
  scheduleOptions: SelectItem[];
  selectedSchedule: any;
  formGroup: any;
  params: any;
  filterRunTime: string;
  reportData: any;
  schedule: any;
  daysOfWeek: SelectItem[];
  isScheduledForYearDay: boolean;
  errorMessage: any;
  isValid: boolean;
  weekNumberSelections: SelectItem[];
  monthWeekDays: SelectItem[];
  monthsOfYear: SelectItem[];
  isScheduledForMonthDay: boolean;
  updateScheduleData: any;
  subArray: any;
  prevDateHolder: any;
  destroySubject$: Subject<void> = new Subject();
  scheduleData: {};
  updateChanges: boolean;
  scheduleReportFormat = 'spreadsheetML';
  startDateZone: string;

  constructor(
    public dialogRef: MatDialogRef<ScheduleReportComponent>,
    private _dataLayerService: DataLayerService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _rc: ReportControls,
    private _notify: NotificationService) {

    this.scheduleOptions = [
      { label: 'By Day', value: 'ByDay' },
      { label: 'By Week', value: 'ByWeek' },
      { label: 'By Month', value: 'ByMonth' },
      { label: 'By Year', value: 'ByYear' },
    ];

    this.daysOfWeek = [
      { label: 'Sunday', value: 1 },
      { label: 'Monday', value: 2 },
      { label: 'Tuesday', value: 3 },
      { label: 'Wednesday', value: 4 },
      { label: 'Thursday', value: 5 },
      { label: 'Friday', value: 6 },
      { label: 'Saturday', value: 7 },
    ];

    this.monthWeekDays = [
      { label: 'Sunday', value: 'sunday' },
      { label: 'Monday', value: 'monday' },
      { label: 'Tuesday', value: 'tuesday' },
      { label: 'Wednesday', value: 'wednesday' },
      { label: 'Thursday', value: 'thursday' },
      { label: 'Friday', value: 'friday' },
      { label: 'Saturday', value: 'saturday' },
    ];

    this.weekNumberSelections = [
      { label: 'First', value: 'first' },
      { label: 'Second', value: 'second' },
      { label: 'Third', value: 'third' },
      { label: 'Fourth', value: 'fourth' },
      { label: 'Last', value: 'last' },
    ];

    this.monthsOfYear = [
      { label: 'January', value: 'january' },
      { label: 'February', value: 'february' },
      { label: 'March', value: 'march' },
      { label: 'April', value: 'april' },
      { label: 'May', value: 'may' },
      { label: 'June', value: 'june' },
      { label: 'July', value: 'july' },
      { label: 'August', value: 'august' },
      { label: 'September', value: 'september' },
      { label: 'October', value: 'october' },
      { label: 'November', value: 'november' },
      { label: 'December', value: 'december' },
    ];

    this.reportData = this._rc.getFetchReportObject(this.data.reportData);

    this.formGroup = new FormGroup({
      reportDescription: new FormControl({ value: '', disabled: false }, [Validators.required]),
      isActive: new FormControl({ value: true, disabled: false }),
      dailyMonthlyYearly: new FormControl({ value: 'ByDay', disabled: false }, [Validators.required]),
      reportFrequency: new FormControl({ value: '', disabled: false }),
      startDate: new FormControl({ value: this.date, disabled: false }, [Validators.required]),
      startTime: new FormControl({ value: this.runTime, disabled: false }, [Validators.required]),
      noEndDate: new FormControl({ value: true, disabled: false }),
      endDate: new FormControl({ value: '', disabled: true }),
      endTime: new FormControl({ value: '', disabled: false }),
      outPutFormat: new FormControl({ value: '', disabled: false }),
      weekDays: new FormControl({ value: '', disabled: false }),
      isScheduledForMonthDay: new FormControl({ value: '', disabled: false }),
      monthWeekNumber: new FormControl({ value: '', disabled: false }),
      monthWeekDay: new FormControl({ value: '', disabled: false }),
      monthDayNumber: new FormControl({ value: '', disabled: false }),
      isScheduledForYearDay: new FormControl({ value: '', disabled: false }),
      yearWeekNumber: new FormControl({ value: '', disabled: false }),
      yearWeekDay: new FormControl({ value: '', disabled: false }),
      yearMonth: new FormControl({ value: '', disabled: false }),
      yearDayNumber: new FormControl({ value: '', disabled: false }),
      mwReportFrequency: new FormControl({ value: '', disabled: false }),
      mdReportFrequency: new FormControl({ value: '', disabled: false }),
      dYearMonth: new FormControl({ value: '', disabled: false }),
    });

    this.reportData = this._rc.getFetchReportObject(this.data.reportData);
  }

  ngOnInit() {
    if (this.data.isEditSchedule) {
      this.loadEditScheduleModal();
    } else {
      this.loadCreateScheduleModal();
    }

    this.formGroup.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          // Do something here
          this.updateChanges = true;
        },
    );
  }

  loadCreateScheduleModal() {
    // This gets loaded when using sidebar schedule button
    this.formGroup.get('reportDescription').setValue(this.reportData.description);
    this.selectedSchedule = 'ByDay';
    this.formGroup.get('reportFrequency').setValue(1);
    this.formGroup.get('mwReportFrequency').setValue(1);
    this.formGroup.get('weekDays').setValue([2]);

    this.formGroup.get('isScheduledForMonthDay').setValue(false);
    this.formGroup.get('monthWeekNumber').setValue('first');
    this.formGroup.get('monthWeekDay').setValue('monday');
    this.formGroup.get('monthDayNumber').disable();
    this.formGroup.get('mdReportFrequency').disable();

    this.formGroup.get('yearWeekNumber').setValue('first');
    this.formGroup.get('yearWeekDay').setValue('monday');
    this.formGroup.get('yearMonth').setValue('january');
    this.formGroup.get('yearDayNumber').disable();
    this.formGroup.get('dYearMonth').disable();

    this.formGroup.get('isScheduledForYearDay').setValue(false);
    this.filterEndDate = moment().utc().add(1000, 'years').format(ScheduleReportComponent.DATE_FORMAT);
  }

  loadEditScheduleModal() {

    if (this.data && this.data.scheduleData) {

      this.formGroup.get('reportDescription').disable();
      this.updateChanges = false;
      // This is loaded when editing an existing schedule
      const endYear = parseInt(this.data.scheduleData.endDate, 10);

      this.selectedSchedule = this.data.scheduleData.dailyMonthlyYearly;
      this.formGroup.get('reportFrequency').setValue(this.data.scheduleData.reportFrequency);
      this.formGroup.get('dailyMonthlyYearly').setValue(this.data.scheduleData.dailyMonthlyYearly);
      this.formGroup.get('isActive').setValue(this.data.scheduleData.isActive);
      this.formGroup.get('outPutFormat').setValue(this.data.scheduleData.outPutFormat);
      this.formGroup.get('reportDescription').setValue(this.data.scheduleData.reportDescription);

      this.filterStartDate = this.data.scheduleData.startDate.split('T')[0];
      this.formGroup.get('startDate').setValue(this.filterStartDate);
      this.filterEndDate = this.data.scheduleData.endDate.split('T')[0];
      this.filterRunTime = this.data.scheduleData.startDate.split('T')[1];
      this.formGroup.get('startTime').setValue(this.data.scheduleData.startTime);

      this.reportData.reportName = this.data.reportName;

      if (endYear >= 3000) {
        this.formGroup.get('endDate').reset();
        this.formGroup.get('noEndDate').setValue(true);
      } else {
        this.formGroup.get('endDate').enable();
        this.formGroup.get('endDate').setValue(this.data.scheduleData.endDate);
        this.formGroup.get('endDate').enable();
        this.formGroup.get('noEndDate').setValue(false);
        this.isEndDateSelected = true;
      }
      this.trySetFormControlValue(this.formGroup.get('weekDays'), this.data.scheduleData.weekDays, [2]);
      this.startDateZone = this.data.scheduleData.startDateZone || '';
      this.initLoadMonthDay();

      this.initLoadYearDay();
    } else {
      this._notify.notify('error', 'Error!', 'schedule date not found for report');
    }
  }

  convertUTCtoLocal() {
    // UTC to local for startTime, endTime, startDate, and endDate
    const localTime = moment.utc(this.data.scheduleData.startTime, 'hh:mm A').local().toDate();
    this.formGroup.get('startTime').setValue(localTime);
    this.formGroup.get('endTime').setValue(localTime);

    const localStartDate = moment.utc(new Date(this.data.scheduleData.startDate), ScheduleReportComponent.READ_DATE_FORMAT).local();
    this.formGroup.get('startDate').setValue(localStartDate);

    const localEndDate = moment.utc(new Date(this.data.scheduleData.endDate), ScheduleReportComponent.READ_DATE_FORMAT).local();
    this.formGroup.get('endDate').setValue(localEndDate);
  }

  toggleScheduleComponent(schedule) {
    this.selectedSchedule = schedule;
    if (this.selectedSchedule === 'ByDay') {
      this.updateValidatorsByDay();
    } else if (this.selectedSchedule === 'ByWeek') {
      this.updateValidatorsByWeek();
    } else if (this.selectedSchedule === 'ByMonth') {
      this.updateValidatorsByMonth();
    } else if (this.selectedSchedule === 'ByYear') {
      this.updateValidatorsByYear();
    }
  }

  toggleMonthlyScheduleOptions() {
    if (!this.formGroup.get('isScheduledForMonthDay').value) {
      this.formGroup.get('monthWeekNumber').enable();
      this.formGroup.get('monthWeekNumber').setValue('first');

      this.formGroup.get('monthWeekDay').enable();
      this.formGroup.get('monthWeekDay').setValue('monday');

      this.formGroup.get('mwReportFrequency').enable();
      this.formGroup.get('mwReportFrequency').setValue(1);

      // reset other schedule option
      this.formGroup.get('mdReportFrequency').reset();
      this.formGroup.get('mdReportFrequency').disable();

      this.formGroup.get('monthDayNumber').reset();
      this.formGroup.get('monthDayNumber').disable();

    } else {
      // reset other schedule option
      this.formGroup.get('monthWeekNumber').reset();
      this.formGroup.get('monthWeekNumber').disable();

      this.formGroup.get('monthWeekDay').reset();
      this.formGroup.get('monthWeekDay').disable();

      this.formGroup.get('mwReportFrequency').reset();
      this.formGroup.get('mwReportFrequency').disable();

      this.formGroup.get('monthDayNumber').enable();
      this.formGroup.get('monthDayNumber').setValue(1);

      this.formGroup.get('mdReportFrequency').enable();
      this.formGroup.get('mdReportFrequency').setValue(1);
    }
  }

  toggleYearlyScheduleOptions() {
    if (!this.formGroup.get('isScheduledForYearDay').value) {
      this.formGroup.get('yearWeekNumber').enable();
      this.formGroup.get('yearWeekNumber').setValue('first');

      this.formGroup.get('yearWeekDay').enable();
      this.formGroup.get('yearWeekDay').setValue('monday');

      this.formGroup.get('yearMonth').enable();
      this.formGroup.get('yearMonth').setValue('january');

      // Reset previous options
      this.formGroup.get('yearDayNumber').reset();
      this.formGroup.get('yearDayNumber').disable();

      this.formGroup.get('dYearMonth').reset();
      this.formGroup.get('dYearMonth').disable();
    } else {
      this.formGroup.get('yearDayNumber').enable();
      this.formGroup.get('yearDayNumber').setValue(1);

      this.formGroup.get('dYearMonth').enable();
      this.formGroup.get('dYearMonth').setValue('january');

      // Reset previous options
      this.formGroup.get('yearWeekNumber').reset();
      this.formGroup.get('yearWeekNumber').disable();

      this.formGroup.get('yearWeekDay').reset();
      this.formGroup.get('yearWeekDay').disable();

      this.formGroup.get('yearMonth').reset();
      this.formGroup.get('yearMonth').disable();
    }
  }

  captureReportFrequency() {
    if (!this.formGroup.get('isScheduledForMonthDay').value) {
      this.formGroup.get('reportFrequency').value = this.formGroup.get('mwReportFrequency').value;
    } else {
      this.formGroup.get('reportFrequency').value = this.formGroup.get('mdReportFrequency').value;
    }
  }

  captureAnnualYearMonth() {
    if (this.formGroup.get('isScheduledForYearDay').value) {
      this.formGroup.get('yearMonth').value = this.formGroup.get('dYearMonth').value;
    }
  }

  toggleEndDate() {
    if (this.formGroup.get('noEndDate').value === false) {
      this.formGroup.get('endDate').setValidators([Validators.required]);
      this.isEndDateSelected = true;
      this.formGroup.get('endDate').enable();
      if (this.prevDateHolder) { this.filterEndDate = this.prevDateHolder; }
    } else {
      this.isEndDateSelected = false;
      this.formGroup.get('endDate').disable();
      this.formGroup.get('endDate').setValidators(null);
      this.prevDateHolder = this.filterEndDate;
      this.filterEndDate = moment().utc().add(1000, 'years').format(ScheduleReportComponent.DATE_FORMAT);
    }
  }

  captureScheduleStartDate() {
    try {
      this.filterStartDate = moment(this.formGroup.get('startDate').value).format(ScheduleReportComponent.DATE_FORMAT);
    } catch {
      this._notify.notify('info', 'Information', 'Please enter a valid Start Date');
    }
  }

  captureScheduleEndDate() {
    if (this.validDateRange(this.formGroup.get('startDate'), this.formGroup.get('endDate'))) {
      try {
        this.filterEndDate = this.formGroup.get('endDate').value.format(ScheduleReportComponent.DATE_FORMAT);
      } catch {
        this._notify.notify('error', 'Bad End Date', 'Please enter a valid End Date');
      }

    }
  }
  validDateRange(startDateControl: AbstractControl, endDateControl: AbstractControl) {
    if (startDateControl && endDateControl) {
      const startDate = startDateControl.value ? moment(startDateControl.value, ScheduleReportComponent.DATE_FORMAT) : null;
      const endDate = endDateControl.value ? moment(endDateControl.value, ScheduleReportComponent.DATE_FORMAT) : null;
      if (startDate && endDate && !this.formGroup.get('noEndDate').value) {
        return startDate.isBefore(endDate);
      }
    }
    return true;
  }

  captureScheduleRunTime() {
    this.filterRunTime = this.formGroup.get('startTime').value.toLocaleTimeString('it-IT');
  }

  buildScheduleObject() {
    if (this.selectedSchedule === 'ByDay') {
      this.schedule = {
        folderName: this.reportData.folderName,
        reportDescription: this.formGroup.get('reportDescription').value.trim(),
        isActive: this.formGroup.get('isActive').value,
        dailyMonthlyYearly: this.selectedSchedule,
        reportFrequency: this.formGroup.get('reportFrequency').value,
        startDate: this.filterStartDate + 'T' + this.filterRunTime,
        startTime: this.filterRunTime,
        isEndDateSelected: this.isEndDateSelected,
        endDate: this.filterEndDate + 'T' + this.filterRunTime,
        reportName: this.reportData.reportName,
        outPutFormat: this.scheduleReportFormat,
      };
    } else if (this.selectedSchedule === 'ByWeek') {
      this.schedule = {
        folderName: this.reportData.folderName,
        reportDescription: this.formGroup.get('reportDescription').value.trim(),
        isActive: this.formGroup.get('isActive').value,
        dailyMonthlyYearly: this.selectedSchedule,
        reportFrequency: this.formGroup.get('reportFrequency').value,
        startDate: this.filterStartDate + 'T' + this.filterRunTime,
        startTime: this.filterRunTime,
        isEndDateSelected: this.isEndDateSelected,
        endDate: this.filterEndDate + 'T' + this.filterRunTime,
        reportName: this.reportData.reportName,
        outPutFormat: this.scheduleReportFormat,
        weekDays: this.formGroup.get('weekDays').value,
      };
    } else if (this.selectedSchedule === 'ByMonth' && !this.formGroup.get('isScheduledForMonthDay').value) {
      this.schedule = {
        folderName: this.reportData.folderName,
        reportDescription: this.formGroup.get('reportDescription').value.trim(),
        isActive: this.formGroup.get('isActive').value,
        dailyMonthlyYearly: this.selectedSchedule,
        reportFrequency: this.formGroup.get('reportFrequency').value,
        startDate: this.filterStartDate + 'T' + this.filterRunTime,
        startTime: this.filterRunTime,
        isEndDateSelected: this.isEndDateSelected,
        endDate: this.filterEndDate + 'T' + this.filterRunTime,
        reportName: this.reportData.reportName,
        outPutFormat: this.scheduleReportFormat,
        isScheduledForMonthDay: this.formGroup.get('isScheduledForMonthDay').value,
        monthWeekNumber: this.formGroup.get('monthWeekNumber').value,
        monthWeekDay: this.formGroup.get('monthWeekDay').value,
      };
    } else if (this.selectedSchedule === 'ByMonth' && this.formGroup.get('isScheduledForMonthDay').value) {
      this.schedule = {
        folderName: this.reportData.folderName,
        reportDescription: this.formGroup.get('reportDescription').value.trim(),
        isActive: this.formGroup.get('isActive').value,
        dailyMonthlyYearly: this.selectedSchedule,
        reportFrequency: this.formGroup.get('reportFrequency').value,
        startDate: this.filterStartDate + 'T' + this.filterRunTime,
        startTime: this.filterRunTime,
        isEndDateSelected: this.isEndDateSelected,
        endDate: this.filterEndDate + 'T' + this.filterRunTime,
        reportName: this.reportData.reportName,
        outPutFormat: this.scheduleReportFormat,
        isScheduledForMonthDay: this.formGroup.get('isScheduledForMonthDay').value,
        monthWeekNumber: this.formGroup.get('monthWeekNumber').value,
        monthWeekDay: this.formGroup.get('monthWeekDay').value,
        monthDayNumber: this.formGroup.get('monthDayNumber').value,
      };
    } else if (this.selectedSchedule === 'ByYear' && !this.formGroup.get('isScheduledForYearDay').value) {
      this.schedule = {
        folderName: this.reportData.folderName,
        reportDescription: this.formGroup.get('reportDescription').value.trim(),
        isActive: this.formGroup.get('isActive').value,
        dailyMonthlyYearly: this.selectedSchedule,
        startDate: this.filterStartDate + 'T' + this.filterRunTime,
        startTime: this.filterRunTime,
        isEndDateSelected: this.isEndDateSelected,
        endDate: this.filterEndDate + 'T' + this.filterRunTime,
        reportName: this.reportData.reportName,
        outPutFormat: this.scheduleReportFormat,
        isScheduledForYearDay: this.formGroup.get('isScheduledForYearDay').value,
        yearMonth: this.formGroup.get('yearMonth').value,
        yearWeekNumber: this.formGroup.get('yearWeekNumber').value,
        yearWeekDay: this.formGroup.get('yearWeekDay').value,
      };
    } else if (this.selectedSchedule === 'ByYear' && this.formGroup.get('isScheduledForYearDay').value) {
      this.schedule = {
        folderName: this.reportData.folderName,
        reportDescription: this.formGroup.get('reportDescription').value.trim(),
        isActive: this.formGroup.get('isActive').value,
        dailyMonthlyYearly: this.selectedSchedule,
        startDate: this.filterStartDate + 'T' + this.filterRunTime,
        startTime: this.filterRunTime,
        isEndDateSelected: this.isEndDateSelected,
        endDate: this.filterEndDate + 'T' + this.filterRunTime,
        reportName: this.reportData.reportName,
        outPutFormat: this.scheduleReportFormat,
        isScheduledForYearDay: this.formGroup.get('isScheduledForYearDay').value,
        yearMonth: this.formGroup.get('yearMonth').value,
        yearDayNumber: this.formGroup.get('yearDayNumber').value,
      };
    }
  }

  close() {
    this.dialogRef.close();
  }

  createSchedule() {
    this.isLoading = true;
    this.setDefaultTime();
    this.buildScheduleObject();
    this.params = this.reportData;
    this._dataLayerService.createSchedule(this.schedule, this.params).pipe(takeUntil(this.destroySubject$)).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          this._notify.notify('success', 'Success!', response.message[0]);
          this.isLoading = false;
        } else {
          this._notify.notify('info', 'Information', response.message[0]);
          this.isLoading = false;
        }
        this.close();
      },
      (error) => {
        this.onError(error);
      },
    );
  }

  setDefaultTime() {
    // local to UTC for startTime, startDate, and endDate
    const local = this.formGroup.get('startTime').value;
    this.filterRunTime = moment(local, ScheduleReportComponent.READ_DATE_FORMAT).format('HH:mm:ss');

    const timeString = this.buildTimeString(local);
    const startDate = new Date(this.filterStartDate + 'T' + timeString);
    this.filterStartDate = moment(startDate, ScheduleReportComponent.READ_DATE_FORMAT).format(ScheduleReportComponent.DATE_FORMAT);

    const endDate = new Date(this.filterEndDate + 'T' + timeString);
    this.filterEndDate = moment(endDate, ScheduleReportComponent.READ_DATE_FORMAT).format(ScheduleReportComponent.DATE_FORMAT);
  }

  buildTimeString(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
  }

  updateSchedule() {
    this.isLoading = true;
    this.buildScheduleObject();
    this._dataLayerService.updateSchedule(this.schedule)
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((response: any) => {
        if (response.statusCode === 200) {
          this._notify.notify('success', 'Success!', response.message[0]);
          this.updateScheduleData = response;
          this.isLoading = false;
        }
        this.close();
      },
        (error) => {
          this.onError(error);
        },
    );
  }

  onError(error: any) {
    this.errorMessage = error;
    if (error && error.error && error.error.message) {
      this._notify.notify('error', 'Error', error.error.message);
    } else {
      this._notify.notify('error', 'Error', 'There was an error during schedule creation. Please try again later.');
    }
    this.isLoading = false;
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  // init values for By Month frequency when editing a schedule
  initLoadMonthDay() {
    const isMonthDay = this.data.scheduleData.isScheduledForMonthDay;
    this.formGroup.get('isScheduledForMonthDay').setValue(isMonthDay);
    if (!isMonthDay) {
      this.formGroup.get('monthDayNumber').disable();
      this.formGroup.get('mdReportFrequency').disable();
      this.trySetFormControlValue(this.formGroup.get('monthWeekNumber'), this.data.scheduleData.monthWeekNumber, 'first');
      this.trySetFormControlValue(this.formGroup.get('monthWeekDay'), this.data.scheduleData.monthWeekDay, 'monday');
      this.trySetFormControlValue(this.formGroup.get('mwReportFrequency'), this.data.scheduleData.reportFrequency, 1);
    } else {

      this.formGroup.get('monthWeekNumber').disable();
      this.formGroup.get('monthWeekDay').disable();
      this.formGroup.get('mwReportFrequency').disable();
      this.trySetFormControlValue(this.formGroup.get('monthDayNumber'), this.data.scheduleData.monthDayNumber, 1);
      this.trySetFormControlValue(this.formGroup.get('mdReportFrequency'), this.data.scheduleData.reportFrequency, 1);
    }
  }

  // init values for By Year frequency when editing a schedule
  initLoadYearDay() {
    const isYearDay = this.data.scheduleData.isScheduledForYearDay;
    this.formGroup.get('isScheduledForYearDay').setValue(isYearDay);
    if (!isYearDay) {
      this.formGroup.get('yearDayNumber').disable();
      this.formGroup.get('dYearMonth').disable();
      this.trySetFormControlValue(this.formGroup.get('yearMonth'), this.data.scheduleData.yearMonth, 'january');
      this.trySetFormControlValue(this.formGroup.get('yearWeekDay'), this.data.scheduleData.yearWeekDay, 'monday');
      this.trySetFormControlValue(this.formGroup.get('yearWeekNumber'), this.data.scheduleData.yearWeekNumber, 'first');
    } else {
      this.formGroup.get('yearMonth').disable();
      this.formGroup.get('yearWeekDay').disable();
      this.formGroup.get('yearWeekNumber').disable();
      this.trySetFormControlValue(this.formGroup.get('yearDayNumber'), this.data.scheduleData.yearDayNumber, 1);
      this.trySetFormControlValue(this.formGroup.get('dYearMonth'), this.data.scheduleData.yearMonth, 'january');
    }
  }

  // sets FormControl value to 'val' or 'defaultVal', depending if 'val' is defined
  trySetFormControlValue(control: FormControl, val: any, defaultVal: any) {
    if ( (Array.isArray(val) && val.length) || (!Array.isArray(val) && val) ) {
      control.setValue(val);
    } else {
      control.setValue(defaultVal);
    }
  }

  resetValidatorsToDefault() {
    this.formGroup.clearValidators();
    this.setDefaultValidators();
  }

  setDefaultValidators() {
    this.formGroup.get('reportDescription').setValidators([Validators.required]);
    this.formGroup.get('dailyMonthlyYearly').setValidators([Validators.required]);
    this.formGroup.get('startDate').setValidators([Validators.required]);
    this.formGroup.get('startTime').setValidators([Validators.required]);
  }

  updateValidatorsByDay() {
    this.resetValidatorsToDefault();
    this.formGroup.get('reportFrequency').setValidators([Validators.required]);
  }

  updateValidatorsByWeek() {
    this.resetValidatorsToDefault();
    this.formGroup.get('reportFrequency').setValidators([Validators.required]);
    this.formGroup.get('weekDays').setValidators([Validators.required]);
  }

  updateValidatorsByMonth() {
    this.resetValidatorsToDefault();
    this.formGroup.get('isScheduledForMonthDay').setValidators([Validators.required]);
    this.formGroup.get('monthWeekNumber').setValidators([Validators.required]);
    this.formGroup.get('monthWeekDay').setValidators([Validators.required]);
    this.formGroup.get('mwReportFrequency').setValidators([Validators.required]);

    this.formGroup.get('monthDayNumber').setValidators([Validators.required]);
    this.formGroup.get('mdReportFrequency').setValidators([Validators.required]);
  }

  updateValidatorsByYear() {
    this.resetValidatorsToDefault();
    this.formGroup.get('isScheduledForYearDay').setValidators([Validators.required]);
    this.formGroup.get('yearWeekNumber').setValidators([Validators.required]);
    this.formGroup.get('yearWeekDay').setValidators([Validators.required]);
    this.formGroup.get('yearMonth').setValidators([Validators.required]);

    this.formGroup.get('yearDayNumber').setValidators([Validators.required]);
    this.formGroup.get('dYearMonth').setValidators([Validators.required]);
  }
}
