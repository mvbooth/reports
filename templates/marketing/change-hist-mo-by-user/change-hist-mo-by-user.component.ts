import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataLayerService } from '../../../../data/data-layer.service';
import { NotificationService } from '../../../../shared/notification.service';
import { Marketing } from '../../../classes/Marketing';
import { ReportControls } from '../../../classes/ReportControls';
import { Template } from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-change-hist-mo-by-user',
  templateUrl: './change-hist-mo-by-user.component.html',
  styleUrls: ['./change-hist-mo-by-user.component.scss'],
  providers: [Marketing, Template],
})
export class ChangeHistMoByUserComponent implements OnInit, OnDestroy, AfterViewInit {
  reportData: any = {};
  @Input() userPrefs: any = {};
  templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  changeHistMoUser: any;

  constructor(
    public _mkt: Marketing, 
    public _notify: NotificationService,
    public _tp: Template, 
    private _rc: ReportControls, 
    private _dataLayer: DataLayerService,
    private _reportService: ReportService,
    private route: ActivatedRoute) { }
  destroySubject$: Subject<void> = new Subject();
  // loading template values flag
  loadingTemplate: boolean;
  template: any;
  templateKeys: any;
  reportInfo = {group: 'Marketing', name: 'Change History Market Offer by User'};

  ngAfterViewInit() {
    this._reportService.handleInit(this.route.snapshot.paramMap.get('templateName'), this.reportInfo);
    this._reportService.getTemplateData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      this.templateData = data;
      if (this.templateData && Object.keys(this.templateData).length > 0) {
        this._mkt.templateLoading = true;
        // preprocess template values and load template
        this.loadingTemplate = true;
        this.templateKeys = Object.keys(this.templateData);
        this._tp.loadTemplateValuesForForm(this.changeHistMoUser, this.preProcessTemplateData());
        const gmin = 'gmin';
        this.template = this._tp.template;
        this._mkt.getAllUsers(this.loadingTemplate, this.template[gmin]);
        this.loadingTemplate = false;
      } 
    });
    this._reportService.getReportData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      if (data) {
        this.reportData = data;
        // set initial form values
        this._mkt.setInitialData(this.reportData.reportData, this.reportData.userPrefs);
        if (!this.route.snapshot.paramMap.get('templateName')) {
            this._mkt.gmin.enable();
            this._mkt.getAllUsers();
        }
      }
    });
  }

  ngOnInit() {

    this._reportService.updateShowSideBar(true);

    this.changeHistMoUser = new FormGroup({
      description: this._mkt.reportDescription,
      optionDescriptionType: this._mkt.descriptionType,
      optionLanguage: this._mkt.language,
      gmin: this._mkt.gmin,
      fromDate: this._mkt.fromDate,
      toDate: this._mkt.toDate,
    });

    this.changeHistMoUser.get('description')['controlType'] = { isMulti: false, isString: true };
    this.changeHistMoUser.get('optionDescriptionType')['controlType'] = { isMulti: false, isString: false };
    this.changeHistMoUser.get('optionLanguage')['controlType'] = { isMulti: false, isString: false };
    this.changeHistMoUser.get('gmin')['controlType'] = { isMulti: false, isString: true };
    this.changeHistMoUser.get('fromDate')['controlType'] = { isMulti: false, isString: true };
    this.changeHistMoUser.get('toDate')['controlType'] = { isMulti: false, isString: true };

    this.changeHistMoUser.get('fromDate').enable({ emitEvent: false });
    this.changeHistMoUser.get('toDate').enable({ emitEvent: false });
    this.changeHistMoUser.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {

        if (this._rc.isFormValid(this.changeHistMoUser)) {
          if (this.changeHistMoUser.get('fromDate').value && this.changeHistMoUser.get('toDate').value
            && !(moment(this.changeHistMoUser.get('toDate').value).isBefore(this.changeHistMoUser.get('fromDate').value))) {
            let reportData = this._mkt.processForm(form);
            reportData = this.formatReportDates(reportData);
            this._reportService.updateValidationStatus(reportData);
          } else {
            this._reportService.updateValidationStatus(false);
          }
        } else {
          this._reportService.updateValidationStatus(false);
        }
      });

    this._mkt.eTemplateControlLoaded
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(($event) => {
        if (this.changeHistMoUser.valid) {
          this.changeHistMoUser.updateValueAndValidity({ onlySelf: false, emitEvent: true });
        }
      });

    this.changeHistMoUser.get('gmin').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this.changeHistMoUser.get('optionDescriptionType').enable();
        this.changeHistMoUser.get('optionLanguage').enable();
      });

    this.changeHistMoUser.get('fromDate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          const end = this.changeHistMoUser.get('toDate').value;
          if (val && end) {
            if (moment(end).isBefore(val)) {
              this._notify.notify('warn', 'Warning!', 'From date should be before To date');
            }
          }
        },
    );

    this.changeHistMoUser.get('toDate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          const begin = this.changeHistMoUser.get('fromDate').value;
          if (val && begin) {
            if (moment(val).isBefore(begin)) {
              this._notify.notify('warn', 'Warning!', 'From date should be before To date');
            }
          }
        },
    );
  }

  preProcessTemplateData() {
    const template = this.templateData;
    // format dates for fromDate and toDate controls
    const chgHistMoDateList = ['fromDate', 'toDate'];
    chgHistMoDateList.forEach(
      (strDate) => {
        if (this.templateKeys.indexOf(strDate) !== -1) {
          template[strDate] = this._mkt.getDateFromString(template[strDate]);
        }
      });
    // format gmin as string
    const gmin = 'gmin';
    if (this.templateKeys.indexOf(gmin) !== -1) {
      template[gmin] = template[gmin][0];
    }
    return template;
  
  }

  ngOnDestroy() {
    this.eDestroyTemplate.emit();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._mkt);
  }

  formatReportDates(form: any) {
    form['fromDate'] = this._mkt.formatDateInput(form['fromDate']);
    form['toDate'] = this._mkt.formatDateInput(form['toDate']);
    return form;
  }
}

interface IUser extends Array<IUser> {
  id: string;
  first: string;
  last: string;
  value: string;
}
