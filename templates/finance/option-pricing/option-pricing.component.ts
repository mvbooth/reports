import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormGroup, Validators} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {DataLayerService} from '../../../../data/data-layer.service';
import { FinanceReport } from '../../../classes/FinanceReport';
import {ReportControls} from '../../../classes/ReportControls';
import {Template} from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-option-pricing',
  templateUrl: './option-pricing.component.html',
  styleUrls: ['./option-pricing.component.scss'],
  providers: [FinanceReport, Template],
})

export class OptionPricingComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() reportData: any = {};
  @Input() templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  @Output() eFormUpdate = new EventEmitter<any>();
  changeOptionPricing: FormGroup;
  reportsArr: any = [];
  publishDateFormated: any;
  publishId;
  templateEffDateInput: any;
  fromPicker: any;
  sortOrderOptions = [
    {label: 'Option Code', value: 'optionCode'},
    {label: 'MMC', value: 'ALPHABETICAL BY MMC'},
  ];

  reportInfo = {group: 'Finance', name: 'Option Pricing'};
  additionalParams: any = {};

  constructor(
    public _fr: FinanceReport, 
    public _tp: Template, 
    private _rc: ReportControls, 
    private _datalayer: DataLayerService,
    private _reportService: ReportService,
    private route: ActivatedRoute) {
  }

  destroySubject$: Subject<void> = new Subject();

  ngAfterViewInit() {
    this._reportService.handleInit(this.route.snapshot.paramMap.get('templateName'), this.reportInfo);
    this._reportService.getTemplateData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      this.templateData = data;
      if (this.templateData && Object.keys(this.templateData).length > 0) {
        this._fr.templateLoading = true;
        // preprocess template values and load template
        this._fr.getMarketGroups(true);
        this._tp.loadTemplateValuesForForm(this.changeOptionPricing, this.preProcessTemplateData());
      } else {
        // for finance reprots, a template is getting returned no matter what (selected vehicle line) if empty continue
        this._fr.getMarketGroups(true);
      }
    });
  }

  ngOnInit() {
    this._reportService.updateShowSideBar(true);
    this.changeOptionPricing = new FormGroup({
      status: this._fr.status,
      publishDate: this._fr.publishedDate,
      effectiveDate: this._fr.effectiveDate,
      description: this._fr.reportDescription,
      marketingGroup: this._fr.marketGroup,
      modelYear: this._fr.modelYear,
      namePlate: this._fr.nameplate,
      bookCode: this._fr.bookCode,
      vehicleLine: this._fr.vehicleLine,
      mmcCode: this._fr.merchandiseModelCode,
      modelRestrictionString: this._fr.modelRestrictionString,
      availabilityInd: this._fr.availabilityIndicator,
      selectedCodes: this._fr.optionCode,
      publishId: this._fr.publishId,
      fromDate: this._fr.fromDate,
      toDate: this._fr.toDate,
      sortOrder: this._fr.sortOrder,
    });
    this.changeOptionPricing.get('status')['controlType'] = { isMulti: false, isString: true };
    this.changeOptionPricing.get('status')['controlType'].controlLoading = false;
    this.changeOptionPricing.get('description')['controlType'] = { isMulti: false, isString: true };
    this.changeOptionPricing.get('publishDate')['controlType'] = { isMulti: false, isString: true, emitEvent: false };
    this.changeOptionPricing.get('effectiveDate')['controlType'] = { isMulti: true, isString: true, emitEvent: true };
    this.changeOptionPricing.get('marketingGroup')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeOptionPricing.get('modelYear')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeOptionPricing.get('namePlate')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeOptionPricing.get('bookCode')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeOptionPricing.get('vehicleLine')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeOptionPricing.get('mmcCode')['controlType'] = { isMulti: true, isString: false, emitEvent: false };
    this.changeOptionPricing.get('modelRestrictionString')['controlType'] = { isMulti: false, isString: true, emitEvent: false };
    this.changeOptionPricing.get('availabilityInd')['controlType'] = { isMulti: true, isString: true, emitEvent: false };
    this.changeOptionPricing.get('selectedCodes')['controlType'] = { isMulti: true, isString: true, emitEvent: false };
    this.changeOptionPricing.get('publishId')['controlType'] = { isMulti: false, isString: true, emitEvent: false };
    this.changeOptionPricing.get('fromDate')['controlType'] = { isMulti: false, isString: true };
    this.changeOptionPricing.get('toDate')['controlType'] = { isMulti: false, isString: true };
    this.changeOptionPricing.get('sortOrder')['controlType'] = { isMulti: false, isString: true };

    this.changeOptionPricing.get('sortOrder').setValidators([Validators.required]);
    this.changeOptionPricing.get('sortOrder').enable({emitEvent: false});

    if (!this._fr.templateLoading) {
      this.changeOptionPricing.get('status').enable({emitEvent: true});
      this.changeOptionPricing.get('publishId').enable({emitEvent: false});
      this.changeOptionPricing.get('publishDate').enable({emitEvent: false});
      this.changeOptionPricing.get('effectiveDate').enable({emitEvent: true});
      this.changeOptionPricing.get('fromDate').enable({emitEvent: false});
      this.changeOptionPricing.get('toDate').enable({emitEvent: false});
      this.changeOptionPricing.get('bookCode').enable({emitEvent: false});
      this.changeOptionPricing.get('namePlate').enable();
      this._fr.publishDateFormated = this._fr.formatDateInput(this.changeOptionPricing.get('publishDate').value);
    }    

    this.changeOptionPricing.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
      if (this._rc.isFormValid(this.changeOptionPricing)) {
        if (this._tp.templateControlLength === this._fr.countTemplateValuesSet) {
          this._fr.templateLoading = false;
        }

        let reportData = this._fr.processForm(form);
        reportData = this._rc.formatReportDates(reportData);
        reportData = this.preProcessReportData(reportData);

        this._reportService.updateValidationStatus(reportData);
      } else {
        this._reportService.updateValidationStatus(false);
      }
    });
    this.changeOptionPricing.get('status').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((status) => {
        this.handleStatus(status);
      });

    this._fr.eTemplateControlLoaded
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(($event) => {
        if (this._rc.isFormValid(this.changeOptionPricing)) {
          this.changeOptionPricing.updateValueAndValidity({onlySelf: false, emitEvent: true});
        }
      });

    this._fr.setInitialData(this.reportData);

    this.changeOptionPricing.get('marketingGroup').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
      this._fr.getModelYears(this._rc.isValidInput(form), this._fr.templateLoading);
    });

    this.changeOptionPricing.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getNamePlates(this._rc.isValidInput(form), this._fr.templateLoading);
        if (form !== '')  {
          this.setDefaultToAndFromDates('WIP', null);
        }
    });

    this.changeOptionPricing.get('namePlate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getVehicleLine2(this._rc.isValidInput(form), this._fr.templateLoading);
      });

    this.changeOptionPricing.get('vehicleLine').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getBookCodesByVehicleLineOffering(this._rc.isValidInput(form), this._fr.templateLoading);
        if (this.changeOptionPricing.get('status') && this.changeOptionPricing.get('status').value === 'PUB') {
          this.handleStatus('PUB');
        }
        this._fr.getModelCode(this._rc.isValidInput(form), this._fr.templateLoading);
        this._fr.getOptionCodes(this._rc.isValidInput(form), this._fr.templateLoading);
        this._fr.getAvailabilityIndicators(this._rc.isValidInput(form), this._fr.templateLoading);
      });
    
    this.changeOptionPricing.get('bookCode').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this.changeOptionPricing.get('sortOrder').enable({emitEvent: false});
    });

    this.changeOptionPricing.get('mmcCode').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
      this._fr.getRestrictionString(this._rc.isValidInput(form), this._fr.templateLoading);
    });

  }

  handleStatus(status) {
    this.setDefaultToAndFromDates(status, null);
    let requiredValidator = [];
    const statusDependent = ['publishDate', 'effectiveDate'];
    if (status === 'PUB') {
      requiredValidator = [Validators.required];
    }
    statusDependent.forEach((field) => {
      this.changeOptionPricing.get(field).setValidators(requiredValidator);
      this.changeOptionPricing.get(field).updateValueAndValidity();
    });
  }

  preProcessTemplateData(): any {
    const template = this.templateData;
    const templateKeys = Object.keys(template);

    const pubDate = 'publishDate';
    if (templateKeys.indexOf(pubDate) !== -1) {
      this.templateEffDateInput = this.templateData ? this.templateData['effectiveDate'] : null;
      this.publishId = template['publishId'] ? template['publishId'] : null;

    }
    return template;
  }

  ngOnDestroy() {
    // reset validators back on report destruction
    this._fr.sortOrder.setValidators(null);
    this._fr.resetFormGroups();

    this.eDestroyTemplate.emit();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._fr);
  }

  preProcessReportData(reportData: any): any {
    // ensure below params are sent with '0' value if no selection has been made
    const reportParams = Object.keys(reportData);
    const nonRequiredParams = ['mmcCode', 'modelRestrictionString', 'availabilityInd', 'selectedCodes'];

    // add params with 0 value
    nonRequiredParams
      .forEach((param) => {
        if (reportParams.indexOf(param) === -1 || !reportData[param]) {
          this.additionalParams[param] = 0;
        }
      });

    return Object.assign(this.additionalParams, reportData);
  }
  changePublishDate(event) {
    if (this._fr.publishedDate) {
      this._fr.publishDateFormated = this._fr.formatDateInput(event.value);
      const value = this._fr.status.value === 'PUB' ? event.value : '';
      const id = this._fr.status.value === 'PUB' ? event.id : '0';
      this.changeOptionPricing.get('publishDate').setValue(value);
      this.changeOptionPricing.get('publishId').setValue(id);
      this.publishId = event.id;
    }
  }
  changeEffectiveDate(event: any) {
    const date = event.length > 0 ? moment(event[0].label).format('YYYY-MM-DD') : '';
    const dates = event.map ? event.map((date: any) => {return date.label}) : [date];
    this.changeOptionPricing.get('effectiveDate').setValue(dates.toString());

    this.changeOptionPricing.get('toDate').setValue(date || new Date());
    if (event.length > 1) {
      const dateRange: Array<any> = this.getMaxDateRange(event);
      const years = dateRange.map((dateObject) => {
        let date = new Date(dateObject.label);
        return date.getFullYear();
      });
      this.changeOptionPricing.get('fromDate').setValue(new Date(years[0] - 1, 0, 1));
      this.changeOptionPricing.get('toDate').setValue(new Date(years[1] + 2, 11, 31));
    } else if (date) {
      this.setDefaultToAndFromDates(this._fr.status.value, new Date(date));
    } else {
      this.setDefaultToAndFromDates(this._fr.status.value, new Date());
    }
  }
  setDefaultToAndFromDates(status: string, optionalDate: Date) {
    const date = optionalDate || new Date();
    const year: number = date.getFullYear();
    this.changeOptionPricing.get('fromDate').setValue(new Date( year - 1, 0, 1));
    this.changeOptionPricing.get('toDate').setValue(new Date(year + 2, 11, 31));
  }
  getMaxDateRange(dates: Array<any>) {
    if (!dates) {
      return []
    }
    const result = new Array<any>();
    let date1 = new Date();
    let date2 = new Date();
    return dates.map((date: any) => {
      if (result[0] && result[0].label) {
        date1 = new Date(result[0].label);
        date2 = new Date(date.label);
        if (date1 < date2) {
          result.push(date);
        } else if (date2 < date1) {
          result[0].label = date2.toDateString();
          if (!result[1]) {
            result.push(date1.toDateString());
          } else if (result[1].label) {
            date2 = new Date(result[1].label);
            result[1] = date1 < date2 ? result[0] : result[1];
          }
        }
      } else {
        return date;
      }
      return result;
    });
  }

}
