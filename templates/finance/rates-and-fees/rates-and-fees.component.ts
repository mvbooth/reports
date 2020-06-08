import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FinanceReport } from '../../../classes/FinanceReport';
import { ReportControls } from '../../../classes/ReportControls';
import { Template } from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-rates-and-fees',
  templateUrl: './rates-and-fees.component.html',
  styleUrls: ['./rates-and-fees.component.scss'],
  providers: [FinanceReport],
})
export class RatesAndFeesComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() reportData: any = {};
  @Input() templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  @Output() eFormUpdate = new EventEmitter<any>();
  ratesAndFeesComponents: FormGroup;
  reportsArr: any = [];
  // loading template values flag
  // loadingTemplate: boolean;
  reportInfo = {group: 'Finance', name: 'Rates and Fees'};

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
        this._tp.loadTemplateValuesForForm(this.ratesAndFeesComponents, this.preProcessTemplateData());
      } else {
        // for finance reprots, a template is getting returned no matter what (selected vehicle line) if empty continue
        this._fr.getMarketGroups(true);
      }
    });
  }

  ngOnInit() {

    this._reportService.updateShowSideBar(true);

    this.ratesAndFeesComponents = new FormGroup({
      status: this._fr.status,
      publishDate: this._fr.publishedDate,
      description: this._fr.reportDescription,
      marketingGroup: this._fr.marketGroup,
      modelYear: this._fr.modelYear,
      namePlate: this._fr.nameplate,
      bookCode: this._fr.bookCode,
      vehicleLine: this._fr.vehicleLine,
      mmcCode: this._fr.merchandiseModelCode,
      mmcCodeSP: this._fr.mmcCodeSP,
      publishId: this._fr.publishId,
      modelRestrictionString: this._fr.modelRestrictionString,
    });

    this.ratesAndFeesComponents.get('status')['controlType'] = { isMulti: false, isString: true };
    this.ratesAndFeesComponents.get('description')['controlType'] = { isMulti: false, isString: true };
    this.ratesAndFeesComponents.get('publishDate')['controlType'] = { isMulti: false, isString: true, emitEvent: false };
    this.ratesAndFeesComponents.get('marketingGroup')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.ratesAndFeesComponents.get('modelYear')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.ratesAndFeesComponents.get('namePlate')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.ratesAndFeesComponents.get('bookCode')['controlType'] = { isMulti: true, isString: false, emitEvent: false };
    this.ratesAndFeesComponents.get('vehicleLine')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.ratesAndFeesComponents.get('mmcCode')['controlType'] = { isMulti: true, isString: false, emitEvent: false };
    // this.ratesAndFeesComponents.get('mmcCodeSP')['controlType'] = { isMulti: false, isString: true, emitEvent: false };
    // this.ratesAndFeesComponents.get('publishId')['controlType'] = { isMulti: false, isString: true, emitEvent: false };
    this.ratesAndFeesComponents.get('modelRestrictionString')['controlType'] = { isMulti: false, isString: true, emitEvent: false };

    // remove validatiors on these fields for option pricing report
    this.ratesAndFeesComponents.get('vehicleLine').setValidators(null);

    this.ratesAndFeesComponents.get('status').enable({ emitEvent: false });
    this.ratesAndFeesComponents.get('publishDate').enable({ emitEvent: false });
    this.ratesAndFeesComponents.get('publishDate').setValue(new Date());
    this.ratesAndFeesComponents.get('mmcCode').enable({ emitEvent: false });
    this.ratesAndFeesComponents.get('modelRestrictionString').enable({ emitEvent: false });
    this._fr.publishDateFormated = this._fr.formatDateInput(this.ratesAndFeesComponents.get('publishDate').value);

    this.ratesAndFeesComponents.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        if (this._rc.isFormValid(this.ratesAndFeesComponents)) {
          if (this._tp.templateControlLength === this._fr.countTemplateValuesSet) {
            this._fr.templateLoading = false;
          }
          const reportData = this._fr.processForm(form);
          this._reportService.updateValidationStatus(reportData);
        } else {
          this._reportService.updateValidationStatus(false);
        }
      });

    this._fr.eTemplateControlLoaded
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(($event) => {
        if (this._rc.isFormValid(this.ratesAndFeesComponents)) {
          this.ratesAndFeesComponents.updateValueAndValidity({ onlySelf: false, emitEvent: true });
        }
      });

    this._fr.setInitialData(this.reportData);

    this.ratesAndFeesComponents.get('publishDate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.publishDateFormated = this._fr.formatDateInput(this._fr.publishedDate.value);

      });
    this.ratesAndFeesComponents.get('marketingGroup').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getModelYears(this._rc.isValidInput(form), this._fr.templateLoading);
      });
    this.ratesAndFeesComponents.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getNamePlates(this._rc.isValidInput(form), this._fr.templateLoading);
      });
    this.ratesAndFeesComponents.get('namePlate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getVehicleLine2(this._rc.isValidInput(form), this._fr.templateLoading);
      });
    this.ratesAndFeesComponents.get('vehicleLine').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getBookCodesByVehicleLineOffering(this._rc.isValidInput(form), this._fr.templateLoading);
        this._fr.getModelCode(this._rc.isValidInput(form), this._fr.templateLoading);
        this.getPublishId(form);
      });
    this.ratesAndFeesComponents.get('bookCode').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this.getPublishId(form);
      });
    this.ratesAndFeesComponents.get('mmcCode').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getRestrictionString(this._rc.isValidInput(form), this._fr.templateLoading);
      });

    this.ratesAndFeesComponents.get('status').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        if (this.ratesAndFeesComponents.get('bookCode') && this.ratesAndFeesComponents.get('bookCode').value
          && this.ratesAndFeesComponents.get('vehicleLine') && this.ratesAndFeesComponents.get('vehicleLine').value) {
          this.getPublishId(form);
        }
      });
  }

  preProcessTemplateData(): any {
    const template = this.templateData;
    const templateKeys = Object.keys(template);

    // reformat publishDate for datepicker
    const pubDate = 'publishDate';
    if (templateKeys.indexOf(pubDate) !== -1) {
      template[pubDate] = this._fr.getDateFromString(template[pubDate]);
    }
    return template;
  }

  ngOnDestroy() {
    // add validators back on report destruction
    this.ratesAndFeesComponents.get('vehicleLine').setValidators([Validators.required]);
    this._fr.resetFormGroups();
    this.eDestroyTemplate.emit();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._fr);
  }

  getPublishId(form: any) {
    if (this.ratesAndFeesComponents.get('status').value === 'PUB') {
      this._fr.getPublishId(
        this._rc.isValidInput(form),
        this._fr.publishDateFormated,
        false,
        this.ratesAndFeesComponents.get('bookCode').value,
        this.ratesAndFeesComponents.get('vehicleLine').value);
    } else {
      this._fr.publishId.setValue('0', { emitEvent: false });
    }
  }
}
