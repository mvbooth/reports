import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as isEqual from 'lodash/isEqual';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../../../shared/notification.service';
import { Marketing } from '../../../classes/Marketing';
import { ReportControls } from '../../../classes/ReportControls';
import {Template} from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-mkt-intent-overview',
  templateUrl: './mkt-intent-overview.component.html',
  styleUrls: ['./mkt-intent-overview.component.scss'],
  providers: [Marketing, Template],
})
export class MktIntentOverviewComponent implements OnInit, OnDestroy, AfterViewInit {

  reportData: any = {};
  @Input() userPrefs: any = {};
  templateData: any = {};
  marketingIntentReport: any;
  allowUpdateMO = true;
  allowMOSorting = false;
  filterOptions: any;
  holdFormVals: any = {};
  isFirstChange = true;
  partialFormValid: boolean;
  loadingTemplate = false;
  showAMOCheckBox = false;
  showSMOCheckBox = false;
  reportInfo = {group: 'Marketing', name: 'Marketing Intent Overview Report'};
  sortDisable = false;
  sort2Disable = false;
  sort3Disable = false;
  sort4Disable = false;
  vehicleType: any;

  constructor(
    public _mkt: Marketing,
    public _tp: Template,
    public _rc: ReportControls,
    readonly _notify: NotificationService,
    private _reportService: ReportService,
    private route: ActivatedRoute) { }

  destroySubject$: Subject<void> = new Subject();

  @ViewChild('pl') pickList: any;

  ngAfterViewInit() {
    this._reportService.handleInit(this.route.snapshot.paramMap.get('templateName'), this.reportInfo);
    this._reportService.getTemplateData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      this.templateData = data;
      if (this.templateData && Object.keys(this.templateData).length > 0) {
        this._mkt.templateLoading = true;
        // preprocess template values and load template
        this._tp.loadTemplateValuesForForm(this.marketingIntentReport, this.templateData);
        this.updateMarketOfferUI();
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

    this.marketingIntentReport = new FormGroup({
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
      isLongReport: this._mkt.isLongReport,
    });

    this.marketingIntentReport.get('description')['controlType'] = { isMulti: false, isString: true };
    this.marketingIntentReport.get('modelYear')['controlType'] = { isMulti: true, isString: false };
    this.marketingIntentReport.get('marketingGroup')['controlType'] = { isMulti: true, isString: false };
    this.marketingIntentReport.get('geographicMarket')['controlType'] = { isMulti: true, isString: true };
    this.marketingIntentReport.get('namePlate')['controlType'] = { isMulti: true, isString: true };
    this.marketingIntentReport.get('vehicleLine')['controlType'] = { isMulti: true, isString: true };
    this.marketingIntentReport.get('mmcCode')['controlType'] = { isMulti: true, isString: true };
    this.marketingIntentReport.get('modelRestrictionString')['controlType'] = { isMulti: true, isString: true };
    this.marketingIntentReport.get('effectiveDate')['controlType'] = { isMulti: true, isString: false };
    this.marketingIntentReport.get('marketOfferStatus')['controlType'] = { isMulti: true, isString: false };
    this.marketingIntentReport.get('optionDescriptionType')['controlType'] = { isMulti: false, isString: false };
    this.marketingIntentReport.get('optionLanguage')['controlType'] = { isMulti: true, isString: false };
    this.marketingIntentReport.get('availableMo')['controlType'] = { isMulti: true, isString: false };
    this.marketingIntentReport.get('selectedMarketOffers')['controlType'] = { isMulti: true, isString: false };
    this.marketingIntentReport.get('sortBy1')['controlType'] = { isMulti: false, isString: true };
    this.marketingIntentReport.get('sortBy2')['controlType'] = { isMulti: false, isString: true };
    this.marketingIntentReport.get('sortBy3')['controlType'] = { isMulti: false, isString: true };
    this.marketingIntentReport.get('sortBy4')['controlType'] = { isMulti: false, isString: true };
    this.marketingIntentReport.get('availableMOCheckbox')['controlType'] = { isMulti: false, isString: false };
    this.marketingIntentReport.get('selectedMOCheckbox')['controlType'] = { isMulti: false, isString: false };
    this.marketingIntentReport.get('isLongReport').setValue(true);

    // enable the following fields incase a user comes from a different report (which will disable the fields)
    this.marketingIntentReport.get('sortBy1').enable({ emitEvent: false });
    this.marketingIntentReport.get('sortBy2').enable({ emitEvent: false });
    this.marketingIntentReport.get('sortBy3').enable({ emitEvent: false });
    this.marketingIntentReport.get('sortBy4').enable({ emitEvent: false });
    this.marketingIntentReport.get('availableMOCheckbox').enable({ emitEvent: false });
    this.marketingIntentReport.get('selectedMOCheckbox').enable({ emitEvent: false });
    this.marketingIntentReport.get('isLongReport').enable({ emitEvent: false });

    this.handleMarketingIntentValueChange();
    this.updateCheckBox();

    this.marketingIntentReport.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.getMarketingGroupData(this._rc.isValidInput(val));
        },
      );

