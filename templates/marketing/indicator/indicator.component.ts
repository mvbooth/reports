import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Marketing } from '../../../classes/Marketing';
import { ReportControls } from '../../../classes/ReportControls';
import { Template } from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-indicator',
  templateUrl: './indicator.component.html',
  styleUrls: ['./indicator.component.scss'],
  providers: [Marketing, Template],
})

export class IndicatorComponent implements OnInit, OnDestroy, AfterViewInit {
  reportData: any = {};
  @Input() userPrefs: any = {};
  templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  IndicatorRpt: any;
  // loading template values flag
  loadingTemplate: boolean;
  reportInfo = {group: 'Marketing', name: 'Indicator Report'};

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
        this._tp.loadTemplateValuesForForm(this.IndicatorRpt, this.preProcessTemplateData());
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

    this._mkt.setDefaultGroupInIndicatorRpt();

    this.IndicatorRpt = new FormGroup({
      description: this._mkt.reportDescription,
      modelYear: this._mkt.modelYear,
      marketingGroup: this._mkt.marketGroup,
      geographicMarket: this._mkt.geographicMarket,
      namePlate: this._mkt.nameplate,
      vehicleLine: this._mkt.vehicleLine,
      effectiveDate: this._mkt.effectiveDate,
      marketOfferStatus: this._mkt.marketOfferStatus,
      optionDescriptionType: this._mkt.descriptionType,
      optionLanguage: this._mkt.language,
      groupBy: this._mkt.groupBy,
      displayRestrictionString: this._mkt.displayRestrictionString,
      group: this._mkt.group,
    });

    this.IndicatorRpt.get('description')['controlType'] = { isMulti: false, isString: true };
    this.IndicatorRpt.get('modelYear')['controlType'] = { isMulti: false, isString: false };
    this.IndicatorRpt.get('marketingGroup')['controlType'] = { isMulti: false, isString: false };
    this.IndicatorRpt.get('geographicMarket')['controlType'] = { isMulti: false, isString: true };
    this.IndicatorRpt.get('namePlate')['controlType'] = { isMulti: false, isString: true };
    this.IndicatorRpt.get('vehicleLine')['controlType'] = { isMulti: false, isString: true };
    this.IndicatorRpt.get('effectiveDate')['controlType'] = { isMulti: false, isString: false };
    this.IndicatorRpt.get('marketOfferStatus')['controlType'] = { isMulti: false, isString: false };
    this.IndicatorRpt.get('optionDescriptionType')['controlType'] = { isMulti: false, isString: false };
    this.IndicatorRpt.get('optionLanguage')['controlType'] = { isMulti: false, isString: false };
    this.IndicatorRpt.get('groupBy')['controlType'] = { isMulti: false, isString: true };
    this.IndicatorRpt.get('displayRestrictionString')['controlType'] = { isMulti: false, isString: false };
    this.IndicatorRpt.get('group')['controlType'] = { isMulti: false, isString: false };

    this.IndicatorRpt.get('groupBy').disable({ emitEvent: true });
    this.IndicatorRpt.get('groupBy').setValidators([Validators.required]);
    this.IndicatorRpt.get('modelYear').enable({ emitEvent: false });
    this.IndicatorRpt.get('group').enable({ emitEvent: false });
    this.IndicatorRpt.get('displayRestrictionString').disable({ emitEvent: true });

    this.IndicatorRpt.valueChanges.pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (form) => {
          if (this._rc.isFormValid(this.IndicatorRpt)) {
            const reportData = this._mkt.processForm(form, true);
            reportData.marketingCluster = '-1';
            reportData.lmoParam = 'NA';
            reportData.rmoParam = 'NA';
            reportData.cmoParam = 'N';
            reportData.marketingNSC = '-1';
            this._reportService.updateValidationStatus(reportData);
          } else {
            this._reportService.updateValidationStatus(false);
          }
        },
    );

    this._mkt.eTemplateControlLoaded
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(($event) => {
        if (this.IndicatorRpt.valid) {
          this.IndicatorRpt.updateValueAndValidity({ onlySelf: false, emitEvent: true });
        }
      });

    this.IndicatorRpt.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.getAuthorizedMarketGroupListHierarchy(this._rc.isValidInput(val), this.loadingTemplate);
        },
    );

    this.IndicatorRpt.get('marketingGroup').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.getNameplateData(this._rc.isValidInput(val), this.loadingTemplate);
          this._mkt.getMarketData(this._rc.isValidInput(val), this.loadingTemplate);
        },
    );

    this.IndicatorRpt.get('geographicMarket').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          if (this.IndicatorRpt.get('namePlate').value && this.IndicatorRpt.get('namePlate').value !== '') {
            this._mkt.getAuthorizedVehicleLineObjectListForReports(this._rc.isValidInput(val), this.loadingTemplate);
          }
        },
    );

    this.IndicatorRpt.get('namePlate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          if (this.IndicatorRpt.get('geographicMarket').value && this.IndicatorRpt.get('geographicMarket').value !== '') {
            this._mkt.getAuthorizedVehicleLineObjectListForReports(this._rc.isValidInput(val), this.loadingTemplate);
          }
        },
    );

    this.IndicatorRpt.get('vehicleLine').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.getMarketOfferStatusList(
            this._rc.isValidInput(val),
            this.loadingTemplate,
            this.IndicatorRpt.get('marketOfferStatus')['controlType'].isMulti);
          this._mkt.getLanguages(this._rc.isValidInput(val), this.loadingTemplate);
          this._mkt.getDescriptionType(this._rc.isValidInput(val));

          // Populate to user's preference
          if (this.IndicatorRpt.get('languageList')) {
            this.IndicatorRpt.get('languageList').setValue(this.userPrefs.marketOfferLangId);
          }

          if (this.IndicatorRpt.get('optionDescriptionType')) {
            this.IndicatorRpt.get('optionDescriptionType').setValue(this.userPrefs.marketOfferDescTypeId);
          }

          if (val) {
            this._mkt.getGroupByIndicatorRptGMNA(this._rc.isValidInput(val), val.vehicleType === 'C');
          }
          this.IndicatorRpt.get('displayRestrictionString').enable({ emitEvent: false });
          this.IndicatorRpt.get('groupBy').enable({ emitEvent: false });
        },
    );

    this.IndicatorRpt.get('marketOfferStatus').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          if (this.IndicatorRpt.get('geographicMarket').value && this.IndicatorRpt.get('geographicMarket').value !== '') {
            this._mkt.loadBlockPointList(this._rc.isValidInput(val), val, this.loadingTemplate, false);
          }
        },
    );
  }

  preProcessTemplateData(): any {
    const template = this.templateData;
    const templateKeys = Object.keys(template);
    // set radio control value
    const group = 'group';
    if (templateKeys.indexOf(group) !== -1) {
      template[group] = template[group][0];
    }
    return template;
  }

  // Process template data and set field values on a field by field basis.
  processTemplate() {
    this.IndicatorRpt.controls.group.setValue(this.templateData.group);
    this.IndicatorRpt.controls.displayRestrictionString.setValue(this.templateData.displayRestrictionString);
  }

  ngOnDestroy() {
    this.eDestroyTemplate.emit();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._mkt);
  }
}
