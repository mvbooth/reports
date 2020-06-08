import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormGroup, Validators} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import { Marketing } from '../../../classes/Marketing';
import { ReportControls } from '../../../classes/ReportControls';
import {Template} from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-opt-usage-summary',
  templateUrl: './opt-usage-summary.component.html',
  styleUrls: ['./opt-usage-summary.component.scss'],
  providers: [Marketing, Template],
})
export class OptUsageSummaryComponent implements OnInit, OnDestroy, AfterViewInit {
  reportData: any = {};
  @Input() userPrefs: any = {};
  templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  mktClassRef: any;
  optionUsageSummaryReport: any;
  // loading template values flag
  loadingTemplate: boolean;
  reportInfo = {group: 'Marketing', name: 'Option Usage Summary Report'};

  constructor(
    public _mkt: Marketing,
    public _tp: Template,
    private _rc: ReportControls,
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
        this.loadingTemplate = true;
        // preprocess template values and load template
        this._tp.loadTemplateValuesForForm(this.optionUsageSummaryReport, this.templateData);
        this.processTemplate();
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

    this.optionUsageSummaryReport = new FormGroup({
      description: this._mkt.reportDescription,
      modelYear: this._mkt.modelYear,
      marketingGroup: this._mkt.marketGroup,
      geographicMarket: this._mkt.geographicMarket,
      namePlate: this._mkt.nameplate,
      vehicleLine: this._mkt.vehicleLine,
      mmcCode: this._mkt.mmc,
      modelRestrictionString: this._mkt.modelRestrictionString,
      effectiveDate: this._mkt.effectiveDate,
      marketOfferStatus: this._mkt.marketOfferStatus,
      optionDescriptionType: this._mkt.descriptionType,
      optionLanguage: this._mkt.language,
      vdsFamily: this._mkt.filterVdsFamily,
      selectCodes: this._mkt.selectCodes,
      enterCodes: this._mkt.enterCodes,
      selCodesCommaValues: this._mkt.selectedCodes,
      displayRestrictionString: this._mkt.displayRestrictionString,
    });

    this.optionUsageSummaryReport.get('description')['controlType'] = { isMulti: false, isString: true };
    this.optionUsageSummaryReport.get('modelYear')['controlType'] = { isMulti: true, isString: false };
    this.optionUsageSummaryReport.get('marketingGroup')['controlType'] = { isMulti: true, isString: false };
    this.optionUsageSummaryReport.get('geographicMarket')['controlType'] = { isMulti: true, isString: true };
    this.optionUsageSummaryReport.get('namePlate')['controlType'] = { isMulti: true, isString: true };
    this.optionUsageSummaryReport.get('vehicleLine')['controlType'] = { isMulti: true, isString: true };
    this.optionUsageSummaryReport.get('mmcCode')['controlType'] = { isMulti: true, isString: true };
    this.optionUsageSummaryReport.get('modelRestrictionString')['controlType'] = { isMulti: true, isString: true };
    this.optionUsageSummaryReport.get('effectiveDate')['controlType'] = { isMulti: true, isString: false };
    this.optionUsageSummaryReport.get('marketOfferStatus')['controlType'] = { isMulti: true, isString: false };
    this.optionUsageSummaryReport.get('optionDescriptionType')['controlType'] = { isMulti: false, isString: false };
    this.optionUsageSummaryReport.get('optionLanguage')['controlType'] = { isMulti: true, isString: false };
    this.optionUsageSummaryReport.get('vdsFamily')['controlType'] = { isMulti: true, isString: true };
    this.optionUsageSummaryReport.get('selectCodes')['controlType'] = { isMulti: true, isString: true };
    this.optionUsageSummaryReport.get('selCodesCommaValues')['controlType'] = { isMulti: false, isString: false };
    this.optionUsageSummaryReport.get('displayRestrictionString')['controlType'] = { isMulti: false, isString: false };

    this.optionUsageSummaryReport.get('modelYear').enable({emitEvent: false});
    this.optionUsageSummaryReport.get('enterCodes').enable({emitEvent: false});
    this.optionUsageSummaryReport.get('displayRestrictionString').disable({ emitEvent: true });

    this.optionUsageSummaryReport.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (form) => {
        if (this._rc.isFormValid(this.optionUsageSummaryReport)) {
          const reportData = this._mkt.processForm(form, true);
          // Hard coded missing fields for cognos call
          reportData.rmoParam = 'NA';
          reportData.marketingCluster = '-1';
          reportData.lmoParam = 'NA';
          reportData.cmoParam = 'N';
          reportData.marketingNSC = '-1';
          if (reportData.mmcCodeCommaValues === undefined) {
            reportData.mmcCodeCommaValues = 'NA';
          }
          this._reportService.updateValidationStatus(reportData);
        } else {
          this._reportService.updateValidationStatus(false);
        }
      },
    );

