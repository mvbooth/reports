import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../../../shared/notification.service';
import { Marketing } from '../../../classes/Marketing';
import { ReportControls } from '../../../classes/ReportControls';
import { Template } from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-vds-change',
  templateUrl: './vds-change.component.html',
  styleUrls: ['./vds-change.component.scss'],
  providers: [Marketing, Template],
})
export class VdsChangeComponent implements OnInit, OnDestroy, AfterViewInit {
  reportData: any = {};
  templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  vdsChangeForm: any;
  // loading template values flag
  loadingTemplate: boolean;
  reportInfo = {group: 'Marketing', name: 'VDS Change Report'};

  constructor(
    public _mkt: Marketing,
    public _tp: Template,
    private _rc: ReportControls,
    private _notify: NotificationService,
    private _reportService: ReportService,
    private route: ActivatedRoute) { }

  destroySubject$: Subject<void> = new Subject();

  ngAfterViewInit() {
    this._reportService.handleInit(this.route.snapshot.paramMap.get('templateName'), this.reportInfo);
    this._reportService.getTemplateData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      this.templateData = data;
      if (this.templateData && Object.keys(this.templateData).length > 0) {
        this._mkt.templateLoading = true;
        this.loadingTemplate = true;
        // preprocess template values and load template
        this._tp.loadTemplateValuesForForm(this.vdsChangeForm, this.preProcessTemplateData());
      }
    });
    this._reportService.getReportData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      if (data) {
        this.reportData = data;
            // set initial form values
        this._mkt.setInitialData(this.reportData.reportData, this.reportData.userPrefs);
        this._mkt.getVdsModelYearMasterList();
      }
    });
  }

  ngOnInit() {

    this._reportService.updateShowSideBar(true);

    this.vdsChangeForm = new FormGroup({
      description: this._mkt.reportDescription,
      modelYear: this._mkt.modelYear,
      enggBook: this._mkt.bookCode,
      vdsFamily: this._mkt.filterVdsFamily,
      selectCodes: this._mkt.selectCodes,
      enterCodes: this._mkt.enterCodes,
      selectedCodesFor: this._mkt.selectedCodes,
      selectedLabelsFor: this._mkt.selectedLabels,
      beginDate: this._mkt.fromDate,
      lastDate: this._mkt.toDate,
    });

    this.vdsChangeForm.get('description')['controlType'] = { isMulti: false, isString: true };
    this.vdsChangeForm.get('modelYear')['controlType'] = { isMulti: false, isString: false };
    this.vdsChangeForm.get('enggBook')['controlType'] = { isMulti: false, isString: true };
    this.vdsChangeForm.get('vdsFamily')['controlType'] = { isMulti: true, isString: true };
    this.vdsChangeForm.get('selectedCodesFor')['controlType'] = { isMulti: true, isString: true };
    this.vdsChangeForm.get('beginDate')['controlType'] = { isMulti: false, isString: true };
    this.vdsChangeForm.get('lastDate')['controlType'] = { isMulti: false, isString: true };
    this.vdsChangeForm.get('vdsFamily').disable();

    this.vdsChangeForm.get('modelYear').enable({ emitEvent: false });
    this.vdsChangeForm.get('beginDate').enable({ emitEvent: false });
    this.vdsChangeForm.get('lastDate').enable({ emitEvent: false });
    this.vdsChangeForm.get('enterCodes').enable({ emitEvent: false });

    this._mkt.selectedCodes.setValidators([Validators.required]);

    this.vdsChangeForm.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (form) => {
          if (this._rc.isFormValid(this.vdsChangeForm) && this._mkt.selectedCodesArray.length > 0) {
            if (this.vdsChangeForm.get('lastDate').value && this.vdsChangeForm.get('beginDate').value
            && !(moment(this.vdsChangeForm.get('lastDate').value).isSameOrBefore(moment(this.vdsChangeForm.get('beginDate').value)))) {
              const selectedLabelsFor = [];
              for (const value of form.selectedCodesFor) {
                for (const rpo of this._mkt.selectedCodesArray) {
                  if (rpo.value === value) {
                    selectedLabelsFor.push(rpo.label);
                  }
                }
              }
              form.selectedLabelsFor = selectedLabelsFor;
              let reportData = this._mkt.processForm(form);
              reportData = this.formatReportDates(reportData);
              this._reportService.updateValidationStatus(reportData);
            } else {
              this._reportService.updateValidationStatus(false);
            }
          } else {
            this._reportService.updateValidationStatus(false);
          }
        },
    );

    this._mkt.eTemplateControlLoaded
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(($event) => {
        if (this.vdsChangeForm.valid) {
          this.vdsChangeForm.updateValueAndValidity({ onlySelf: false, emitEvent: true });
        }
      });

    this.vdsChangeForm.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.loadVdsBookListFromModelYear(this._rc.isValidInput(val));
        },
    );

    this.vdsChangeForm.get('enggBook').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.loadVdsFamiliesByModelYearAndBook(this._rc.isValidInput(val));
        },
    );

    this.vdsChangeForm.get('vdsFamily').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.loadSelectedCodes(this._rc.isValidInput(val));
        },
    );

    this.vdsChangeForm.get('selectCodes').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          if (this._rc.isValidInput(val)) {
            this._mkt.numberOfSelectedMOs = val.length;
          }
        },
    );

    this.vdsChangeForm.get('beginDate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          const end = this.vdsChangeForm.get('lastDate').value;
          if (val && end) {
            if (this._mkt.formatDate(end).isSameOrBefore(this._mkt.formatDate(val))) {
              this._notify.notify('warn', 'Warning!' , 'From date should be before To date');
            }
          }
        },
    );

    this.vdsChangeForm.get('lastDate').valueChanges
    .pipe(takeUntil(this.destroySubject$))
    .subscribe(
      (val) => {
        const begin = this.vdsChangeForm.get('beginDate').value;
        if (val && begin) {
          if (this._mkt.formatDate(val).isSameOrBefore(this._mkt.formatDate(begin))) {
            this._notify.notify('warn', 'Warning!' , 'From date should be before To date');
          }
        }
      },
  );
  }

  preProcessTemplateData(): any {
    const template = this.templateData;
    const templateKeys = Object.keys(template);

    // format dates for fromDate and toDate controls
    const chgHistMoDateList = ['beginDate', 'lastDate'];
    chgHistMoDateList.forEach(
      (strDate) => {
        if (templateKeys.indexOf(strDate) !== -1) {
          const momentTime = this._mkt.getDateFromString(template[strDate][0]);
          template[strDate] = [momentTime];
        }
      });
    return template;
  }

  vdsFamilyFilter() {
    if (this.vdsChangeForm.get('vdsFamily').disabled) {
      this.vdsChangeForm.get('vdsFamily').enable();
    }
  }

  ngOnDestroy() {
    this.eDestroyTemplate.emit();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._mkt);
    this._mkt.selectedCodesArray = [];
    this._mkt.selectCodesArray = [];
  }

  formatReportDates(form: any) {
    form['beginDate'] = this._mkt.formatDateInput(form['beginDate']);
    form['lastDate'] = this._mkt.formatDateInput(form['lastDate']);
    return form;
  }
}
