import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Logical } from '../../../classes/Logical';
import { Marketing } from '../../../classes/Marketing';
import { ReportControls } from '../../../classes/ReportControls';
import { Template } from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-blkpt-mo-comparison',
  templateUrl: './blkpt-mo-comparison.component.html',
  styleUrls: ['./blkpt-mo-comparison.component.scss'],
  providers: [Marketing, Template],
})

export class BlkptMoComparisonComponent implements AfterViewInit, OnInit, OnDestroy {
  // tslint:disable:max-line-length
  reportData: any;
  @Input() userPrefs: any = {};
  templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  blkptMoComparisonForm: FormGroup;

  // additional form data required by Cognos
  addtlFormData: any = {};
  // loading template values flag
  loadingTemplate: boolean;
  loopCounter = 0;
  reportInfo = {group: 'Marketing', name: 'Blockpoint Market Offer Comparison Report'};

  constructor(
    public _mkt: Marketing,
    public _tp: Template,
    readonly _rc: ReportControls,
    public _logical: Logical,
    private _reportService: ReportService,
    private route: ActivatedRoute) { }
  destroySubject$: Subject<void> = new Subject();

  ngAfterViewInit() {
    this._reportService.handleInit(this.route.snapshot.paramMap.get('templateName'), this.reportInfo);
    this._reportService.getTemplateData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      this.templateData = data;
      if (this.templateData && Object.keys(this.templateData).length > 0) {
        this._mkt.templateLoading = true;
        // preprocess template values and load template
        this._tp.loadTemplateValuesForForm(this.blkptMoComparisonForm, this.preProcessTemplateData());
      }
    });
    this._reportService.getReportData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      if (data) {
        this.reportData = data;
        this._mkt.setInitialData(this.reportData.reportData, this.reportData.userPrefs);
      }
    });
  }

  ngOnInit() {

    this._reportService.updateShowSideBar(true);

    this.blkptMoComparisonForm = new FormGroup({

      description: this._mkt.reportDescription,
      modelYear: this._mkt.modelYear,
      marketingGroup: this._mkt.marketGroup,
      geographicMarket: this._mkt.geographicMarket,
      namePlate: this._mkt.nameplate,
      vehicleLine: this._mkt.vehicleLine,
      mmcCode: this._mkt.mmc,
      modelRestrictionString: this._mkt.modelRestrictionString,
      marketOfferStatusFrom: this._mkt.marketOfferStatus,
      effectiveDateFrom: this._mkt.effectiveDate,
      marketOfferStatusTo: this._mkt.marketOfferStatusTo,
      effectiveDateTo: this._mkt.previousEffectiveDate,
      optionDescriptionType: this._mkt.descriptionType,
      optionLanguage: this._mkt.language,
      report: this._mkt.group,
      isLongReport: this._mkt.isLongReport,
    });

    this.blkptMoComparisonForm.get('description')['controlType'] = { isMulti: false, isString: true };
    this.blkptMoComparisonForm.get('modelYear')['controlType'] = { isMulti: true, isString: false };
    this.blkptMoComparisonForm.get('marketingGroup')['controlType'] = { isMulti: false, isString: false };
    this.blkptMoComparisonForm.get('geographicMarket')['controlType'] = { isMulti: false, isString: true };
    this.blkptMoComparisonForm.get('namePlate')['controlType'] = { isMulti: false, isString: true };
    this.blkptMoComparisonForm.get('vehicleLine')['controlType'] = { isMulti: false, isString: true, isObject: true, emitEvent: false };
    this.blkptMoComparisonForm.get('mmcCode')['controlType'] = { isMulti: true, isString: true, emitEvent: false };
    this.blkptMoComparisonForm.get('modelRestrictionString')['controlType'] = { isMulti: true, isString: true, emitEvent: false };
    this.blkptMoComparisonForm.get('marketOfferStatusFrom')['controlType'] = { isMulti: false, isString: false };
    this.blkptMoComparisonForm.get('effectiveDateFrom')['controlType'] = { isMulti: false, isString: true, emitEvent: false };
    this.blkptMoComparisonForm.get('marketOfferStatusTo')['controlType'] = { isMulti: false, isString: false };
    this.blkptMoComparisonForm.get('effectiveDateTo')['controlType'] = { isMulti: false, isString: true, emitEvent: false };
    this.blkptMoComparisonForm.get('optionDescriptionType')['controlType'] = { isMulti: false, isString: false };
    this.blkptMoComparisonForm.get('optionLanguage')['controlType'] = { isMulti: false, isString: false };
    this.blkptMoComparisonForm.get('isLongReport').setValue(true);

    this.blkptMoComparisonForm.get('isLongReport').enable({ emitEvent: false });

    this._mkt.mmc.setValue(null);

    this.blkptMoComparisonForm.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        if (this._rc.isFormValid(this.blkptMoComparisonForm)) {
          let reportData = this._mkt.processForm(form);
          reportData = this.reformatBlkptMoComparisonReportData(reportData);
          if (reportData.mmcCodeCommaValues === undefined) {
            reportData.mmcCodeCommaValues = 'NA';
          }
          if (reportData.mmcCode === undefined) {
            reportData.mmcCode = '0';
          }
          if (reportData.modelRestrictionString === undefined) {
            reportData.modelRestrictionString = '0';
          }
          this._reportService.updateValidationStatus(reportData);
        } else {
          this._reportService.updateValidationStatus(false);
        }
      });

    this.blkptMoComparisonForm.get('report').setValue('BPMO');
    this.blkptMoComparisonForm.get('report').enable({ emitEvent: false });

    this.blkptMoComparisonForm.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.getMarketingGroupData(this._rc.isValidInput(val));
        },
      );

    this.blkptMoComparisonForm.get('marketingGroup').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.getMarketData(this._rc.isValidInput(val));
          this._mkt.getNameplateData(this._rc.isValidInput(val));
        },
      );

    this.blkptMoComparisonForm.get('geographicMarket').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          if (this.blkptMoComparisonForm.get('namePlate').value && this.blkptMoComparisonForm.get('namePlate').value !== '') {
            this._mkt.getVehicleLineList(this._rc.isValidInput(val));
          }
        },
      );

    this.blkptMoComparisonForm.get('namePlate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          if (this.blkptMoComparisonForm.get('geographicMarket') && this.blkptMoComparisonForm.get('geographicMarket').value !== '') {
            this._mkt.getVehicleLineList(this._rc.isValidInput(val));
          }
        },
      );

    this.blkptMoComparisonForm.get('vehicleLine').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.getMMCCodes(this._rc.isValidInput(val));
          this.getMarketOfferStatusListsForMoComparison(val);
          if (val) {
            this.blkptMoComparisonForm.get('optionDescriptionType').enable();
          }
        },
      );

    this.blkptMoComparisonForm.get('mmcCode').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.loadModelRestrictionList(this._rc.isValidInput(val));
        },
      );

    this.blkptMoComparisonForm.get('modelRestrictionString').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
        },
      );

    this.blkptMoComparisonForm.get('marketOfferStatusFrom').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.loadBlockPointListForBPComparisonReportsFrom(this._rc.isValidInput(val), val);
          this.blkptMoComparisonForm.get('effectiveDateFrom').reset({ value: '', disabled: false }, { emitEvent: false});
        },
      );

    this.blkptMoComparisonForm.get('marketOfferStatusTo').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.loadBlockPointListForBPComparisonReportsTo(this._rc.isValidInput(val), val);
          this.blkptMoComparisonForm.get('effectiveDateTo').reset({ value: '', disabled: false }, { emitEvent: false});
        },
      );

    this.blkptMoComparisonForm.get('effectiveDateFrom').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((val) => {
        this._mkt.filterEffectiveDates(this._rc.isValidInput(val), val);
      });

    this.blkptMoComparisonForm.get('effectiveDateTo').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          if (!this._mkt.templateLoading) {
            this.blkptMoComparisonForm.get('optionDescriptionType').enable();
            this.blkptMoComparisonForm.get('optionLanguage').enable();
          }
        });
  }

  handleETemplateControlLoaded() {
    this._mkt.templateLoading = false;
    if (this.blkptMoComparisonForm.valid) {
      this.blkptMoComparisonForm.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    }
  }

  preProcessTemplateData(): any {
    // tslint:disable-next-line:prefer-const
    const template = this.templateData;
    const templateKeys = Object.keys(template);

    // set radio control value
    const radio = 'report';

    if (templateKeys.indexOf(radio) !== -1) {
      template[radio] = template[radio][0];
    }

    return template;
  }

  getMarketOfferStatusListsForMoComparison(val: any) {
    if (this._rc.isValidInput(val)) {
      this._mkt.getMarketOfferStatusList(true, false, this.blkptMoComparisonForm.get('marketOfferStatusFrom')['controlType'].isMulti);
      if (!this._mkt.templateLoading) {
        this.blkptMoComparisonForm.get('marketOfferStatusFrom').enable({ emitEvent: false });
        this.blkptMoComparisonForm.get('marketOfferStatusTo').enable({ emitEvent: false });
      }
    } else {
      this.resetCompareBoxes();
    }
  }

  resetCompareBoxes() {
    this.blkptMoComparisonForm.get('marketOfferStatusFrom').reset({ value: '', disabled: true },
      { emitEvent: !this._mkt.templateLoading });
    this.blkptMoComparisonForm.get('marketOfferStatusTo').reset({ value: '', disabled: true },
      { emitEvent: !this._mkt.templateLoading });
  }

  // reformat/add required report parameters before posting data
  reformatBlkptMoComparisonReportData(reportData: any): any {
    // set effective date descriptions
    // tslint:disable-next-line:max-line-length
    if (Array.isArray(this._mkt.effectiveDateArray) && this._mkt.effectiveDateArray.length) {
      this.addtlFormData.effeDtForCompareFrmBlkPoint = this._mkt.getEffDateDescsForBpComparison(reportData.effectiveDateFrom, this._mkt.effectiveDateArray);

    }
    // tslint:disable-next-line:max-line-length
    if (Array.isArray(this._mkt.filteredEffectiveDateArray) && this._mkt.filteredEffectiveDateArray.length) {
      this.addtlFormData.effeDtForCompareToBlkPoint = this._mkt.getEffDateDescsForBpComparison(reportData.effectiveDateTo, this._mkt.filteredEffectiveDateArray);

    }

    this.addtlFormData.minorBpFrom = this._mkt.getMinorBp(this._mkt.effectiveDateArray, reportData.effectiveDateFrom);
    this.addtlFormData.minorBpTo = this._mkt.getMinorBp(this._mkt.toEffectiveDateArray, reportData.effectiveDateTo);
    this.addtlFormData.modelYearFromEffDate = this._mkt.getModelYearEffDate(this._mkt.effectiveDateArray, reportData.effectiveDateFrom);
    this.addtlFormData.modelYearToEffDate = this._mkt.getModelYearEffDate(this._mkt.toEffectiveDateArray, reportData.effectiveDateTo);

    // add ComparmodelYear param
    this.addtlFormData.ComparmodelYear = reportData.modelYear;

    // add marketId param and displayDescMktId param
    this.addtlFormData.marketId = reportData.geographicMarket;
    this.addtlFormData.displayDescMktId = reportData.geographicMarket;

    // add defaultDescriptionsFrom field
    this.addtlFormData.displayDescriptionsFrom = reportData.vehicleLine;

    // add mdlYrSufxValues param
    this.addtlFormData.mdlYrSufxValues = '0';

    // add modelYearSufxTextValues param
    this.addtlFormData.modelYearSufxTextValues = '0';

    // add modelYearSuffix param
    this.addtlFormData.modelYearSuffix = '0000';

    // add market offer status descriptions
    // tslint:disable-next-line:max-line-length
    this.addtlFormData.mktStsFrmDesc = this._logical.getLabelsFromSelectedValues(reportData.marketOfferStatusFrom, this._mkt.marketOfferStatusArray);
    // tslint:disable-next-line:max-line-length
    this.addtlFormData.mktStsToDesc = this._logical.getLabelsFromSelectedValues(reportData.marketOfferStatusTo, this._mkt.marketOfferStatusArray);
    this.addtlFormData.cmoParam = 'N';
    this.addtlFormData.lmoParam = this.addtlFormData.rmoParam = 'NA';
    // tslint:disable-next-line:max-line-length
    this.addtlFormData.marketingNSC = this.addtlFormData.modelYearSuffixFromEffDate = this.addtlFormData.modelYearSuffixToEffDate = this.addtlFormData.marketingCluster = '';
    this.addtlFormData.mmcCodes = this._logical.getLabelsFromSelectedValues(reportData.mmcCode, this._mkt.mmcArray);
    this.addtlFormData.version = '-1';

    return Object.assign(this.addtlFormData, reportData);
  }

  ngOnDestroy() {
    this.eDestroyTemplate.emit();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._mkt);
  }

}
