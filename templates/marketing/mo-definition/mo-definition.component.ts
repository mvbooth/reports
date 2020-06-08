import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import { Marketing } from '../../../classes/Marketing';
import { ReportControls } from '../../../classes/ReportControls';
import {Template} from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-mo-definition',
  templateUrl: './mo-definition.component.html',
  styleUrls: ['./mo-definition.component.scss'],
  providers: [Marketing, Template],
})
export class MoDefinitionComponent implements OnInit, OnDestroy, AfterViewInit {
  reportData: any = {};
  @Input() userPrefs: any = {};
  templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  mktClassRef: any;
  moDefinitionReport: any;
  // loading template values flag
  loadingTemplate: boolean;
  reportInfo = {group: 'Marketing', name: 'Market Offer Definition Report'};

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
        this.loadingTemplate = true;
        // preprocess template values and load template
        this._tp.loadTemplateValuesForForm(this.moDefinitionReport, this.templateData);
      }
    });
    this._reportService.getReportData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      if (data) {
        this.reportData = data;
            // set initial form values
        this._mkt.setInitialData(this.reportData.reportData, this.reportData.userPrefs, this.loadingTemplate);
      }
    });
  }

  ngOnInit() {

    this._reportService.updateShowSideBar(true);
    
    this.moDefinitionReport = new FormGroup({
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
    });

    this.moDefinitionReport.get('description')['controlType'] = { isMulti: false, isString: true };
    this.moDefinitionReport.get('modelYear')['controlType'] = { isMulti: true, isString: false };
    this.moDefinitionReport.get('marketingGroup')['controlType'] = { isMulti: true, isString: false };
    this.moDefinitionReport.get('geographicMarket')['controlType'] = { isMulti: true, isString: true };
    this.moDefinitionReport.get('namePlate')['controlType'] = { isMulti: true, isString: true };
    this.moDefinitionReport.get('vehicleLine')['controlType'] = { isMulti: true, isString: true };
    this.moDefinitionReport.get('mmcCode')['controlType'] = { isMulti: true, isString: true };
    this.moDefinitionReport.get('modelRestrictionString')['controlType'] = { isMulti: true, isString: true };
    this.moDefinitionReport.get('effectiveDate')['controlType'] = { isMulti: true, isString: false };
    this.moDefinitionReport.get('marketOfferStatus')['controlType'] = { isMulti: true, isString: false };
    this.moDefinitionReport.get('optionDescriptionType')['controlType'] = { isMulti: false, isString: false };
    this.moDefinitionReport.get('optionLanguage')['controlType'] = { isMulti: true, isString: false };
    
    this.moDefinitionReport.get('modelYear').enable({emitEvent: false});
    this.moDefinitionReport.valueChanges.pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (form) => {
        if (this._rc.isFormValid(this.moDefinitionReport)) {
          const reportData = this._mkt.processForm(form, true);
          reportData.marketingCluster = '-1';
          reportData.lmoParam = 'NA';
          reportData.rmoParam = 'NA';
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
        if (this.moDefinitionReport.valid) {
          this.moDefinitionReport.updateValueAndValidity({onlySelf: false, emitEvent: true});
        }
      });

    this.moDefinitionReport.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        this._mkt.getMarketingGroupData(this._rc.isValidInput(val), this.loadingTemplate);
      },
    );

    this.moDefinitionReport.get('marketingGroup').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        this._mkt.getMarketData(this._rc.isValidInput(val), this.loadingTemplate);
        this._mkt.getNameplateData(this._rc.isValidInput(val), this.loadingTemplate);
      },
    );

    this.moDefinitionReport.get('geographicMarket').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        this._mkt.getLanguages(this._rc.isValidInput(val), this.loadingTemplate);
        const namePlate = this.moDefinitionReport.get('namePlate').value;
        if (namePlate !== null && namePlate.length) {
          this._mkt.getVehicleLineList(this._rc.isValidInput(val), this.loadingTemplate);
        }
      },
    );

    this.moDefinitionReport.get('namePlate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        const market = this.moDefinitionReport.get('geographicMarket').value;
        if (market !== null && market.length) {
          this._mkt.getVehicleLineList(this._rc.isValidInput(val), this.loadingTemplate);
        }
      },
    );

    this.moDefinitionReport.get('vehicleLine').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        const isValidInput = this._rc.isValidInput(val);
        this._mkt.getMMCCodes(isValidInput, this.loadingTemplate);

        if (!this._mkt.templateLoading) {
          this._mkt.effectiveDate.reset({ value: '', disabled: true }, { emitEvent: false });
        }
       
        if (val) {
          this.moDefinitionReport.get('optionDescriptionType').enable();
        }
        this._mkt.getMarketOfferStatusList(
          isValidInput,
          this.loadingTemplate,
          this.moDefinitionReport.get('marketOfferStatus')['controlType'].isMulti);
      },
    );

    this.moDefinitionReport.get('marketOfferStatus').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.loadBlockPointList(this._rc.isValidInput(val), val, this.loadingTemplate, true);
        },
      );

    this.moDefinitionReport.get('mmcCode').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        this._mkt.loadModelRestrictionList(this._rc.isValidInput(val), this.loadingTemplate);
      },
    );

  }

  ngOnDestroy() {
    this.eDestroyTemplate.emit();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._mkt);
  }

}