    this.marketingIntentReport.get('marketingGroup').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.getMarketData(this._rc.isValidInput(val));
          this._mkt.getNameplateData(this._rc.isValidInput(val));
        },
      );

    this.marketingIntentReport.get('geographicMarket').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.getLanguages(this._rc.isValidInput(val));
          const namePlate = this.marketingIntentReport.get('namePlate').value;
          if (namePlate !== null && namePlate.length) {
            this._mkt.getVehicleLineList(this._rc.isValidInput(val));
          }
          },
      );

    this.marketingIntentReport.get('namePlate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          const market = this.marketingIntentReport.get('geographicMarket').value;
          if (market !== null && market.length) {
            this._mkt.getVehicleLineList(this._rc.isValidInput(val));
          }
        },
      );

    this.marketingIntentReport.get('vehicleLine').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          const isValid = this._rc.isValidInput(this._mkt.getVehicleLineValue('id'));
          this._mkt.getMMCCodes(isValid);
          if (!this._mkt.templateLoading) {
            this._mkt.effectiveDate.reset({ value: '', disabled: true }, { emitEvent: false });
          }

          this._mkt.getMarketOfferStatusList(isValid, false, this.marketingIntentReport.get('marketOfferStatus')['controlType'].isMulti);
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
            this.marketingIntentReport.get('optionDescriptionType').enable();
          } else {
            this.allowMOSorting = false;
          }
        },
      );

    this.marketingIntentReport.get('mmcCode').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.loadModelRestrictionList(this._rc.isValidInput(val));
        },
      );

    this.marketingIntentReport.get('marketOfferStatus').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.loadBlockPointList(this._rc.isValidInput(val), val, false, true);
        },
      );

    this.marketingIntentReport.get('availableMo').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        () => {
          this._mkt.getNumberOfSelectedMOs();
        },
      );
  }

  handleMarketingIntentValueChange() {
    this.marketingIntentReport.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (form) => {
          if (this.isFirstChange || !isEqual(form, this.holdFormVals)) {
            this.holdFormVals = form;
            let optionalFieldsArray = [];
            if (this._rc.isValidInput(form.mmcCode) || this._rc.isValidInput(form.modelRestrictionString)) {
              optionalFieldsArray = [
                form.mmcCode,
                form.modelRestrictionString,
              ];
            }
            this.partialFormValid = this._mkt.processPartialForm(
              [
                form.geographicMarket,
                form.optionLanguage,
                form.marketingGroup,
                form.modelYear,
                form.namePlate,
                form.optionDescriptionType,
                form.vehicleLine,
                form.effectiveDate,
                form.marketOfferStatus,
              ],
              optionalFieldsArray,
            );
            if (this.partialFormValid) {
              // enough fields have been completed to call 'update market offers'
              this.allowUpdateMO = true;
            } else {
              if (this.allowUpdateMO) {
                this.allowUpdateMO = false;
                this.marketingIntentReport.get('availableMo').reset({ value: '', disabled: true }, { emitEvent: false });
                this.marketingIntentReport.get('selectedMarketOffers').reset({ value: '', disabled: true }, { emitEvent: false });
              }
            }
            this.handleFormIsValid(form);
          }
        },
      );
  }

  handleFormIsValid(form) {
    if (this._rc.isFormValid(this.marketingIntentReport)) {
      const reportData = this._mkt.processForm(form, true);
      if (reportData.mmcCodeCommaValues === undefined) {
        reportData.mmcCodeCommaValues = 'NA';
      }
      this._reportService.updateValidationStatus(reportData);
      this.isFirstChange = true;
    } else if (this.isFirstChange) {
      this._reportService.updateValidationStatus(false);
      this.isFirstChange = false;
    }
    this.allowUpdateMO = true;
  }

  updateMarketOfferUI() {
    if (this.partialFormValid) {
      this._mkt.selectedMarketOfferArray = [];
      this.marketingIntentReport.get('selectedMarketOffers').reset();
      this._mkt.updateMIOMarketOfferList();
    } else {
      this._notify.notify('info', 'Information', 'Please fill out all required(*) fields to generate market offers.');
    }
    if (this.templateData && Object.keys(this.templateData).length > 0) {
      this.marketingIntentReport.get('sortBy1').enable({ emitEvent: false });
      this.updateSort();
    } else {
      this.showAMOCheckBox = true;
      this.marketingIntentReport.get('sortBy1').enable({ emitEvent: false });
    }
  }

  updateCheckBox()  {
    if (this._mkt.availableMarketOfferArray.length !== 0) {
      this.showAMOCheckBox = true;
    } else {
      this.showAMOCheckBox = false;
    }
    if (this._mkt.selectedMarketOfferArray.length !== 0) {
      this.showSMOCheckBox = true;
    } else {
      this.showSMOCheckBox = false;
    }
  }

  onSelect(event) {
    this.pickList.selectedItemsSource = this.handleReOrderList(this._mkt.availableMarketOfferArray, this.pickList.selectedItemsSource);
    this.pickList.selectedItemsTarget = this.handleReOrderList(this._mkt.selectedMarketOfferArray, this.pickList.selectedItemsTarget);
  }

  handleReOrderList(list, target) {
    const sourceSelections = [];
    if (list && target) {
      list.forEach((item) => {
        const pickItem = target.find((x) => x && x.id && item && item.id && x.id.toString() === item.id.toString());
        if (pickItem) {
          sourceSelections.push(pickItem);
        }
      });
    }
    return sourceSelections;
  }

  updateSort() {
    // Enable Sort Boxes
    for (let x = 3; x >= 0; x--) {
      this._mkt.enableSort(x, this.marketingIntentReport);
    }
    // Enable Checkboxes
    if (this._mkt.selectedMarketOfferArray) {
      this.showSMOCheckBox = true;
    } else {
      this.showSMOCheckBox = false;
    }
    if (this._mkt.availableMarketOfferArray) {
      this.showAMOCheckBox = true;
    } else {
      this.showAMOCheckBox = false;
    }
    // Select Checkboxes
    if (this.marketingIntentReport.value.selectedMOCheckbox !== null) {
      this.marketingIntentReport.get('selectedMOCheckbox').setValue(true);
    } else {
      this.marketingIntentReport.get('selectedMOCheckbox').setValue(false);
    }
    if (this.marketingIntentReport.value.availableMOCheckbox !== null) {
      this.marketingIntentReport.get('availableMOCheckbox').setValue(true);
    } else {
      this.marketingIntentReport.get('availableMOCheckbox').setValue(false);
    }
  }

  changeSort(event, sortNumber) {
    this._mkt.enableSort(sortNumber, this.marketingIntentReport);
    if (event.value === '') {
      this.filterOptions = this._mkt.pushValues(sortNumber, event, this.filterOptions);
      this._mkt.resetValue(sortNumber, this.marketingIntentReport);
    } else {
      this.filterOptions = this._mkt.setSortValue(sortNumber, event, this.filterOptions);
    }
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._mkt);
    this._mkt.availableMarketOfferArray = [];
    this._mkt.selectedMarketOfferArray = [];
  }
}
