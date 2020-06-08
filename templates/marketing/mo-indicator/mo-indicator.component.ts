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
  selector: 'mvp-mo-indicator',
  templateUrl: './mo-indicator.component.html',
  styleUrls: ['./mo-indicator.component.scss'],
  providers: [Marketing, Template],
})

export class MoIndicatorComponent implements OnInit, OnDestroy, AfterViewInit {
  reportData: any = {};
  @Input() userPrefs: any = {};
  templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  MoIndRpt: any;
  // loading template values flag
  loadingTemplate: boolean;
  indicator = [
    {label: 'A - Available', value: 'A'},
    {label: 'G - Grouped in Option', value: 'G'},
    {label: 'I - Included', value: 'I'},
    {label: 'P - Included PEG', value: 'P'},
    ];
  reportInfo = {group: 'Marketing', name: 'Market Offer Indicator Report'};

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
        this._tp.loadTemplateValuesForForm(this.MoIndRpt, this.preProcessTemplateData());
        this.processTemplate();
        this._mkt.setAvailabilityIndicators(this.templateData.availabilityIndicator, this.loadingTemplate);
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

    this.MoIndRpt = new FormGroup({
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
      availabilityIndicator: this._mkt.indicator,
      groupBy: this._mkt.groupBy,
      displayRestrictionString: this._mkt.displayRestrictionString,
      group: this._mkt.group,
    });

    this.MoIndRpt.get('description')['controlType'] = { isMulti: false, isString: true };
    this.MoIndRpt.get('modelYear')['controlType'] = { isMulti: false, isString: false };
    this.MoIndRpt.get('marketingGroup')['controlType'] = { isMulti: false, isString: false };
    this.MoIndRpt.get('geographicMarket')['controlType'] = { isMulti: false, isString: true };
    this.MoIndRpt.get('namePlate')['controlType'] = { isMulti: false, isString: true };
    this.MoIndRpt.get('vehicleLine')['controlType'] = { isMulti: false, isString: true };
    this.MoIndRpt.get('effectiveDate')['controlType'] = { isMulti: false, isString: false };
    this.MoIndRpt.get('marketOfferStatus')['controlType'] = { isMulti: false, isString: false };
    this.MoIndRpt.get('optionDescriptionType')['controlType'] = { isMulti: false, isString: false };
    this.MoIndRpt.get('optionLanguage')['controlType'] = { isMulti: false, isString: false };
    this.MoIndRpt.get('availabilityIndicator')['controlType'] = { isMulti: false, isString: false };
    this.MoIndRpt.get('groupBy')['controlType'] = { isMulti: false, isString: true };
    this.MoIndRpt.get('displayRestrictionString')['controlType'] = { isMulti: false, isString: false };
    this.MoIndRpt.get('group')['controlType'] = { isMulti: false, isString: false };

    this.MoIndRpt.get('groupBy').disable({ emitEvent: true });
    this.MoIndRpt.get('groupBy').setValidators([Validators.required]);
    this.MoIndRpt.get('modelYear').enable({ emitEvent: false });
    this.MoIndRpt.get('group').enable({ emitEvent: false });
    this.MoIndRpt.get('displayRestrictionString').disable({ emitEvent: true });
    this.MoIndRpt.get('availabilityIndicator').enable({ emitEvent: false });

    this.MoIndRpt.valueChanges.pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (form) => {
          if (this._rc.isFormValid(this.MoIndRpt)) {
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
        if (this.MoIndRpt.valid) {
          this.MoIndRpt.updateValueAndValidity({ onlySelf: false, emitEvent: true });

        }
      });

    this.MoIndRpt.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.getAuthorizedMarketGroupListHierarchy(this._rc.isValidInput(val), this.loadingTemplate);
          },
      );

    this.MoIndRpt.get('marketingGroup').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.getNameplateData(this._rc.isValidInput(val), this.loadingTemplate);
          this._mkt.getMarketData(this._rc.isValidInput(val), this.loadingTemplate);
        },
      );

    this.MoIndRpt.get('geographicMarket').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          const namePlate = this.MoIndRpt.get('namePlate').value;
          if (namePlate !== null && namePlate.length) {
            this._mkt.getAuthorizedVehicleLineObjectListForReports(this._rc.isValidInput(val), this.loadingTemplate);
          }
        },
      );

    this.MoIndRpt.get('namePlate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          if (this.MoIndRpt.get('geographicMarket').value !== '') {
            this._mkt.getAuthorizedVehicleLineObjectListForReports(this._rc.isValidInput(val), this.loadingTemplate);
          }
        },
      );

    this.MoIndRpt.get('vehicleLine').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.getMarketOfferStatusList(
            this._rc.isValidInput(val),
            this.loadingTemplate,
            this.MoIndRpt.get('marketOfferStatus')['controlType'].isMulti);
          this._mkt.getLanguages(this._rc.isValidInput(val), this.loadingTemplate);
          this._mkt.getDescriptionType(this._rc.isValidInput(val));

          // Populate to user's preference
          if (this.MoIndRpt.get('languageList')) {
            this.MoIndRpt.get('languageList').setValue(this.userPrefs.marketOfferLangId);
          }

          if (this.MoIndRpt.get('optionDescriptionType')) {
            this.MoIndRpt.get('optionDescriptionType').setValue(this.userPrefs.marketOfferDescTypeId);
          }

          if (val) {
            this._mkt.getGroupByIndicatorRptGMNA(this._rc.isValidInput(val), val.vehicleType === 'C');
          }
          this.MoIndRpt.get('displayRestrictionString').enable({ emitEvent: false });
          this.MoIndRpt.get('groupBy').enable({ emitEvent: false });
        },
      );

    this.MoIndRpt.get('marketOfferStatus').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          if (this.MoIndRpt.get('geographicMarket').value && this.MoIndRpt.get('geographicMarket').value !== '') {
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
    this.MoIndRpt.controls.group.setValue(this.templateData.group);
    this.MoIndRpt.controls.displayRestrictionString.setValue(this.templateData.displayRestrictionString);
    this.loadingTemplate = false;

  }

  ngOnDestroy() {
    this.eDestroyTemplate.emit();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._mkt);
  }
}
