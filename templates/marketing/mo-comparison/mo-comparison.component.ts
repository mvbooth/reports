import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as isEqual from 'lodash/isEqual';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import { Marketing } from '../../../classes/Marketing';
import { ReportControls } from '../../../classes/ReportControls';
import {Template} from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-mo-comparison',
  templateUrl: './mo-comparison.component.html',
  styleUrls: ['./mo-comparison.component.scss'],
  providers: [Marketing, Template],
})
export class MoComparisonComponent implements OnInit, OnDestroy, AfterViewInit {
  reportData: any = {};
  @Input() userPrefs: any = {};
  templateData: any;
  mktClassRef: any;
  marketComparisonReport: any;
  allowUpdateMO = false;
  allowMOSorting = false;
  filterOptions: any;
  holdFormVals: any = {};
  isFirstChange = true;
  loadingTemplate = false;
  showSourceSortBy = false;
  showTargetSortBy = false;
  reportInfo = {group: 'Marketing', name: 'Market Offer Comparison Report'};
  vehicleType: any;

  constructor(
    public _mkt: Marketing,
    public _tp: Template,
    public _rc: ReportControls,
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
        this._tp.loadTemplateValuesForForm(this.marketComparisonReport, this.templateData);
        this.updateMarketOfferUI();
        this.processTemplate();
      }
    });
    this._reportService.getReportData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      if (data) {
        this.reportData = data;
            // set initial form values
        this._mkt.setInitialData(this.reportData.reportData, this.reportData.userPrefs);
        this.getVehicleLine();
      }
    });
  }

  ngOnInit() {

    this._reportService.updateShowSideBar(true);

    this.marketComparisonReport = new FormGroup({
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
      availableMo: this._mkt.availableMarketOffers,
      selectedMarketOffers: this._mkt.selectedMarketOffers,
      sortBy1: this._mkt.sortBy1,
      sortBy2: this._mkt.sortBy2,
      sortBy3: this._mkt.sortBy3,
      sortBy4: this._mkt.sortBy4,
      availableMOCheckbox: this._mkt.availableMOCheckbox,
      selectedMOCheckbox: this._mkt.selectedMOCheckbox,
      differenceAll: this._mkt.moDifferenceAll,
      marketOfferAttribute: this._mkt.marketOfferAttribute,
      marketOfferRevision: this._mkt.marketOfferRevision,
    });

    this.marketComparisonReport.get('description')['controlType'] = { isMulti: false, isString: true };
    this.marketComparisonReport.get('modelYear')['controlType'] = { isMulti: true, isString: false };
    this.marketComparisonReport.get('marketingGroup')['controlType'] = { isMulti: true, isString: false };
    this.marketComparisonReport.get('geographicMarket')['controlType'] = { isMulti: true, isString: true };
    this.marketComparisonReport.get('namePlate')['controlType'] = { isMulti: false, isString: true };
    this.marketComparisonReport.get('vehicleLine')['controlType'] = { isMulti: false, isString: true };
    this.marketComparisonReport.get('mmcCode')['controlType'] = { isMulti: true, isString: true };
    this.marketComparisonReport.get('modelRestrictionString')['controlType'] = { isMulti: true, isString: true };
    this.marketComparisonReport.get('effectiveDate')['controlType'] = { isMulti: true, isString: false };
    this.marketComparisonReport.get('marketOfferStatus')['controlType'] = { isMulti: true, isString: false };
    this.marketComparisonReport.get('optionDescriptionType')['controlType'] = { isMulti: false, isString: false };
    this.marketComparisonReport.get('optionLanguage')['controlType'] = { isMulti: true, isString: false };
    this.marketComparisonReport.get('availableMo')['controlType'] = { isMulti: true, isString: false };
    this.marketComparisonReport.get('selectedMarketOffers')['controlType'] = { isMulti: true, isString: false };
    this.marketComparisonReport.get('sortBy1')['controlType'] = { isMulti: false, isString: true };
    this.marketComparisonReport.get('sortBy2')['controlType'] = { isMulti: false, isString: true };
    this.marketComparisonReport.get('sortBy3')['controlType'] = { isMulti: false, isString: true };
    this.marketComparisonReport.get('sortBy4')['controlType'] = { isMulti: false, isString: true };
    this.marketComparisonReport.get('availableMOCheckbox')['controlType'] = { isMulti: false, isString: false };
    this.marketComparisonReport.get('selectedMOCheckbox')['controlType'] = { isMulti: false, isString: false };
    this.marketComparisonReport.get('differenceAll')['controlType'] = { isMulti: false, isString: false };
    this.marketComparisonReport.get('marketOfferAttribute')['controlType'] = { isMulti: false, isString: true };
    this.marketComparisonReport.get('marketOfferRevision')['controlType'] = { isMulti: false, isString: false };

    this.marketComparisonReport.get('sortBy1').enable({emitEvent: false});
    this.marketComparisonReport.get('sortBy2').enable({emitEvent: false});
    this.marketComparisonReport.get('differenceAll').enable({emitEvent: false});
    this.marketComparisonReport.get('marketOfferRevision').enable({emitEvent: false});

    this.marketComparisonReport.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (form) => {
        if (this.isFirstChange || !isEqual(form, this.holdFormVals)) {
          this.holdFormVals = form;
          this.isFirstChange = false;
          let optionalFieldsArray = [];
          if (this._rc.isValidInput(form.mmcCode) || this._rc.isValidInput(form.modelRestrictionString)) {
            optionalFieldsArray = [
              form.mmcCode,
              form.modelRestrictionString,
            ];
          }
          const partialFormValid = this._mkt.processPartialForm(
            [
              form.geographicMarket,
              form.marketingGroup,
              form.modelYear,
              form.namePlate,
              form.vehicleLine,
              form.effectiveDate,
              form.marketOfferStatus,
            ],
            optionalFieldsArray,
          );

          this.partialValidation(partialFormValid);

          this.validateForm(form);
        }
      },
    );

    this.marketComparisonReport.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        this._mkt.getMarketingGroupData(this._rc.isValidInput(val));
      },
    );

    this.marketComparisonReport.get('marketingGroup').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        this._mkt.getMarketData(this._rc.isValidInput(val));
        this._mkt.getNameplateData(this._rc.isValidInput(val));
      },
    );

    this.marketComparisonReport.get('geographicMarket').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        this._mkt.getLanguages(this._rc.isValidInput(val));
        const namePlate = this.marketComparisonReport.get('namePlate').value;
        if (namePlate !== null && namePlate.length) {
          this._mkt.getVehicleLineList(this._rc.isValidInput(val));
        }
      },
    );

    this.marketComparisonReport.get('namePlate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        const market = this.marketComparisonReport.get('geographicMarket').value;
        if (market !== null && market.length) {
          this._mkt.getVehicleLineList(this._rc.isValidInput(val));
        }
      },
    );

    this.marketComparisonReport.get('marketOfferStatus').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.loadBlockPointList(this._rc.isValidInput(val), val, false, true);
        },
      );

    this.marketComparisonReport.get('mmcCode').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        this._mkt.loadModelRestrictionList(this._rc.isValidInput(val));
      },
    );

    this.marketComparisonReport.get('availableMo').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      () => {
        this._mkt.getNumberOfSelectedMOs();
      },
    );

    this.marketComparisonReport.get('selectedMarketOffers').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (offers) => {
        if (offers && offers.length) {
          // marketOfferRevision is defaulted to the first market offer
          this.marketComparisonReport.get('marketOfferRevision').setValue(offers[0], {emitEvent: false});
        }
      },
    );
  }

    // Process template data and set field values on a field by field basis.
    processTemplate() {
      this.marketComparisonReport.controls.differenceAll.setValue(this.templateData.differenceAll[0]);
    }

  partialValidation(partialFormValid) {
    if (partialFormValid) {
      // enough fields have been completed to call 'update market offers'
      this.allowUpdateMO = true;
      this._mkt.allowUpdateMO = true;
    } else {
      if (this.allowUpdateMO) {
        this.allowUpdateMO = false;
        this._mkt.allowUpdateMO = true; // ensures update button is enabled after changing mo search criteria
        this.marketComparisonReport.get('availableMo').reset({value: '', disabled: true}, {emitEvent: false});
        this._mkt.availableMarketOfferArray = [];
        this.marketComparisonReport.get('selectedMarketOffers').reset({value: '', disabled: true}, {emitEvent: false});
        this._mkt.selectedMarketOfferArray = [];
      }
    }
  }

  validateForm(form) {
    if (this._rc.isFormValid(this.marketComparisonReport)) {
      const reportData = this._mkt.processForm(form, true);
      if (reportData.mmcCodeCommaValues === undefined) {
        reportData.mmcCodeCommaValues = 'NA';
      }
      this._reportService.updateValidationStatus(reportData);
    } else {
      this._reportService.updateValidationStatus(false);
    }
  }

  getVehicleLine() {
    this.marketComparisonReport.get('vehicleLine').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        const isValid = this._rc.isValidInput(this._mkt.getVehicleLineValue('id'));
        if (!this._mkt.templateLoading) {
          this._mkt.effectiveDate.reset({ value: '', disabled: true }, { emitEvent: false });
        }

        this._mkt.getMMCCodes(isValid);
        this._mkt.getMarketOfferStatusList(
          isValid,
          false,
          this.marketComparisonReport.get('marketOfferStatus')['controlType'].isMulti);
        if (isValid) {
          const vehicleType = this._mkt.getVehicleTypeFromVehicleLine();
          this._mkt.addVehicleType(vehicleType);
          this.vehicleType = vehicleType;
          if (vehicleType === 'both') {
            this.filterOptions = this._mkt.bothMOFilter;
          } else if (vehicleType === 'C') {
            this.filterOptions = this._mkt.carMOFilter;
          } else if (vehicleType === 'T') {
            this.filterOptions = this._mkt.truckMOFilter;
          }
          this.allowMOSorting = true;
          this.marketComparisonReport.get('optionDescriptionType').enable({emitEvent: false});
          const marketAttributeEl = this.marketComparisonReport.get('marketOfferAttribute');
          marketAttributeEl.enable({emitEvent: false});
          marketAttributeEl.setValue('AVB', {emitEvent: false});
        } else {
          this.allowMOSorting = false;
        }
      },
    );

  }

  updateMarketOfferUI() {
    this._mkt.updateMIOMarketOfferList();
    this.allowUpdateMO = false;
    if (this.templateData && Object.keys(this.templateData).length > 0) {
      this.updateSort();
    } else {
      this.showSourceSortBy = true;
    }
  }

  updateSortBy() {
    if (this._mkt.availableMarketOfferArray.length !== 0) {
      this.showSourceSortBy = true;
    } else {
      this.showSourceSortBy = false;
    }
    if (this._mkt.selectedMarketOfferArray.length !== 0) {
      this.showTargetSortBy = true;
    } else {
      this.showTargetSortBy = false;
    }
  }

  ngOnDestroy() {
    // reset update market offers button validation flag in case report is revisited
    this._mkt.allowUpdateMO = true;

    this.destroySubject$.next();
    this._rc.cleanReportClass(this._mkt);
    this._mkt.availableMarketOfferArray = [];
    this._mkt.selectedMarketOfferArray = [];
  }

  updateSort() {
    if (this.marketComparisonReport.value.selectedMarketOffers) {
      this.showTargetSortBy = true;
    } else {
      this.showTargetSortBy = false;
    }
    if (this.marketComparisonReport.value.availableMo) {
      this.showSourceSortBy = true;
    } else {
      this.showSourceSortBy = false;
    }
  }
}
