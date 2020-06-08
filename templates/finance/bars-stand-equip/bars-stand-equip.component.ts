
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FinanceReport } from '../../../classes/FinanceReport';
import { ReportControls } from '../../../classes/ReportControls';
import { Template } from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-bars-stand-equip',
  templateUrl: './bars-stand-equip.component.html',
  styleUrls: ['./bars-stand-equip.component.scss'],
  providers: [FinanceReport, Template],
})

export class BarsStandEquipComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() reportData: any = {};
  @Input() templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  @Output() eFormUpdate = new EventEmitter<any>();
  changeBarsStandEquip: FormGroup;
  reportsArr: any = [];
  publishIsRequired = true;
  templateEffDateInput: any;
  // loading template values flag
  // loadingTemplate: boolean;
  reportInfo = {group: 'Finance', name: 'BARS Standard Equipment'};

  constructor(
    public _fr: FinanceReport, 
    public _tp: Template, 
    private _rc: ReportControls, 
    private cdr: ChangeDetectorRef,
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
        this._tp.loadTemplateValuesForForm(this.changeBarsStandEquip, this.preProcessTemplateData());
      } else {
        // for finance reprots, a template is getting returned no matter what (selected vehicle line) if empty continue
        this._fr.getMarketGroups(true);
      }
    });
  }

  ngOnInit() {

    this._reportService.updateShowSideBar(true);

    this.changeBarsStandEquip = new FormGroup({
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
      byMRS: this._fr.byMRS,
    });

    this.changeBarsStandEquip.get('publishId')['controlType'] = { isMulti: false, isString: true, emitEvent: true };
    this.changeBarsStandEquip.get('publishDate')['controlType'] = { isMulti: false, isString: true, emitEvent: false };
    this.changeBarsStandEquip.get('effectiveDate')['controlType'] = { isMulti: true, isString: true };
    this.changeBarsStandEquip.get('description')['controlType'] = { isMulti: false, isString: true };
    this.changeBarsStandEquip.get('marketingGroup')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeBarsStandEquip.get('modelYear')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeBarsStandEquip.get('namePlate')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeBarsStandEquip.get('bookCode')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeBarsStandEquip.get('vehicleLine')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeBarsStandEquip.get('mmcCode')['controlType'] = { isMulti: true, isString: false, emitEvent: false };
    this.changeBarsStandEquip.get('modelRestrictionString')['controlType'] = { isMulti: false, isString: true };

    this.changeBarsStandEquip.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        if (this._rc.isFormValid(this.changeBarsStandEquip)) {

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
        if (this.changeBarsStandEquip.valid) {
          this.changeBarsStandEquip.updateValueAndValidity({ onlySelf: false, emitEvent: true });
        }
      });

    this._fr.setInitialData(this.reportData);

    let requiredValidator = [];
    const statusDependent = ['publishDate', 'effectiveDate', 'publishId'];
    requiredValidator = [Validators.required];
    statusDependent.forEach((field) => {
      this.changeBarsStandEquip.get(field).setValidators(requiredValidator);
      this.changeBarsStandEquip.get(field).updateValueAndValidity();
    });

    this.changeBarsStandEquip.get('marketingGroup').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getModelYears(this._rc.isValidInput(form), this._fr.templateLoading);
      });

    this.changeBarsStandEquip.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getNamePlates(this._rc.isValidInput(form), this._fr.templateLoading);
      });

    this.changeBarsStandEquip.get('namePlate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getVehicleLine2(this._rc.isValidInput(form), this._fr.templateLoading);
      });

    this.changeBarsStandEquip.get('vehicleLine').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getBookCodesByVehicleLineOffering(this._rc.isValidInput(form), this._fr.templateLoading);
        this._fr.getModelCode(this._rc.isValidInput(form), this._fr.templateLoading);
      });

    this.changeBarsStandEquip.get('bookCode').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this.getByMRS(form);
      });

    this.changeBarsStandEquip.get('mmcCode').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getRestrictionString(this._rc.isValidInput(form), this._fr.templateLoading);
      });

    if (this._rc.isFormValid(this.changeBarsStandEquip)) {
      this.eFormUpdate.emit(this.reportData);
    }
  }

  preProcessTemplateData(): any {
    const template = this.templateData;
    this.templateEffDateInput = this.templateData ? this.templateData['effectiveDate'] : null;
    const templateKeys = Object.keys(template);
    return template;
  }

  ngOnDestroy() {
    this.eDestroyTemplate.emit();
    this._fr.resetFormGroups();
  
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._fr);
  }

  getByMRS(form: any) {
    const vehicleLineId: string = this.changeBarsStandEquip.get('vehicleLine').value;
    if (vehicleLineId) {
      this._fr.getByMRS(true, vehicleLineId);
    }
  }
  changePublishDate(event) {
    if (this._fr.publishedDate) {
      this._fr.publishDateFormated = this._fr.formatDateInput(event.value);
      if (event.id !== this.changeBarsStandEquip.get('publishId').value) {
        this.changeBarsStandEquip.get('publishId').setValue(event.id);
        this.changeBarsStandEquip.get('publishDate').setValue(event.id);
      }
    }

  }
  changeEffectiveDate(event: any) {
    const len = event.length > 0;
    const date = len ? moment(event[0].label).format('YYYY-MM-DD') : '';
    const dates = event.map ? event.map((date: any) => { return date.label }) : [date];
    if (date !== this.changeBarsStandEquip.get('effectiveDate').value) {
      this.changeBarsStandEquip.get('effectiveDate').setValue(dates.toString());
    } 
  }
}
