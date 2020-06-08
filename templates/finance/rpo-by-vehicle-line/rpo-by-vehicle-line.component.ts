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
  selector: 'mvp-rpo-by-vehicle-line',
  templateUrl: './rpo-by-vehicle-line.component.html',
  styleUrls: ['./rpo-by-vehicle-line.component.scss'],
  providers: [FinanceReport],
})
export class RpoByVehicleLineComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() reportData: any = {};
  @Input() templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  @Output() eFormUpdate = new EventEmitter<any>();
  rpoVehicleComponent: FormGroup;
  reportsArr: any = [];
  // loading template values flag
  // loadingTemplate: boolean;
  reportInfo = {group: 'Finance', name: 'RPO by Vehicle Line'};

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
        this._tp.loadTemplateValuesForForm(this.rpoVehicleComponent, this.preProcessTemplateData());
      } else {
        // for finance reprots, a template is getting returned no matter what (selected vehicle line) if empty continue
        this._fr.getMarketGroups(true);
      }
    });
  }

  ngOnInit() {

    this._reportService.updateShowSideBar(true);

    this.rpoVehicleComponent = new FormGroup({
      status: this._fr.status,
      description: this._fr.reportDescription,
      publishDate: this._fr.publishedDate,
      marketingGroup: this._fr.marketGroup,
      modelYear: this._fr.modelYear,
      namePlate: this._fr.nameplate,
      bookCode: this._fr.bookCode,
      vehicleLine: this._fr.vehicleLine,
      publishId: this._fr.publishId,
    });

    this.rpoVehicleComponent.get('status')['controlType'] = { isMulti: false, isString: true };
    this.rpoVehicleComponent.get('description')['controlType'] = { isMulti: false, isString: true };
    this.rpoVehicleComponent.get('publishDate')['controlType'] = { isMulti: false, isString: true, emitEvent: false };
    this.rpoVehicleComponent.get('marketingGroup')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.rpoVehicleComponent.get('modelYear')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.rpoVehicleComponent.get('namePlate')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.rpoVehicleComponent.get('vehicleLine')['controlType'] = { isMulti: true, isString: false, emitEvent: false };
    this.rpoVehicleComponent.get('bookCode')['controlType'] = { isMulti: false, isString: false, emitEvent: false };

    // this.rpoVehicleComponent.get('publishId')['controlType'] = { isMulti: false, isString: true, emitEvent: false };

    // remove validatiors on these fields for option pricing report
    this.rpoVehicleComponent.get('vehicleLine').setValidators(null);

    // if (this.templateData) { this.loadingTemplate = true; }
    
    if (! this._fr.templateLoading) {
      this.rpoVehicleComponent.get('status').enable({emitEvent: false});
      // this.rpoVehicleComponent.get('publishId').enable({emitEvent: false});
      this.rpoVehicleComponent.get('publishDate').enable({emitEvent: false});
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      this.rpoVehicleComponent.get('publishDate').setValue(date);
      this._fr.publishDateFormated = this._fr.formatDateInput(this.rpoVehicleComponent.get('publishDate').value);
    }

    this.rpoVehicleComponent.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        if (this._rc.isFormValid(this.rpoVehicleComponent)) {
          this._fr.templateLoading = false;
          let reportData = this._fr.processForm(form);
          reportData = this._rc.formatReportDates(reportData);
          delete reportData.fromDate;
          delete reportData.toDate;
          this._reportService.updateValidationStatus(reportData);
        } else {
          this._reportService.updateValidationStatus(false);
        }
    });

    this._fr.eTemplateControlLoaded
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(($event) => {
        if (this._rc.isFormValid(this.rpoVehicleComponent)) {
          this.rpoVehicleComponent.updateValueAndValidity({onlySelf: false, emitEvent: true});
        }
      });

    this._fr.setInitialData(this.reportData);
    this.rpoVehicleComponent.get('marketingGroup').enable({emitEvent: false});

    this.rpoVehicleComponent.get('status').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this.getPublishId(form);
    });
    this.rpoVehicleComponent.get('publishDate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.publishDateFormated = this._fr.formatDateInput(this._fr.publishedDate.value);
    });
    this.rpoVehicleComponent.get('marketingGroup').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getModelYears(this._rc.isValidInput(form), this._fr.templateLoading);
    });
    this.rpoVehicleComponent.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getNamePlates(this._rc.isValidInput(form), this._fr.templateLoading);
    });
    this.rpoVehicleComponent.get('namePlate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getVehicleLine2(this._rc.isValidInput(form), this._fr.templateLoading);
    });
    this.rpoVehicleComponent.get('vehicleLine').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getBookCodesByVehicleLineOffering(this._rc.isValidInput(form), this._fr.templateLoading);
        this.getPublishId(form);
      });
    this.rpoVehicleComponent.get('bookCode').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        // this._fr.getModelCode(this._rc.isValidInput(form), this._fr.templateLoading);
        this.getPublishId(form);
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
    this.rpoVehicleComponent.get('vehicleLine').setValidators([Validators.required]);
    this._fr.resetFormGroups();
    this.eDestroyTemplate.emit();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._fr);
  }
  getPublishId(form: any) {
    if (this.rpoVehicleComponent.get('status').value === 'PUB') {
      this._fr.getPublishId(
        this._rc.isValidInput(form),
        this._fr.publishDateFormated,
        false,
        this.rpoVehicleComponent.get('bookCode').value,
        this.rpoVehicleComponent.get('vehicleLine').value);
    } else {
      this._fr.publishId.setValue('0', {emitEvent: false});
    }
  }
}
