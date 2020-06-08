import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../../../shared/notification.service';
import { AdminReport } from '../../../classes/AdminReport';
import { ReportControls } from '../../../classes/ReportControls';
import { Template } from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-change-hist-misc',
  templateUrl: './change-hist-misc.component.html',
  styleUrls: ['./change-hist-misc.component.scss'],
  providers:  [AdminReport,  ReportControls],
})
export class ChangeHistMiscComponent implements AfterViewInit, OnInit, OnDestroy {
  reportData: any = {};
  templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  changeHistMisc: any;
  fromDate: Date;
  toDate: Date;
  reportInfo = {group: 'Admin', name: 'Change History Miscellaneous'};

  constructor(
    public _ar: AdminReport, 
    public _tp: Template, 
    private _rc: ReportControls, 
    public _notify: NotificationService,
    private _reportService: ReportService,
    private route: ActivatedRoute) {

  }
  destroySubject$: Subject<void> = new Subject();

  ngAfterViewInit() {
    this._reportService.handleInit(this.route.snapshot.paramMap.get('templateName'), this.reportInfo);
    this._reportService.getTemplateData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      this.templateData = data;
      if (this.templateData && Object.keys(this.templateData).length > 0) {
        this._tp.loadTemplateValuesForForm(this.changeHistMisc, this.preProcessTemplateData());
      } 
    });
    this._reportService.getReportData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      if (data) {
        this._ar.setInitialData(data);
        this._ar.getTableNameData();
      }
    });
  }

  ngOnInit() {

    this._reportService.updateShowSideBar(true);
    this._reportService.updateValidationStatus(false);

    this.changeHistMisc = new FormGroup({
      tableName: this._ar.tableName,
      fromDate: this._ar.fromDate,
      toDate: this._ar.toDate,
      description: this._ar.reportDescription,
    });

    this.changeHistMisc.get('tableName')['controlType'] = { isMulti: false, isString: true };
    this.changeHistMisc.get('fromDate')['controlType'] = { isMulti: false, isString: true };
    this.changeHistMisc.get('toDate')['controlType'] = { isMulti: false, isString: true };
    this.changeHistMisc.get('description')['controlType'] = { isMulti: false, isString: true };
    this.changeHistMisc.get('tableName').enable({ emitEvent: false });
    this.changeHistMisc.get('fromDate').enable({ emitEvent: false });
    this.changeHistMisc.get('toDate').enable({ emitEvent: false });
    this.changeHistMisc.get('description').enable({ emitEvent: false });

    this.changeHistMisc.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        if (this._rc.isFormValid(this.changeHistMisc)) {
          if (this.changeHistMisc.get('fromDate').value && this.changeHistMisc.get('toDate').value
            && !(moment(this.changeHistMisc.get('toDate').value).isBefore(this.changeHistMisc.get('fromDate').value))) {
            let reportData = this._ar.processForm(form);
            reportData = this.formatReportDates(reportData);
            this._reportService.updateValidationStatus(reportData);
          } else {
            this._reportService.updateValidationStatus(false);
          }
        } else {
          this._reportService.updateValidationStatus(false);
        }
      });

    this.changeHistMisc.get('fromDate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          const end = this.changeHistMisc.get('toDate').value;
          if (val && end) {
            if (moment(end).isBefore(val)) {
              this._notify.notify('warn', 'Warning!', 'From date should be before To date');
            }
          }
        },
    );

    this.changeHistMisc.get('toDate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          const begin = this.changeHistMisc.get('fromDate').value;
          if (val && begin) {
            if (moment(val).isBefore(begin)) {
              this._notify.notify('warn', 'Warning!', 'From date should be before To date');
            }
          }
        },
    );

    if (this._ar.tableNameArray.length > 0) {
      this.changeHistMisc.get('tableName').setValue(this._ar.tableNameArray[0].value, { emitEvent: true });
    }
  }

  preProcessTemplateData(): any {
    const template = this.templateData;
    const templateKeys = Object.keys(template);

    // reformat publishDate for datepicker
    const dates = ['fromDate', 'toDate'];
    dates.forEach(
      (date) => {
        if (templateKeys.indexOf(date) !== -1) {
          template[date] = this._ar.getDateFromString(template[date]);
        }
      });

    return template;
  }

  ngOnDestroy() {
    this.eDestroyTemplate.emit();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._ar);
  }

  formatReportDates(form: any) {
    form['fromDate'] = this._ar.formatDateInput(form['fromDate']);
    form['toDate'] = this._ar.formatDateInput(form['toDate']);
    return form;
  }

}
