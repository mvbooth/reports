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
  selector: 'mvp-code-usage',
  templateUrl: './code-usage.component.html',
  styleUrls: ['./code-usage.component.scss'],
  providers: [OrderFulfillment, Template],
})
export class CodeUsageComponent implements AfterViewInit, OnInit, OnDestroy {
  reportData: any = {};
  templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  codeUsageForm: any;
  // loading template values flag
  loadingTemplate: boolean;
  reportInfo = {group: 'Order Fulfillment', name: 'Code Usage Report'};

  constructor(
    public _of: OrderFulfillment, 
    public _tp: Template, 
    private _rc: ReportControls,
    private _reportService: ReportService,
    private route: ActivatedRoute) {}
  destroySubject$: Subject<void> = new Subject();

  ngAfterViewInit() {
    this._reportService.handleInit(this.route.snapshot.paramMap.get('templateName'), this.reportInfo);
    this._reportService.getTemplateData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      this.templateData = data;
      if (this.templateData && Object.keys(this.templateData).length > 0) {
        this._tp.loadTemplateValuesForForm(this.codeUsageForm, this.templateData);
      } 
    });
    this._reportService.getReportData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      if (data) {
        this._of.setInitialData(data);
        this._of.getOptionCategoryData();
      }
    });
  }
  
  ngOnInit() {

    this._reportService.updateShowSideBar(true);

    this.codeUsageForm = new FormGroup({
      description: this._of.reportDescription,
      modelYear: this._of.modelYear,
      marketingGroup: this._of.marketGroup,
      geographicMarket: this._of.market,
      namePlate: this._of.nameplate,
      bookCode: this._of.bookCode,
      optionGroup: this._of.optionCategory,
    });

    this.codeUsageForm.get('description')['controlType'] = { isMulti: false, isString: true };
    this.codeUsageForm.get('modelYear')['controlType'] = { isMulti: true, isString: false };
    this.codeUsageForm.get('marketingGroup')['controlType'] = { isMulti: true, isString: true };
    this.codeUsageForm.get('geographicMarket')['controlType'] = { isMulti: true, isString: true };
    this.codeUsageForm.get('namePlate')['controlType'] = { isMulti: true, isString: true };
    this.codeUsageForm.get('bookCode')['controlType'] = { isMulti: true, isString: true };
    this.codeUsageForm.get('optionGroup')['controlType'] = { isMulti: true, isString: true };

    this.codeUsageForm.get('modelYear').enable({emitEvent: false});
    this.codeUsageForm.get('optionGroup').enable({emitEvent: false});

    this.codeUsageForm.valueChanges
      .pipe(takeUntil(this.destroySubject$)).subscribe((form) => {
        if (this._rc.isFormValid(this.codeUsageForm)) {
          const reportData = this._of.processForm(form);
          reportData.modelYearSuffix = '~';
          this._reportService.updateValidationStatus(reportData);
        } else {
          this._reportService.updateValidationStatus(false);
        }
      },
    );

    this._of.eTemplateControlLoaded
      .pipe(takeUntil(this.destroySubject$)).subscribe(($event) => {
        if (this.codeUsageForm.valid) {
          this.codeUsageForm.updateValueAndValidity({onlySelf: false, emitEvent: true});
        }
      },
    );

    this.codeUsageForm.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$)).subscribe((val) => {
        this._of.getMarketingGroupData(this._rc.isValidInput(val), this.loadingTemplate);
      },
    );

    this.codeUsageForm.get('marketingGroup').valueChanges
      .pipe(takeUntil(this.destroySubject$)).subscribe((val) => {
        if (val) {
          this._of.getMarketData((this._rc.isValidInput(val)), this.loadingTemplate);
        }
      },
    );

    this.codeUsageForm.get('geographicMarket').valueChanges
      .pipe(takeUntil(this.destroySubject$)).subscribe((val) => {
        this._of.getNameplateData(this._rc.isValidInput(val), this.loadingTemplate);
      },
    );

    this.codeUsageForm.get('namePlate').valueChanges
      .pipe(takeUntil(this.destroySubject$)).subscribe((val) => {
        this._of.getBookCodeData(this._rc.isValidInput(val), this.loadingTemplate);
      },
    );
  }

  ngOnDestroy() {
    this.eDestroyTemplate.emit();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._of);
  }
}
