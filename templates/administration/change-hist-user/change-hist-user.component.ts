import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataLayerService } from '../../../../data/data-layer.service';
import { NotificationService } from '../../../../shared/notification.service';
import { AdminReport } from '../../../classes/AdminReport';
import { ReportControls } from '../../../classes/ReportControls';
import { Template } from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-change-hist-user',
  templateUrl: './change-hist-user.component.html',
  styleUrls: ['./change-hist-user.component.scss'],
  providers: [Template, AdminReport],
})

export class ChangeHistUserComponent implements AfterViewInit, OnInit, OnDestroy {

  reportData: any = {};
  templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  changeHistUser: any;
  userList: any;

  reportInfo = {group: 'Admin', name: 'Change History User'};

  constructor(public _ar: AdminReport,
              public _notify: NotificationService,
              public _tp: Template,
              private _dataLayer: DataLayerService,
              private _rc: ReportControls,
              private _reportService: ReportService,
              private route: ActivatedRoute) {
  }
  destroySubject$: Subject<void> = new Subject();

  ngAfterViewInit() {
    this._reportService.handleInit(this.route.snapshot.paramMap.get('templateName'), this.reportInfo);
    this._reportService.getTemplateData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      this.templateData = data;
      if (this.templateData && Object.keys(this.templateData).length > 0) {
        this._tp.loadTemplateValuesForForm(this.changeHistUser, this.preProcessTemplateData());
      } 
    });
  }

  ngOnInit() {

    this._reportService.updateShowSideBar(true);
    this._reportService.updateValidationStatus(false);

    this.getUsersList();

    this.changeHistUser = new FormGroup({
      description: this._ar.reportDescription,
      changedUser: this._ar.user,
      geographicMarket: this._ar.geographicMarket,
      marketingCluster: this._ar.marketingCluster,
      marketingNSC: this._ar.marketingNSC,
      userName: this._ar.userName,
      gmin: this._ar.gmin,
      fromDate: this._ar.fromDate,
      toDate: this._ar.toDate,
    });

    this.changeHistUser.get('description')['controlType'] = { isMulti: false, isString: true };
    this.changeHistUser.get('changedUser')['controlType'] = { isMulti: false, isString: true };
    this.changeHistUser.get('geographicMarket')['controlType'] = { isMulti: false, isString: true };
    this.changeHistUser.get('marketingCluster')['controlType'] = { isMulti: false, isString: true };
    this.changeHistUser.get('marketingNSC')['controlType'] = { isMulti: false, isString: true };
    this.changeHistUser.get('userName')['controlType'] = { isMulti: false, isString: true };
    this.changeHistUser.get('gmin')['controlType'] = { isMulti: false, isString: true };
    this.changeHistUser.get('fromDate')['controlType'] = { isMulti: false, isString: false };
    this.changeHistUser.get('toDate')['controlType'] = { isMulti: false, isString: false };

    this.changeHistUser.get('changedUser').enable({ emitEvent: false });
    this.changeHistUser.get('toDate').enable({ emitEvent: false });
    this.changeHistUser.get('userName').enable({ emitEvent: false });
    this.changeHistUser.get('gmin').enable({ emitEvent: false });
    this.changeHistUser.get('fromDate').enable({ emitEvent: false });
    this.changeHistUser.get('toDate').enable({ emitEvent: false });
    this.changeHistUser.get('changedUser').setValue('user', { emitEvent: false });

    this.changeHistUser.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        if (this._rc.isFormValid(this.changeHistUser)) {
          if (this.changeHistUser.get('fromDate').value && this.changeHistUser.get('toDate').value
            && !(moment(this.changeHistUser.get('toDate').value).isBefore(this.changeHistUser.get('fromDate').value))) {
            const reportData = this._ar.processForm(form);
            reportData['fromDate'] = this._ar.formatDateInput(reportData['fromDate']);
            reportData['toDate'] = this._ar.formatDateInput(reportData['toDate']);
            this._reportService.updateValidationStatus(reportData);
          } else {
             this._reportService.updateValidationStatus(false);
          }
        } else {
          this._reportService.updateValidationStatus(false);
        }
      });

    this.changeHistUser.get('userName').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        if (this.userList) {
          for (const temp of this.userList) {
            if (temp.value === this._ar.userName.value) {
              this._ar.gmin.setValue(temp.gmin, { emitEvent: false });
            }
          }
        }
      });

    this.changeHistUser.get('fromDate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          const end = this.changeHistUser.get('toDate').value;
          if (val && end) {
            if (moment(end).isBefore(val)) {
              this._notify.notify('warn', 'Warning!', 'From date should be before To date');
            }
          }
        },
    );

    this.changeHistUser.get('toDate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          const begin = this.changeHistUser.get('fromDate').value;
          if (val && begin) {
            if (moment(val).isBefore(begin)) {
              this._notify.notify('warn', 'Warning!', 'From date should be before To date');
            }
          }
        },
    );

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

  getUsersList() {
    const userListNameTemp = [];
    this._dataLayer.getUsers()
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((userlist) => {
        userlist.forEach((currUser) => {
          userListNameTemp.push({ label: currUser.userName, value: currUser.userName, gmin: currUser.gmIN });
        });
        this.userList = userListNameTemp;
      });
  }
}
