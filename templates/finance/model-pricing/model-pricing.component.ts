import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FinanceReport } from '../../../classes/FinanceReport';
import { ReportControls } from '../../../classes/ReportControls';
import { Template } from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-model-pricing',
  templateUrl: './model-pricing.component.html',
  styleUrls: ['./model-pricing.component.scss'],
  providers: [FinanceReport, Template],
})
export class ModelPricingComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() reportData: any = {};
  @Input() templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  @Output() eFormUpdate = new EventEmitter<any>();
  modelPricingComponent: FormGroup;
  publishId;
  reportsArr: any = [];
  templateEffDateInput: any;
  reportInfo = {group: 'Finance', name: 'Model Pricing'};

  constructor(
    public _fr: FinanceReport, 
    public _tp: Template, 
    private _rc: ReportControls,
    private _reportService: ReportService,
    private route: ActivatedRoute) { }
  destroySubject$: Subject<void> = new Subject();

  ngAfterViewInit() {
    this._reportService.handleInit(this.route.snapshot.paramMap.get('templateName'), this.reportInfo);
    this._reportService.getTemplateData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      this.templateData = data;
      if (this.templateData && Object.keys(this.templateData).length > 0) {
        this._fr.templateLoading = true;
        // preprocess template values and load template
        this._fr.getMarketGroups(true);
        this._tp.loadTemplateValuesForForm(this.modelPricingComponent, this.preProcessTemplateData());
      } else {
        // for finance reprots, a template is getting returned no matter what (selected vehicle line) if empty continue
        this._fr.getMarketGroups(true);
      }
    });
  }

  ngOnInit() {

    this._reportService.updateShowSideBar(true);

    this.modelPricingComponent = new FormGroup({
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
      publishId: this._fr.publishId,
      modelRestrictionString: this._fr.modelRestrictionString,
    });

    this.modelPricingComponent.get('status')['controlType'] = { isMulti: false, isString: true };
    this.modelPricingComponent.get('description')['controlType'] = { isMulti: false, isString: true };
    this.modelPricingComponent.get('publishDate')['controlType'] = { isMulti: false, isString: true, emitEvent: false };
    this.modelPricingComponent.get('effectiveDate')['controlType'] = { isMulti: true, isString: true, emitEvent: true };
    this.modelPricingComponent.get('marketingGroup')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.modelPricingComponent.get('modelYear')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.modelPricingComponent.get('namePlate')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.modelPricingComponent.get('bookCode')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.modelPricingComponent.get('vehicleLine')['controlType'] = { isMulti: false, isString: false, isObject: true, emitEvent: false };
    this.modelPricingComponent.get('mmcCode')['controlType'] = { isMulti: true, isString: false, emitEvent: false };
    this.modelPricingComponent.get('publishId')['controlType'] = { isMulti: false, isString: true, emitEvent: false };
    this.modelPricingComponent.get('modelRestrictionString')['controlType'] = { isMulti: false, isString: true, emitEvent: false };

    // remove validators on these fields for model pricing report
    this.modelPricingComponent.get('vehicleLine').setValidators(null);

    this.modelPricingComponent.get('status').enable({ emitEvent: true });
    this.modelPricingComponent.get('publishDate').enable({ emitEvent: false });
    this.modelPricingComponent.get('effectiveDate').enable({ emitEvent: true });

    this.modelPricingComponent.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        if (this._rc.isFormValid(this.modelPricingComponent)) {
          if (this._tp.templateControlLength === this._fr.countTemplateValuesSet) {
            this._fr.templateLoading = false;
          }

          const reportData = this._fr.processForm(form);

          if (this.modelPricingComponent.get('status').value === 'WIP') {
            delete reportData.publishId;
          }

          this._reportService.updateValidationStatus(reportData);
        } else {
          this._reportService.updateValidationStatus(false);
        }
      });

    this._fr.eTemplateControlLoaded
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(($event) => {
        if (this._rc.isFormValid(this.modelPricingComponent)) {
          this.modelPricingComponent.updateValueAndValidity({ onlySelf: false, emitEvent: true });
        }
      });

    this._fr.setInitialData(this.reportData);

    this.modelPricingComponent.get('marketingGroup').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getModelYears(this._rc.isValidInput(form), this._fr.templateLoading);
      });
    this.modelPricingComponent.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getNamePlates(this._rc.isValidInput(form), this._fr.templateLoading);
      });
    this.modelPricingComponent.get('namePlate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getVehicleLine2(this._rc.isValidInput(form), this._fr.templateLoading);

      });
    this.modelPricingComponent.get('bookCode').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getModelCode(this._rc.isValidInput(form), this._fr.templateLoading);
      });
    this.modelPricingComponent.get('vehicleLine').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getBookCodesByVehicleLineOffering(this._rc.isValidInput(form), this._fr.templateLoading);
        if (this.modelPricingComponent.get('status') && this.modelPricingComponent.get('status').value === 'PUB') {
          this.handleStatus('PUB');
        }
      });
    this.modelPricingComponent.get('mmcCode').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getRestrictionString(this._rc.isValidInput(form), this._fr.templateLoading);
      });
    this.modelPricingComponent.get('status').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((status) => {
        this.handleStatus(status);
      });
  }

  handleStatus(status) {
    let requiredValidator = [];
    const statusDependent = ['publishDate', 'effectiveDate'];
    if (status === 'PUB') {
      requiredValidator = [Validators.required];
    } 
    statusDependent.forEach((field) => {
      this.modelPricingComponent.get(field).setValidators(requiredValidator);
      this.modelPricingComponent.get(field).updateValueAndValidity();
    });
  }

  preProcessTemplateData(): any {
    const template = this.templateData;
    const templateKeys = Object.keys(template);

    // reformat publishDate for datepicker
    const pubDate = 'publishDate';
    if (templateKeys.indexOf(pubDate) !== -1) {
      this.templateEffDateInput = this.templateData ? this.templateData['effectiveDate'] : null;
      this.publishId = template['publishId'] ? template['publishId'] : null;
 
    }
    return template;
  }

  ngOnDestroy() {
    // add validators back on report destruction
    this.modelPricingComponent.get('vehicleLine').setValidators([Validators.required]);

    this._fr.resetFormGroups();

    this.eDestroyTemplate.emit();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._fr);
  }

  changePublishDate(event) {
    if (this._fr.publishedDate) {
      this._fr.publishDateFormated = this._fr.formatDateInput(event.value);
      if (event.id !== this.modelPricingComponent.get('publishId').value) {
        this.modelPricingComponent.get('publishDate').setValue(this._fr.formatDateInput(event.value));
        this.modelPricingComponent.get('publishId').setValue(event.id);
        this.publishId = event.id;
      }
    }
  }
  changeEffectiveDate(event: any) {
    const len = event.length > 0;
    const date = len ? moment(event[0].label).format('YYYY-MM-DD') : '';
    const dates = event.map ? event.map((date: any) => { return date.label }) : [date];
    if (date !== this.modelPricingComponent.get('effectiveDate').value) {
      this.modelPricingComponent.get('effectiveDate').setValue(dates.toString());
    }
  }
}
