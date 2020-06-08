import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrderFulfillment } from '../../../classes/OrderFulfillment';
import { ReportControls } from '../../../classes/ReportControls';
import { Template } from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-order-fullfill-conv',
  templateUrl: './order-fullfill-conv.component.html',
  styleUrls: ['./order-fullfill-conv.component.scss'],
  providers: [OrderFulfillment, Template],
})
export class OrderFullfillConvComponent implements AfterViewInit, OnInit, OnDestroy {
  reportData: any = {};
  templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  conversionReport: any;
  // loading template values flag
  loadingTemplate: boolean;
  formValuesInOrder = ['modelYear', 'marketingGroup', 'geographicMarket', 'namePlate', 'vehicleLine', 'effectiveDate'];
  reportInfo = {group: 'Order Fulfillment', name: 'Order Fulfillment Conversion Report'};

  constructor(
    public _of: OrderFulfillment, 
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
        this.loadingTemplate = true;
        this._tp.loadTemplateValuesForForm(this.conversionReport, this.templateData);
      } 
    });
    this._reportService.getReportData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      if (data) {
        this._of.setInitialData(data);
      }
    });
  }

  ngOnInit() {

    this._reportService.updateShowSideBar(true);

    this.conversionReport = new FormGroup({
      description: this._of.reportDescription,
      modelYear: this._of.modelYear,
      marketingGroup: this._of.marketGroup,
      namePlate: this._of.nameplate,
      vehicleLine: this._of.vehicleProdCode,
      effectiveDate: this._of.effectiveDate,
    });

    this.conversionReport.get('description')['controlType'] = { isMulti: false, isString: true };
    this.conversionReport.get('modelYear')['controlType'] = { isMulti: false, isString: false };
    this.conversionReport.get('marketingGroup')['controlType'] = { isMulti: false, isString: true };
    this.conversionReport.get('namePlate')['controlType'] = { isMulti: false, isString: true };
    this.conversionReport.get('vehicleLine')['controlType'] = { isMulti: false, isString: true };
    this.conversionReport.get('effectiveDate')['controlType'] = { isMulti: false, isString: true };

    this.conversionReport.get('modelYear').enable({ emitEvent: false });

    this.conversionReport.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (form) => {
          if (this._rc.isFormValid(this.conversionReport)) {
            const reportData = this._of.processForm(form);
            this._reportService.updateValidationStatus(reportData);
          } else {
            this._reportService.updateValidationStatus(false);
          }
        },
    );

    this._of.eTemplateControlLoaded
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(($event) => {
        if (this.conversionReport.valid) {
          this.conversionReport.updateValueAndValidity({ onlySelf: false, emitEvent: true });
        }
      });

    this.conversionReport.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._of.getMarketingGroupData(this._rc.isValidInput(val), this.loadingTemplate);
        },
    );

    this.conversionReport.get('marketingGroup').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._of.getNameplateData(this._rc.isValidInput(val), this.loadingTemplate);
        },
    );

    this.conversionReport.get('namePlate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._of.getVehicleLineData(this._rc.isValidInput(val), this.loadingTemplate);
        },
    );

    this.conversionReport.get('vehicleLine').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._of.getBlockPointData(this._rc.isValidInput(val), this.loadingTemplate);
        },
    );

  }

  change(model) {
    const index = this.formValuesInOrder.indexOf(model);
    for (let i = index + 1; i < this.formValuesInOrder.length; i++) {
      const formVal = this.conversionReport.get(this.formValuesInOrder[i]);
      if (formVal) {
        formVal.reset({ value: '', disabled: true }, { emitEvent: true });
      }
    }
  }

  ngOnDestroy() {
    this.eDestroyTemplate.emit();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._of);
  }

}
