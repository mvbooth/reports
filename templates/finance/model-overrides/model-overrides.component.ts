import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { FinanceReport } from '../../../classes/FinanceReport';
import { ReportControls } from '../../../classes/ReportControls';
import { Template } from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-model-overrides',
  templateUrl: './model-overrides.component.html',
  styleUrls: ['./model-overrides.component.scss'],
  providers: [FinanceReport],
})
export class ModelOverridesComponent implements OnInit, OnDestroy, AfterViewInit {
  modelOverridesReportData: any = {};
  templateData: any;

  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  @Output() eFormUpdate = new EventEmitter<any>();
  modelOverridesComponent: FormGroup;
  reportsArr: any = [];

  reportInfo = {group: 'Finance', name: 'Model Overrides'};

  // loading template values flag
  // loadingTemplate: boolean;

  constructor(
    public _reportService: ReportService, 
    public route: ActivatedRoute, 
    public _fr: FinanceReport, 
    public _tp: Template, 
    private _rc: ReportControls) {
      this.modelOverridesComponent = new FormGroup({
        status: this._fr.status,
        publishDate: this._fr.publishedDate,
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
      this.modelOverridesComponent.get('status')['controlType'] = { isMulti: false, isString: true };
      this.modelOverridesComponent.get('description')['controlType'] = { isMulti: false, isString: true };
      this.modelOverridesComponent.get('publishDate')['controlType'] = { isMulti: false, isString: true, emitEvent: false };
      this.modelOverridesComponent.get('marketingGroup')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
      this.modelOverridesComponent.get('modelYear')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
      this.modelOverridesComponent.get('namePlate')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
      this.modelOverridesComponent.get('bookCode')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
      this.modelOverridesComponent.get('vehicleLine')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
      this.modelOverridesComponent.get('mmcCode')['controlType'] = { isMulti: true, isString: false, emitEvent: false };
     
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
        this._tp.loadTemplateValuesForForm(this.modelOverridesComponent, this.preProcessTemplateData());
      } else {
        // for finance reprots, a template is getting returned no matter what (selected vehicle line) if empty continue
        this._fr.getMarketGroups(true);
      }
    });

  }
  ngOnInit() {

    this._reportService.updateShowSideBar(true);
    // this.modelOverridesComponent.get('publishId')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.modelOverridesComponent.get('modelRestrictionString')['controlType'] = { isMulti: false, isString: true, emitEvent: false };

    this._fr.nameplate.setValidators(null);
    this._fr.bookCode.setValidators(null);
    this._fr.vehicleLine.setValidators(null);

    this.modelOverridesComponent.get('status').enable({ emitEvent: false });
    this.modelOverridesComponent.get('publishId').enable({ emitEvent: false });
    this.modelOverridesComponent.get('publishDate').enable({ emitEvent: false });
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    this.modelOverridesComponent.get('publishDate').setValue(date);
    this.modelOverridesComponent.get('publishDate')['controlType'].controlLoading = false;
    this._fr.publishDateFormated = this._fr.formatDateInput(this.modelOverridesComponent.get('publishDate').value);

    this.modelOverridesComponent.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        if (this._rc.isFormValid(this.modelOverridesComponent)) {
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
        if (this._rc.isFormValid(this.modelOverridesComponent)) {
          this.modelOverridesComponent.updateValueAndValidity({ onlySelf: false, emitEvent: false });
        }
      });

    this.modelOverridesComponent.get('publishDate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.publishDateFormated = this._fr.formatDateInput(this._fr.publishedDate.value);
      });

    this.modelOverridesComponent.get('status').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
       this.getPublishId(form);
       this._fr.publishDateFormated = this._fr.formatDateInput(this._fr.publishedDate.value);
      });

    this.modelOverridesComponent.get('marketingGroup').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this.modelOverridesComponent.get('marketingGroup')['controlLoading'] = false;
        this._fr.getModelYears(this._rc.isValidInput(form), this._fr.templateLoading);
      });

    this.modelOverridesComponent.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getNamePlates(this._rc.isValidInput(form), this._fr.templateLoading);
        this.getPublishId(form);
      });

    this.modelOverridesComponent.get('namePlate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getVehicleLine2(this._rc.isValidInput(form), this._fr.templateLoading);
      });

    this.modelOverridesComponent.get('vehicleLine').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getBookCodesByVehicleLineOffering(this._rc.isValidInput(form), this._fr.templateLoading);
        this._fr.getModelCode(true, this._fr.templateLoading);
        this.getPublishId(form);
      });

    this.modelOverridesComponent.get('mmcCode').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        if (form && form.length === 0) {
          this.modelOverridesComponent.get('mmcCode').reset();
        }
        this._fr.getRestrictionString(this._rc.isValidInput(form), this._fr.templateLoading);
        // this._fr.modelRestrictionString.setValue(' ');
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
 
      this._fr.resetFormGroups();
      this.modelOverridesComponent.get('namePlate').setValidators([Validators.required]);
      this.modelOverridesComponent.get('bookCode').setValidators([Validators.required]);
      this.modelOverridesComponent.get('vehicleLine').setValidators([Validators.required]);
      this.eDestroyTemplate.emit();
      this.destroySubject$.next();
      this._rc.cleanReportClass(this._fr);
  }

  getPublishId(form: any) {
    if (this.modelOverridesComponent.get('status').value === 'PUB') {
      this._fr.getPublishId(
        this._rc.isValidInput(form),
        this._fr.publishDateFormated,
        false,
        this.modelOverridesComponent.get('bookCode').value,
        this.modelOverridesComponent.get('vehicleLine').value);
    } else {
      this._fr.publishId.setValue('0', { emitEvent: false });
    }
  }
}
