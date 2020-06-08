import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as _compact from 'lodash/compact';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import { Marketing } from '../../../classes/Marketing';
import { ReportControls } from '../../../classes/ReportControls';
import {Template} from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-default-desc-deviation',
  templateUrl: './default-desc-deviation.component.html',
  styleUrls: ['./default-desc-deviation.component.scss'],
  providers: [Marketing, Template],
})
export class DefaultDescDeviationComponent implements OnInit, OnDestroy, AfterViewInit {
  reportData: any = {};
  @Input() userPrefs: any = {};
  templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  dddReport: any;
  // loading template values flag
  loadingTemplate: boolean;
  reportInfo = {group: 'Marketing', name: 'Default Description Deviation Report'};

  contentLabel: string[];

  constructor(
    public _mkt: Marketing,
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
        this._mkt.templateLoading = true;
        // preprocess template values and load template
        this._tp.loadTemplateValuesForForm(this.dddReport, this.templateData);
      }
    });
    this._reportService.getReportData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      if (data) {
        this.reportData = data;
            // set initial form values
        this._mkt.setInitialData(this.reportData.reportData, this.reportData.userPrefs, true);
        this._mkt.descriptionType.enable({emitEvent: false});
        this._mkt.language.enable({emitEvent: false});
        this._mkt.enterCodes.enable({emitEvent: false});
      }
    });
  }

  ngOnInit() {
    // enable and disable initial fields
    this._mkt.modelYear.disable();
    this._mkt.market.disable();

    this._reportService.updateShowSideBar(true);

    this.dddReport = new FormGroup({
      description: this._mkt.reportDescription,
      descriptionType: this._mkt.descriptionType,
      languageList: this._mkt.language,
      vdsFamily: this._mkt.filterVdsFamily,
      selectCodes: this._mkt.selectCodes,
      selCodesCommaValues: this._mkt.selectedCodes,
      enterCodes: this._mkt.enterCodes,
      modelYear: this._mkt.modelYear,
      marketingGroup: this._mkt.marketGroup,
      geographicMarket: this._mkt.geographicMarket,
      namePlate: this._mkt.nameplate,
      vehicleLine: this._mkt.vehicleLine,
      mmcCode: this._mkt.mmc,
      modelRestrictionString: this._mkt.modelRestrictionString,
      effectiveDate: this._mkt.effectiveDate,
      marketOfferStatus: this._mkt.marketOfferStatus,
    });

    this.dddReport.get('description')['controlType'] = { isMulti: false, isString: true };
    this.dddReport.get('descriptionType')['controlType'] = { isMulti: true, isString: false };
    this.dddReport.get('languageList')['controlType'] = { isMulti: true, isString: false };
    this.dddReport.get('vdsFamily')['controlType'] = { isMulti: true, isString: true };
    this.dddReport.get('selectCodes')['controlType'] = { isMulti: true, isString: true };
    this.dddReport.get('selCodesCommaValues')['controlType'] = { isMulti: true, isString: true };
    this.dddReport.get('enterCodes')['controlType'] = { isMulti: true, isString: true };
    this.dddReport.get('modelYear')['controlType'] = { isMulti: true, isString: false };
    this.dddReport.get('marketingGroup')['controlType'] = { isMulti: true, isString: false };
    this.dddReport.get('geographicMarket')['controlType'] = { isMulti: true, isString: true };
    this.dddReport.get('namePlate')['controlType'] = { isMulti: true, isString: true };
    this.dddReport.get('vehicleLine')['controlType'] = { isMulti: true, isString: true };
    this.dddReport.get('mmcCode')['controlType'] = { isMulti: true, isString: true };
    this.dddReport.get('modelRestrictionString')['controlType'] = { isMulti: true, isString: true };
    this.dddReport.get('effectiveDate')['controlType'] = { isMulti: true, isString: false };
    this.dddReport.get('marketOfferStatus')['controlType'] = { isMulti: true, isString: false };

    this.dddReport.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (form) => {
        if (this._rc.isFormValid(this.dddReport) && this._mkt.selectedCodesArray && this._mkt.selectedCodesArray.length > 0) {

          const selectedLabelsFor = [];
          for (const value of form.selCodesCommaValues) {
            for (const rpo of this._mkt.selectedCodesArray) {
              if (rpo.value === value) {
                selectedLabelsFor.push(rpo.value);
              }
            }
          }
          form.selCodesCommaValues = selectedLabelsFor;

          let reportData = this._mkt.processForm(form);
          reportData.marketingNSC = '-1';
          reportData.marketingNSCCommaValues = '-1';
          reportData.marketingCluster = '-1';
          reportData.cmoParam = 'N';
          reportData.lmoParam = 'NA';
          reportData.rmoParam = 'NA';
          reportData.contentDescription = this.contentLabel.join(',');
          reportData.modelYearSuffixCommaValues = '';
          reportData.namePlateCommaValues = reportData.namePlate;
          reportData.optionDescriptionType = reportData.descriptionType;
          reportData.optionDescriptionTypeCommaValues = reportData.descriptionType;
          reportData.optionLangCommaValues = reportData.languageList;
          reportData.mmcCodeCommaValues = reportData.mmcCode;
          reportData.marketingGroupCommaValues = reportData.marketingGroup;
          reportData.vehicleLineCommaValues = reportData.vehicleLine;
          reportData.effectiveDateCommaValues = reportData.effectiveDate;
          reportData.geoMktCommaValues = reportData.geographicMarket;
          reportData.marketingClusterCommaValues = reportData.marketingCluster;
          reportData.marktOfferStatusCommaValues = reportData.marketOfferStatus;
          reportData.optionLanguage = reportData.languageList;
          reportData.selCodesCommaValues = _compact(reportData.selCodesCommaValues.split(',')).join();

          reportData = this._mkt.addSelectedCodes(reportData);
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
        if (this.dddReport.valid) {
          this.dddReport.updateValueAndValidity({onlySelf: false, emitEvent: true});
        }
      });

    this.dddReport.get('vdsFamily').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        this._mkt.selectCodesArray = [];
        this._mkt.loadSelectedCodes(this._rc.isValidInput(val), this.loadingTemplate);
      },
    );

    this.dddReport.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        this._mkt.getMarketingGroupData(this._rc.isValidInput(val), this.loadingTemplate);
      },
    );

    this.dddReport.get('marketingGroup').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        this._mkt.getMarketData(this._rc.isValidInput(val), this.loadingTemplate);
        this._mkt.getNameplateData(this._rc.isValidInput(val), this.loadingTemplate);
      },
    );

    this.dddReport.get('namePlate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        this._mkt.getVehicleLineList(this._rc.isValidInput(val), this.loadingTemplate);
      },
    );

    this.dddReport.get('vehicleLine').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        this._mkt.getMMCCodes(this._rc.isValidInput(val), this.loadingTemplate);
        this._mkt.getBlockPointListForReportsGMNA(this._rc.isValidInput(val), this.loadingTemplate);
        this._mkt.getMarketOfferStatusList(this._rc.isValidInput(val), this.loadingTemplate, true);
        this._mkt.getVdsCodeByVehicleLine(this._rc.isValidInput(val));

        this.buildDescription(val);
      },
    );

    this.dddReport.get('mmcCode').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        this._mkt.loadModelRestrictionList(this._rc.isValidInput(val), this.loadingTemplate);
      },
    );

  }

  buildDescription(val: any) {
    this.contentLabel = [];
    if (val && val.length) {
      val.forEach(
        (item) => {
          this.contentLabel.push(item.description);
      });
    }
  }

  ngOnDestroy() {
    this.eDestroyTemplate.emit();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._mkt);
    this._mkt.selectedCodesArray = [];
    this._mkt.selectCodesArray = [];
  }
}
