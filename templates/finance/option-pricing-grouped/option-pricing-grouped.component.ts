/**
 * Created by RZR4K1 on 1/10/2019.
 */
import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormGroup, Validators} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import { FinanceReport } from '../../../classes/FinanceReport';
import {ReportControls} from '../../../classes/ReportControls';
import {Template} from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-option-pricing-grouped',
  templateUrl: './option-pricing-grouped.component.html',
  styleUrls: ['./option-pricing-grouped.component.scss'],
  providers: [FinanceReport],
})

export class OptionPricingGroupedComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() reportData: any = {};
  @Input() templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  @Output() eFormUpdate = new EventEmitter<any>();
  changeOptionPricing: FormGroup;
  reportsArr: any = [];
  publishDateFormated: any;
  radio: string;
  additionalParams: any = {};
  // loading template values flag
  // loadingTemplate: boolean;
  destroySubject$: Subject<void> = new Subject();

  reportInfo = {group: 'Finance', name: 'Option Pricing Grouped'};

  constructor(
    public _fr: FinanceReport, 
    public _tp: Template, 
    private _rc: ReportControls,
    private _reportService: ReportService,
    private route: ActivatedRoute) {
  }

  ngAfterViewInit() {
    this._reportService.handleInit(this.route.snapshot.paramMap.get('templateName'), this.reportInfo);
    this._reportService.getTemplateData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      this.templateData = data;
      if (this.templateData && Object.keys(this.templateData).length > 0) {
        this._fr.templateLoading = true;
        // preprocess template values and load template
        this._fr.getMarketGroups(true);
        this._tp.loadTemplateValuesForForm(this.changeOptionPricing, this.templateData);
      } else {
        // for finance reprots, a template is getting returned no matter what (selected vehicle line) if empty continue
        this._fr.getMarketGroups(true);
      }
    });
  }

  ngOnInit() {

    this._reportService.updateShowSideBar(true);

    this.changeOptionPricing = new FormGroup({
      description: this._fr.reportDescription,
      marketingGroup: this._fr.marketGroup,
      modelYear: this._fr.modelYear,
      namePlate: this._fr.nameplate,
      bookCode: this._fr.bookCode,
      vehicleLine: this._fr.vehicleLine,
    });

    this.changeOptionPricing.get('description')['controlType'] = { isMulti: false, isString: true };
    this.changeOptionPricing.get('marketingGroup')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeOptionPricing.get('modelYear')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeOptionPricing.get('namePlate')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeOptionPricing.get('bookCode')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeOptionPricing.get('vehicleLine')['controlType'] = { isMulti: false, isString: false, emitEvent: false };

    if (! this._fr.templateLoading) {
      this.radio = 'WIP'; 
    }

    this.changeOptionPricing.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        if (this._rc.isFormValid(this.changeOptionPricing)) {
          this._fr.templateLoading = false;
          let reportData = this._fr.processForm(form);
          reportData = this._rc.formatReportDates(reportData);
          reportData = this.preProcessReportData(reportData);
          this._reportService.updateValidationStatus(reportData);
        } else {
          this._reportService.updateValidationStatus(false);
        }
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
        // this._fr.getAvailabilityInidcators(this._rc.isValidInput(form), this._fr.templateLoading);
      });

    this.changeOptionPricing.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getNamePlates(this._rc.isValidInput(form), this._fr.templateLoading);
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
        // this._fr.getModelCode(this._rc.isValidInput(form), this._fr.templateLoading);
        // this._fr.getOptionCodes(this._rc.isValidInput(form), this._fr.templateLoading);
      });

    this.changeOptionPricing.get('bookCode').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
      });
  }

  ngOnDestroy() {
    this._fr.sortOrder.setValidators(null);
    this._fr.resetFormGroups();
    this.eDestroyTemplate.emit();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._fr);
  }

  preProcessReportData(reportData: any): any {
    // ensure below params are sent with '0' value if no selection has been made
    const reportParams = Object.keys(reportData);
    const nonRequiredParams = ['selectedCodes'];

    // add params with 0 value
    nonRequiredParams
      .forEach((param) => {
        if (reportParams.indexOf(param) === -1 || !reportData[param]) {
          this.additionalParams[param] = 0;
        }
      });

    // add status parameter
    this.additionalParams['status'] = this.radio;

    return Object.assign(this.additionalParams, reportData);
  }
}