    this._mkt.eTemplateControlLoaded
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(($event) => {
        if (this.optionUsageSummaryReport.valid) {
          this.optionUsageSummaryReport.updateValueAndValidity({onlySelf: false, emitEvent: true});
        }
      });

    this.optionUsageSummaryReport.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        this._mkt.getMarketingGroupData(this._rc.isValidInput(val), this.loadingTemplate);
      },
    );

    this.optionUsageSummaryReport.get('vdsFamily').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.loadSelectedCodes(this._rc.isValidInput(val));
        },
      );
    this.optionUsageSummaryReport.get('marketingGroup').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        this._mkt.getMarketData(this._rc.isValidInput(val), this.loadingTemplate);
        this._mkt.getNameplateData(this._rc.isValidInput(val), this.loadingTemplate);
      },
    );

    this.optionUsageSummaryReport.get('geographicMarket').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        this._mkt.getLanguages(this._rc.isValidInput(val), this.loadingTemplate);
        const namePlate = this.optionUsageSummaryReport.get('namePlate').value;
        if (namePlate !== null && namePlate.length) {
          this._mkt.getVehicleLineList(this._rc.isValidInput(val), this.loadingTemplate);
        }
      },
    );

    this.optionUsageSummaryReport.get('namePlate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        const market = this.optionUsageSummaryReport.get('geographicMarket').value;
        if (market !== null && market.length) {
          this._mkt.getVehicleLineList(this._rc.isValidInput(val), this.loadingTemplate);
        }
      },
    );

    this.optionUsageSummaryReport.get('vehicleLine').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        const isValidInput = this._rc.isValidInput(val);
        this._mkt.getMMCCodes(isValidInput, this.loadingTemplate);
        if(!this._mkt.templateLoading) {
          this._mkt.effectiveDate.reset({ value: '', disabled: true }, { emitEvent: false });
        }

        if (val) {
          this.optionUsageSummaryReport.get('optionDescriptionType').enable();
          this._mkt.getVdsCodeByVehicleLine(this._rc.isValidInput(val));
        }
        this._mkt.getMarketOfferStatusList(
          isValidInput,
          this.loadingTemplate,
          this.optionUsageSummaryReport.get('marketOfferStatus')['controlType'].isMulti);
        this.optionUsageSummaryReport.get('displayRestrictionString').enable({ emitEvent: false });
      },
    );

    this.optionUsageSummaryReport.get('marketOfferStatus').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.loadBlockPointList(this._rc.isValidInput(val), val, this.loadingTemplate, true);
        },
      );

    this.optionUsageSummaryReport.get('mmcCode').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        this._mkt.loadModelRestrictionList(this._rc.isValidInput(val), this.loadingTemplate);
      },
    );

    this.optionUsageSummaryReport.get('selectCodes').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
            this._mkt.numberOfSelectedMOs = val.length;
        },
      );
  }

  // Process template data and set field values on a field by field basis.
  processTemplate() {
     // Load VDS Families
     this.optionUsageSummaryReport.get('vdsFamily').setValue(this.templateData.vdsFamily);
     this.optionUsageSummaryReport.controls.displayRestrictionString.setValue(
      this.templateData.displayRestrictionString);
  }

  ngOnDestroy() {
    this.eDestroyTemplate.emit();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._mkt);
    this._mkt.selectedCodesArray = [];
    this._mkt.selectCodesArray = [];
  }

}
