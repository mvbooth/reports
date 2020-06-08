import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
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
  selector: 'mvp-change-hist-mo',
  templateUrl: './change-hist-mo.component.html',
  styleUrls: ['./change-hist-mo.component.scss'],
  providers: [Marketing, Template],
})
export class ChangeHistMoComponent implements OnInit, OnDestroy, AfterViewInit {
  // tslint:disable:max-line-length
  reportData: any = {};
  @Input() userPrefs: any = {};
  templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  mktClassRef: any;
  changeMoReport: FormGroup;
  allowUpdateMO = false;
  partialFormValid: boolean;

  // loading template values flag
  loadingTemplate: boolean;
  reportInfo = {group: 'Marketing', name: 'Change History Market Offer'};

  constructor(
    public _mkt: Marketing,
    public _tp: Template,
    public _rc: ReportControls,
    readonly _notify: NotificationService,
    private _reportService: ReportService,
    private route: ActivatedRoute,
  ) { }

  destroySubject$: Subject<void> = new Subject();

  ngAfterViewInit() {
    this._reportService.handleInit(this.route.snapshot.paramMap.get('templateName'), this.reportInfo);
    this._reportService.getTemplateData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      this.templateData = data;
      if (this.templateData && Object.keys(this.templateData).length > 0) {
        this._mkt.templateLoading = true;
        // preprocess template values and load template
        this._tp.loadTemplateValuesForForm(this.changeMoReport, this.preProcessTemplateData());
      }
    });
    this._reportService.getReportData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      if (data) {
        this.reportData = data;
            // set initial form values
        this._mkt.setInitialData(this.reportData.reportData, this.reportData.userPrefs);
      }
    });
  }

  ngOnInit() {

    this._reportService.updateShowSideBar(true);

    this.changeMoReport = new FormGroup({
      description: this._mkt.reportDescription,
      modelYear: this._mkt.modelYear,
      marketingGroup: this._mkt.marketGroup,
      geographicMarket: this._mkt.geographicMarket,
      namePlate: this._mkt.nameplate,
      vehicleLine: this._mkt.vehicleLine,
      mmcCode: this._mkt.mmc,
      modelRestrictionString: this._mkt.modelRestrictionString,
      optionDescriptionType: this._mkt.descriptionType,
      optionLanguage: this._mkt.language,
      availableMo: this._mkt.availableMarketOffers,
      selectedMarketOffers: this._mkt.selectedMarketOffers,
      toDate: this._mkt.toDate,
      fromDate: this._mkt.fromDate,
    });

    this.changeMoReport.get('description')['controlType'] = { isMulti: false, isString: true };
    this.changeMoReport.get('modelYear')['controlType'] = { isMulti: true, isString: false };
    this.changeMoReport.get('marketingGroup')['controlType'] = { isMulti: true, isString: false };
    this.changeMoReport.get('geographicMarket')['controlType'] = { isMulti: true, isString: true, commaVal: true };
    this.changeMoReport.get('namePlate')['controlType'] = { isMulti: true, isString: true, commaVal: true };
    this.changeMoReport.get('vehicleLine')['controlType'] = { isMulti: true, isString: true, commaVal: true, isObject: true, emitEvent: false };
    this.changeMoReport.get('mmcCode')['controlType'] = { isMulti: true, isString: true };
    this.changeMoReport.get('modelRestrictionString')['controlType'] = { isMulti: true, isString: true };
    this.changeMoReport.get('optionDescriptionType')['controlType'] = { isMulti: false, isString: false };
    this.changeMoReport.get('optionLanguage')['controlType'] = { isMulti: false, isString: false };
    this.changeMoReport.get('availableMo')['controlType'] = { isMulti: true, isString: false, emitEvent: false };
    this.changeMoReport.get('selectedMarketOffers')['controlType'] = { isMulti: true, isString: false, emitEvent: false };
    this.changeMoReport.get('toDate')['controlType'] = { isMulti: false, isString: true };
    this.changeMoReport.get('fromDate')['controlType'] = { isMulti: false, isString: true };

    this.changeMoReport.get('fromDate').enable({ emitEvent: false });
    this.changeMoReport.get('toDate').enable({ emitEvent: false });
    this.changeMoReport
      .get('selectedMarketOffers')
      .enable({ emitEvent: false });

    this.changeMoReport.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        let optionalFieldsArray = [];
        if (
          this._rc.isValidInput(form.mmcCode) ||
          this._rc.isValidInput(form.modelRestrictionString)
        ) {
          optionalFieldsArray = [form.mmcCode, form.modelRestrictionString];
        }
        this.partialFormValid = this._mkt.processPartialForm(
          [
            form.geographicMarket,
            form.optionLanguage,
            form.marketingGroup,
            form.modelYear,
            form.namePlate,
            form.optionDescriptionType,
            form.vehicleLine,
          ],
          optionalFieldsArray,
        );
        if (this.partialFormValid) {
          // enough fields have been completed to call 'update market offers'
          this.allowUpdateMO = true;
          if (this._mkt.templateLoading && !this._mkt.moLogicStarted && this._rc.isValidInput(this.changeMoReport.get('selectedMarketOffers').value)) {
            this._mkt.updateMarketOfferList();
          }
        } else {
          this.allowUpdateMO = false;
          this.changeMoReport
            .get('availableMo')
            .reset({ value: '', disabled: true }, { emitEvent: false });
          this.changeMoReport
            .get('selectedMarketOffers')
            .reset({ value: '', disabled: true }, { emitEvent: false });
        }
        if (this._rc.isFormValid(this.changeMoReport)) {
          if (this.changeMoReport.get('fromDate').value && this.changeMoReport.get('toDate').value
            && !(moment(this.changeMoReport.get('toDate').value).isBefore(this.changeMoReport.get('fromDate').value))) {
            this._mkt.templateLoading = false;
            let reportData = this._mkt.processForm(form);
            if (reportData.mmcCodeCommaValues === undefined) {
              reportData.mmcCodeCommaValues = 'NA';
            }
            reportData = this._rc.formatReportDates(reportData);
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
        if (this.changeMoReport.valid) {
          this.changeMoReport.updateValueAndValidity({
            onlySelf: false,
            emitEvent: true,
          });
        }
      });

    this.changeMoReport
      .get('modelYear')
      .valueChanges.pipe(takeUntil(this.destroySubject$))
      .subscribe((val) => {
        this._mkt.getMarketingGroupData(
          this._rc.isValidInput(val),
          this.loadingTemplate,
        );
      });

    this.changeMoReport.get('selectedMarketOffers')
      .valueChanges.pipe(takeUntil(this.destroySubject$))
      .subscribe((val) => {
        this.changeMoReport.get('selectedMarketOffers')['controlType'].controlLoading = false;
      });

    this.changeMoReport
      .get('marketingGroup')
      .valueChanges.pipe(takeUntil(this.destroySubject$))
      .subscribe((val) => {
        this._mkt.getMarketData(
          this._rc.isValidInput(val),
          this.loadingTemplate,
        );
        this._mkt.getNameplateData(
          this._rc.isValidInput(val),
          this.loadingTemplate,
        );
      });

    this.changeMoReport
      .get('geographicMarket')
      .valueChanges.pipe(takeUntil(this.destroySubject$))
      .subscribe((val) => {
        this._mkt.getLanguages(
          this._rc.isValidInput(val),
          this.loadingTemplate,
        );
      });

    this.changeMoReport
      .get('namePlate')
      .valueChanges.pipe(takeUntil(this.destroySubject$))
      .subscribe((val) => {
        this._mkt.getVehicleLineList(
          this._rc.isValidInput(val),
          this.loadingTemplate,
        );
      });

    this.changeMoReport
      .get('vehicleLine')
      .valueChanges.pipe(takeUntil(this.destroySubject$))
      .subscribe((val) => {
        this._mkt.getMMCCodes(this._rc.isValidInput(val), this.loadingTemplate);
        if (val) {
          this.changeMoReport.get('optionDescriptionType').enable();
        }
      });

    this.changeMoReport.get('fromDate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          const end = this.changeMoReport.get('toDate').value;
          if (val && end) {
            if (moment(end).isBefore(val)) {
              this._notify.notify('warn', 'Warning!', 'From date should be before To date');
            }
          }
        },
    );

    this.changeMoReport.get('toDate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          const begin = this.changeMoReport.get('fromDate').value;
          if (val && begin) {
            if (moment(val).isBefore(begin)) {
              this._notify.notify('warn', 'Warning!', 'From date should be before To date');
            }
          }
        },
    );

    this.changeMoReport
      .get('mmcCode')
      .valueChanges.pipe(takeUntil(this.destroySubject$))
      .subscribe((val) => {
        if (val && val.length === 0) {
          this.changeMoReport.get('mmcCode').reset();
        } else {
          this._mkt.loadModelRestrictionList(
            this._rc.isValidInput(val),
            this.loadingTemplate,
          );
        }
      });

    this.changeMoReport
      .get('availableMo')
      .valueChanges.pipe(takeUntil(this.destroySubject$))
      .subscribe((val) => {
        if (this._rc.isValidInput(val)) {
          this._mkt.numberOfSelectedMOs = val.length;
        }
      });
  }

  preProcessTemplateData(): any {
    const template = this.templateData;
    const templateKeys = Object.keys(template);
    // format dates for fromDate and toDate controls
    const chgHistMoDateList = ['fromDate', 'toDate'];
    chgHistMoDateList.forEach((strDate) => {
      if (templateKeys.indexOf(strDate) !== -1) {
        template[strDate] = this._mkt.getDateFromString(template[strDate]);
      }
    });
    return template;
  }

  updateMarketOfferUI() {
    if (this.partialFormValid) {
      this._mkt.updateMarketOfferList();
    } else {
      this._notify.notify('info', 'Information', 'Please fill out all required(*) fields to generate market offers.');
    }
  }

  ngOnDestroy() {
    this.eDestroyTemplate.emit();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._mkt);
  }
}
