import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { EventEmitter, Injectable } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import * as _cloneDeep from 'lodash/cloneDeep';
import * as _indexOf from 'lodash/indexOf';
import * as _intersection from 'lodash/intersection';
import * as _sortBy from 'lodash/sortBy';
import * as _uniqBy from 'lodash/uniqBy';
import * as _keyBy from 'lodash/keyBy';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { log } from 'util';
import { DataLayerService } from '../../data/data-layer.service';
import { NotificationService } from '../../shared/notification.service';
import { IMarketing } from '../interfaces/marketing.interface';
import { IVehicleLine } from '../interfaces/vehicleLine.interface';
import { ReportControls } from './ReportControls';
import { Template } from './Template';

@Injectable()
export class Marketing {
  // Regex will match any trailing or leading commas, whitespace, or spaces
  COMMA_REGEX = RegExp(/(^[,\s]+)|([,\s]+$)/g);
  // tslint:disable:max-line-length
  BODY_STYLE = 'Body Style';
  MODEL_YEAR = 'Model Year';
  EFFECTIVE_DATE_WIP_ID = 2;
  // used to check if form is valid when template is loaded
  eTemplateControlLoaded = new EventEmitter<boolean>();
  templateLoading = false;
  moLogicStarted = false;

  reportDescription = new FormControl({ value: null, disabled: false }, [Validators.required]);
  modelYear = new FormControl({ value: null, disabled: false }, [Validators.required]);
  bookCode = new FormControl({ value: null, disabled: true }, [Validators.required]);
  filterVdsFamily = new FormControl({ value: null, disabled: true });
  marketGroup = new FormControl({ value: null, disabled: true }, [Validators.required]);
  nameplate = new FormControl({ value: null, disabled: true }, [Validators.required]);
  vehicleLine = new FormControl({ value: null, disabled: true }, [Validators.required]);
  geographicMarket = new FormControl({ value: null, disabled: true }, [Validators.required]);
  mmc = new FormControl({ value: null, disabled: true });
  marketOfferId = new FormControl({ value: null, disabled: true });
  marketOfferRevision = new FormControl({ value: null, disabled: true });
  modelRestrictionString = new FormControl({ value: null, disabled: true });
  marketOfferStatus = new FormControl({ value: null, disabled: true }, [Validators.required]);
  marketOfferStatusTo = new FormControl({ value: null, disabled: true }, [Validators.required]);
  effectiveDate = new FormControl({ value: null, disabled: true }, [Validators.required]);
  descriptionType = new FormControl({ value: null, disabled: true }, [Validators.required]);
  language = new FormControl({ value: null, disabled: true }, [Validators.required]);
  indicator = new FormControl({ value: null, disabled: true }, [Validators.required]);
  columnGroup = new FormControl({ value: null, disabled: true });
  enterCodes = new FormControl({ value: null, disabled: true });
  previousEffectiveDate = new FormControl({ value: null, disabled: true }, [Validators.required]);
  availableMarketOffers = new FormControl({ value: null, disabled: true });
  selectedMarketOffers = new FormControl({ value: null, disabled: true }, [Validators.required]);
  userName = new FormControl({ value: null, disabled: true });
  gmin = new FormControl({ value: null, disabled: true }, [Validators.required]);
  marketOfferAttribute = new FormControl({ value: null, disabled: true }, [Validators.required]);
  optionCodes = new FormControl({ value: null, disabled: true }, [Validators.required]);
  toDate = new FormControl({ value: null, disabled: false }, [Validators.required]);
  fromDate = new FormControl({ value: null, disabled: false }, [Validators.required]);
  vehicleProdCode = new FormControl({ value: null, disabled: true }, [Validators.required]);
  groupBy = new FormControl({ value: null, disabled: true });
  groupFlag = new FormControl({ value: null, disabled: true });
  displayRestrictionString = new FormControl({ value: null, disabled: false });
  group = new FormControl({ value: null, disabled: false });
  market = new FormControl({ value: null, disabled: false });
  updateButton = new FormControl({ value: null, disabled: false });
  selectCodes = new FormControl({ value: null, disabled: true });
  selectedCodes = new FormControl({ value: null, disabled: true });
  selectedLabels = new FormControl({ value: null, disabled: true });
  changedBySelect = new FormControl({ value: null, disabled: true });
  sortBy1 = new FormControl({ value: null, disabled: false });
  sortBy2 = new FormControl({ value: null, disabled: false });
  sortBy3 = new FormControl({ value: null, disabled: false });
  sortBy4 = new FormControl({ value: null, disabled: false });
  availableMOCheckbox = new FormControl();
  selectedMOCheckbox = new FormControl();
  moDifferenceAll = new FormControl({ value: 'D', disabled: false });
  isLongReport = new FormControl({ value: false });

  // properties to hold all data to populate form components
  initData: any;
  userPrefs: any;
  vdsCodesArray: any;
  modelYearArray: any;
  marketingGroupArray: any;
  marketArray: any;
  nameplateArray: any;
  subArray: Subscription[] = [];
  descriptionTypeArray: any;
  languageListArray = [];
  marketingData = {} as IMarketing;
  vehicleLineArray: any;
  mmcArray: any;
  restrictionStringArray: any;
  availableMarketOfferArray = [];
  selectedMarketOfferArray = [];
  selectedMarketOfferIds = [];
  numberOfSelectedMOs: string;
  geographicMarketArray: any;
  effectiveDateArray: any;
  toEffectiveDateArray: any;
  filteredEffectiveDateArray: any;
  previousEffectiveDateArray: any;
  marketOfferStatusArray: any;
  groupByArray: any;
  bookCodeArray: any;
  selectCodesArray = [];
  selectedCodesArray = [];
  filterVdsFamilyArray: any;
  gminArray: any;
  selectedArray = [];
  additionalFormData: any = {};
  selectedMoValues = [];
  moveIndex: number;
  allowUpdateMO = true;
  sortArray = ['sortBy4', 'sortBy3', 'sortBy2', 'sortBy1'];
  dropDownArray = [
    { label: '', value: '' },
    { label: '', value: '' },
    { label: '', value: '' },
    { label: '', value: '' },
  ];
  index = 0;
  vehicleType: any;

  // arrays of objects for filtering market offers in reports
  carMOFilter = [
    { label: 'Choose', value: '' },
    { label: 'PEG', value: 'marketOfferRestriction' },
    { label: this.BODY_STYLE, value: 'bodyStyle' },
    { label: 'MMC', value: 'mmc' },
    { label: this.MODEL_YEAR, value: 'modelYearSuffix' },
    { label: 'Market', value: 'geoMarketCode' },
    { label: 'Blockpoint', value: 'blockPointNumber' },
  ];

  truckMOFilter = [
    { label: 'Choose', value: '' },
    { label: 'Truck Trim', value: 'marketOfferRestriction' },
    { label: this.BODY_STYLE, value: 'bodyStyle' },
    { label: 'Truck Series', value: 'truckSeries' },
    { label: 'Drive Type (Truck)', value: 'truckLine' },
    { label: 'Bed Length (Truck)', value: 'wheelBase' },
    { label: 'MMC', value: 'mmc' },
    { label: this.MODEL_YEAR, value: 'modelYearSuffix' },
    { label: 'Market', value: 'geoMarketCode' },
    { label: 'GVW Rating (Truck)', value: 'gvwRating' },
    { label: 'Blockpoint', value: 'blockPointNumber' },
  ];

  bothMOFilter = [
    { label: 'Choose', value: '' },
    { label: 'PEG', value: 'marketOfferRestriction' },
    { label: 'Truck Trim', value: 'marketOfferRestriction' },
    { label: 'Body Style', value: 'bodyStyle' },
    { label: 'Truck Series', value: 'truckSeries' },
    { label: 'Drive Type (Truck)', value: 'truckLine' },
    { label: 'Bed Length (Truck)', value: 'wheelBase' },
    { label: 'MMC', value: 'mmc' },
    { label: 'Model Year', value: 'modelYearSuffix' },
    { label: 'Market', value: 'geoMarketCode' },
    { label: 'GVW Rating (Truck)', value: 'gvwRating' },
    { label: 'Blockpoint', value: 'blockPointNumber' },
  ];

  marketOfferAttributeArray = [
    { label: 'Availability Indicator', value: 'AVB' },
    { label: 'Changeable', value: 'CHG' },
    { label: 'Comments', value: 'COM' },
    { label: 'Customer Class', value: 'CC' },
    { label: 'Description', value: 'DES' },
    { label: 'NSC Exceptions', value: 'NSC' },
    { label: 'Replacement', value: 'REP' },
    { label: 'Restriction String', value: 'RST' },
  ];

  constructor(
    readonly _dataLayer: DataLayerService,
    readonly _rc: ReportControls,
    readonly _notify: NotificationService,
    readonly _tp: Template) { }

  setInitialData(initData: any, userPrefs?: any, isMulti?: boolean) {

    this.initData = initData;
    if (userPrefs) {
      this.userPrefs = userPrefs;
    }
    if (isMulti) {
      this.getInitDataMulti();
    } else {
      this.getInitData();
    }
  }

  getInitData() {
    this.getModelYearData();
    if (this._rc.isValidInput(this.userPrefs)) {
      this.getDescriptionType(false);
      this.setDefaultDescriptionType();
      this.setDefaultLanguage();
    }
  }

  getInitDataMulti() {
    this.getModelYearData();
    if (this._rc.isValidInput(this.userPrefs)) {
      this.getDescriptionType(false, true);
      this.setDefaultDescriptionType(true);
      this.setDefaultLanguage(true);
    }
  }

  getDefaultVdsFamilyList() {
    this.filterVdsFamilyArray = this.getItemList(this.initData.vdsFamilyList);
  }

  getVdsModelYearMasterList() {
    this.modelYearArray = this.getItemList(this.initData.vdsModelYearMasterList);
  }

  getDefaultReportDescription() {
    this.reportDescription.setValue('----');
  }

  getMarketOfferDescriptions() {
    this.descriptionTypeArray = this.getItemList(this.initData.marketOfferDescTypeList);
  }

  setDefaultDescriptionType(isMulti?: boolean) {
    this.descriptionType.enable({ emitEvent: false });
    this.getDefaultDescriptionType();
    if (this.userPrefs) {
      if (!isMulti) {
        this.descriptionType.setValue(+this.userPrefs.marketOfferDescTypeId);
      } else {
        this.descriptionType.setValue([+this.userPrefs.marketOfferDescTypeId]);
      }

    }
    this.descriptionType.disable({ emitEvent: true });
  }

  setDefaultLanguage(isMulti?: boolean) {
    this.language.enable({ emitEvent: false });
    this.getDefaultLanguages();
    if (this.userPrefs) {
      if (!isMulti) {
        this.language.setValue(+this.userPrefs.marketOfferLangId);
      } else {
        this.language.setValue([+this.userPrefs.marketOfferLangId]);
      }

    }
    this.language.disable({ emitEvent: true });
  }

  setDefaultGroupInIndicatorRpt() {
    this.group.setValue('Y');
  }

  getModelYearData() {
    this.modelYearArray = this.getItemList(this.initData.modelYearMasterList);
    this.modelYear.enable({ emitEvent: false });
  }

  getMarketingGroupData(isValid: boolean, loadingTemplate?: boolean) {
    const tempMarketingGroupArray = [];
    if (isValid) {
      this._dataLayer.getMarketingGroups().pipe(take(1))
        .subscribe(
          (data: any) => {
            this.marketingGroupArray = [];

            data.forEach(
              (obj) => {
                tempMarketingGroupArray.push({ label: obj.label, value: obj.value });
              },
            );
            this.marketingGroupArray = tempMarketingGroupArray;
            this.marketGroup.enable({ emitEvent: false });
          },
        );
    } else {
      this.marketGroup.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  formatDateInput(form: any) {
    // set date to YYYY-MM-DD
    return moment(form).format('YYYY-MM-DD');
  }

  getDateFromString(strDate: string, format = 'YYYY-MM-DD'): any {
    return moment(strDate, format).toDate();
  }

  formatDate(form: any) {
    return form ? moment(form) : null;
  }

  loadVdsBookListFromModelYear(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this._dataLayer.loadVdsBookListFromModelYear(this.modelYear.value).pipe(take(1))
        .subscribe(
          (data: any) => {

            this.bookCodeArray = this.getItemList(data);
            this.bookCode.enable({ emitEvent: false });
          },
        );
    } else {
      this.bookCode.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  loadVdsFamiliesByModelYearAndBook(isValid: boolean) {
    if (isValid) {
      this._dataLayer.loadVdsFamiliesByModelYearAndBook(this.modelYear.value, this.bookCode.value).pipe(take(1))
        .subscribe(
          (data: any) => {
            this.filterVdsFamilyArray = this.getItemList(data);

            this.filterVdsFamily.enable({ emitEvent: false });
          },
        );
    } else {
      this.filterVdsFamily.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  loadSelectedCodesForVds(isValid: boolean) {
    if (isValid) {
      const vdsCodeStr = this.filterVdsFamily.value.join();
      this._dataLayer.loadSelectedCodesForVds(vdsCodeStr).pipe(take(1))
        .subscribe(
          (data: any) => {
            this.selectedCodesArray = [];
            this.selectCodesArray = this.getItemList(data);

            this.selectCodes.enable({ emitEvent: false });
            this.selectedCodes.enable({ emitEvent: false });

          },
        );
    } else {
      this.selectCodes.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
      this.selectedCodes.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  loadSelectedCodes(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this._dataLayer.loadSelectedCodes(this.filterVdsFamily.value.join().split(',')).pipe(take(1))
        .subscribe((data: any) => {
          const alreadySelected = this.selectedCodesArray;
          const filteredData = this.getItemList(data);
          const codes = filteredData.filter((item) => !alreadySelected.find((selectedItem) => selectedItem.value === item.value));
          this.selectCodesArray = codes;
          if (this.templateLoading && this._tp.template) {
            const idsToAdd = this._tp.template.selectedCodesFor || this._tp.template.selCodesCommaValues;
            const formattedIds = Array.isArray(idsToAdd) ? idsToAdd : idsToAdd.split(',');
            this.getSelectedCodesFromIdArray(this.selectCodesArray, formattedIds[0].split(','));

            const selectedIds = this.selectedCodesArray.map((obj) => obj.value);
            const selectedLabs = [];
            this.selectedCodesArray.map((obj) => { selectedLabs.push({ label: obj.label, value: obj.value }); });
            this.selectCodesArray = this.selectCodesArray
              .filter((code) => !selectedIds.includes(code.value));
            this.selectedCodes.setValue(selectedIds, { emitEvent: true });
            this.selectedLabels.setValue(selectedLabs);
          }

          this.selectCodes.enable({ emitEvent: false });
          this.selectedCodes.enable({ emitEvent: false });
        });
    } else {
      this.selectCodes.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  getSelectedCodesFromIdArray(selCodesArray, formattedIds) {
    this.selectCodesArray.forEach((code) => {
      let codeInArray = true;
      code.formattedValueArray.forEach((value) => {
        if (!formattedIds.includes(value)) {
          codeInArray = false;
        }
      });
      if (codeInArray) {
        this.selectedCodesArray.push(code);
      }
    });
  }

  validateErrorCodesForVds(isValid: boolean) {
    if (isValid) {
      this._dataLayer.validateErrorCodesForVds(this.enterCodes.value).pipe(take(1))
        .subscribe(
          (data: any) => {
            this.addValidCodes(data);
          },
        );
    }
  }

  validateErrorCodes(isValid: boolean) {
    if (isValid) {
      this._dataLayer.validateErrorCodes(this.enterCodes.value).pipe(take(1))
        .subscribe(
          (data: any) => {
            this.addValidCodes(data);
          },
        );
    }
  }

  addValidCodes(data: any) {
    if (data[0] && data[0].description && data[0].id) {
      // only add code if it doesn't already exist in the selectedCodes box
      const includedIndex = this.selectedCodesArray.map((code) => code.label).indexOf(data[0].description);
      if (includedIndex === -1) {
        this.selectedCodesArray.push({ label: data[0].description, value: data[0].id });
        this.setSelectCodes();
      }
    } else {
      this._notify.notify('info', 'Alert', 'Code not valid');
    }
    this.enterCodes.reset('', { emitEvent: false });
  }

  transferCodes(formControl: any, fromArray: any[], toArray: any[]): any[] {
    const codesToRemove = [];
    formControl.value.forEach((formSelection) => {
      fromArray.forEach((code) => {
        if (formSelection === code.value && !toArray.includes(code)) {
          toArray.push(code);
          codesToRemove.push(code);
        }
      });
    });
    // remove codes that were moved to toArray
    return fromArray.filter((code) => !codesToRemove.includes(code));
  }

  addCodes() {
    if (this.selectCodes.value) {
      this.selectCodesArray = this.transferCodes(this.selectCodes, this.selectCodesArray, this.selectedCodesArray);
      this.selectCodes.reset('', { emitEvent: false });
      this.setSelectCodes();
    }
    if (this.enterCodes) {
      this.validateErrorCodesForVds(this._rc.isValidInput(this.enterCodes.value));
    }
  }

  addCodesAndEnable() {
    this.selectedCodes.enable({ emitEvent: !this.templateLoading });
    if (this.selectCodes.value) {
      this.selectCodesArray = this.transferCodes(this.selectCodes, this.selectCodesArray, this.selectedCodesArray);
      this.selectCodes.reset('', { emitEvent: false });
    }

    if (this.enterCodes) {
      this.validateErrorCodesForVds(this._rc.isValidInput(this.enterCodes.value));
    }
    this.setSelectCodes();
  }

  addOptionCodesAndEnable() {
    this.selectedCodes.enable({ emitEvent: !this.templateLoading });

    if (this.selectCodes.value) {
      this.selectCodesArray = this.transferCodes(this.selectCodes, this.selectCodesArray, this.selectedCodesArray);
      this.selectCodes.reset('', { emitEvent: false });
    }

    if (this.enterCodes) {
      this.validateErrorCodes(this._rc.isValidInput(this.enterCodes.value));
    }
    this.setSelectCodes();
  }

  removeCodes() {
    if (this.selectedCodes.value) {
      this.selectedCodesArray = this.transferCodes(this.selectedCodes, this.selectedCodesArray, this.selectCodesArray);
      this.setSelectCodes();
    }
  }

  removeCodesAndDisable() {
    this.removeCodes();
    if (this.selectedCodesArray.length < 1) {
      this.selectedCodes.disable({ emitEvent: false });
    }
  }

  setSelectCodes() {
    const combinedValues = [];
    const combinedLabels = [];
    this.selectedCodesArray.forEach((obj) => {
      combinedValues.push(obj.value);
      combinedLabels.push({ label: obj.label, value: obj.value });
    });
    this.selectedLabels.setValue(combinedLabels);
    this.selectedCodes.setValue(combinedValues, { emitEvent: true });
  }

  getAuthorizedMarketGroupListHierarchy(isValid: boolean, loadingTemplate?: boolean) {
    const tempMarketingGroupArray = [];
    if (isValid) {
      this._dataLayer.loadAuthorizedMarketGroupListHierarchy().pipe(take(1))
        .subscribe(
          (data: any) => {
            this.marketingGroupArray = [];

            data.forEach(
              (obj) => {
                tempMarketingGroupArray.push({ label: obj.label, value: obj.value });
              },
            );
            this.marketingGroupArray = tempMarketingGroupArray;
            this.marketGroup.enable({ emitEvent: false });
          },
        );
    } else {
      this.marketGroup.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  getAuthorizedMarketGroupList(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this._dataLayer.loadAuthorizedMarketGroupList().pipe(take(1))
        .subscribe(
          (data: any) => {
            this.marketingGroupArray = this.getItemList(data);
            this.marketGroup.enable({ emitEvent: false });
          },
        );
    } else {
      this.marketGroup.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  getMarketData(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this._dataLayer.loadMarketsList(this.marketGroup.value).pipe(take(1))
        .subscribe(
          (data: any) => {

            this.marketArray = this.getItemList(data);
            this.geographicMarket.enable({ emitEvent: false });
          },
        );
    } else {
      this.geographicMarket.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  getNameplateData(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this._dataLayer.loadNameplateListFromGroupIdModelyearId(this.modelYear.value, this.marketGroup.value).pipe(take(1))
        .subscribe(
          (data: any) => {

            this.nameplateArray = this.getItemList(data);
            this.nameplate.enable({ emitEvent: false });

            if (this.templateLoading) {
              const selectedNamePlateIds = this._tp.getSelectedValuesById(this._tp.template.namePlate || this._tp.template.nameplate, this.nameplateArray);
              if (this.nameplate['controlType'].isMulti) {
                this.nameplate.setValue(selectedNamePlateIds);
              } else {
                this.nameplate.setValue(selectedNamePlateIds[0]);
              }

            }
          },
        );
    } else {
      this.nameplate.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  setAvailabilityIndicators(availabilityIndicator: any, loadingTemplate?: boolean) {
    let indicatorFields = availabilityIndicator[0];
    // Replace will only do the first instance.. Will need to run three times for all cases.
    indicatorFields = indicatorFields.replace(',', '');
    indicatorFields = indicatorFields.replace(',', '');
    indicatorFields = indicatorFields.replace(',', '');
    this.indicator.setValue(indicatorFields);
  }

  getDefaultDescriptionType() {
    this.descriptionTypeArray = this.getItemList(this.initData.optionDescTypeList);
  }

  getLanguages(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this._dataLayer.loadLanguageList(this.geographicMarket.value, this.marketGroup.value).pipe(take(1))
        .subscribe(
          (data: any) => {
            this.languageListArray = [];

            this.languageListArray = this.getItemList(data);
            this.language.enable({ emitEvent: false });
            if (this.userPrefs) {
              this.language.setValue(+this.userPrefs.marketOfferLangId, { emitEvent: false });
            }
          },
        );
    } else {
      this.language.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
      this.setDefaultLanguage();
    }
  }

  getDescriptionType(isValid: boolean, isMulti?: boolean) {
    const tempDescArray = [];
    if (isValid) {
      this._dataLayer.loadDescType().pipe(take(1))
        .subscribe(
          (data: any) => {

            this.descriptionType.enable({ emitEvent: true });
            if (this.userPrefs) {
              if (!isMulti) {
                this.descriptionType.setValue(+this.userPrefs.marketOfferDescTypeId, { emitEvent: true });
              } else {
                this.descriptionType.setValue([+this.userPrefs.marketOfferDescTypeId], { emitEvent: true });
              }
            }

            this.descriptionTypeArray = data.map((obj) => ({ label: obj.name, value: this.formatId(obj.id) }));
          },
        );
    } else {
      this.descriptionType.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
      if (isMulti) {
        this.setDefaultDescriptionType(true);
      }
      this.setDefaultDescriptionType();
    }
  }

  getVehicleLineList(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this._dataLayer.loadAuthorizedVehicleLineListForBPReports(this.nameplate.value).pipe(take(1))
        .subscribe((data: any) => {

          this.vehicleLineArray = data.map((obj) => ({
            label: obj.description,
            value: {
              id: this.formatId(obj.id),
              vehicleType: obj.vehicleType,
              description: obj.description.replace('-', ''),
            },
            formattedValueArray: this.createIdArray(this.formatId(obj.id)),
          }));
          this.vehicleLine.enable({ emitEvent: false });

          if (this.templateLoading) {
            this.vehicleLine['controlType'].controlLoading = false;
            const selectedVehicleLines = this._tp.getSelectedValuesById(this._tp.template.vehicleLine, this.vehicleLineArray);
            if (this.vehicleLine['controlType'].isMulti) {
              this.vehicleLine.setValue(selectedVehicleLines, { emitEvent: true });
            } else {
              this.vehicleLine.setValue(selectedVehicleLines[0], { emitEvent: true });
            }
          }
        },
        );
    } else {
      this.vehicleLine.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  /* Note, the value need to be concatenate as such because previous effective date (blockpoint) need
  * vehicle name as a passing parameter (how dumb!!!!)  If you need to use this method, please create
  * your own.
  * */
  getAuthorizedVehicleLineWithModelNameListForReports(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this._dataLayer.loadAuthorizedVehicleLineListForReports(this.nameplate.value).pipe(take(1))
        .subscribe((data: any) => {

          this.vehicleLineArray = data.map((obj) => ({
            label: obj.description,
            value: { id: this.formatId(obj.id), modelName: this.getVehicleModelName(obj.description) },
          }));

          this.vehicleLine.enable({ emitEvent: false });

          if (this.templateLoading) {
            this.vehicleLine['controlType'].controlLoading = false;
            const selectedVehicleLines = this._tp.getVehicleLineValuesById(this._tp.template.vehicleLine, this.vehicleLineArray);
            if (this.vehicleLine['controlType'].isMulti) {
              this.vehicleLine.setValue(selectedVehicleLines, { emitEvent: true });
            } else {
              this.vehicleLine.setValue(selectedVehicleLines[0], { emitEvent: true });
            }
          }
        });
    } else {
      this.vehicleLine.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  getAuthorizedVehicleLineListForReports(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this._dataLayer.loadAuthorizedVehicleLineListForReports(this.nameplate.value).pipe(take(1))
        .subscribe(
          (data: any) => {
            this.vehicleLineArray = [];
            let newObj: any = {};
            this.vehicleLineArray = data.map((obj) => {
              newObj = this.getItem(obj);
              newObj.vehicleType = obj.vehicleType;
              return newObj;
            });

            this.vehicleLine.enable({ emitEvent: false });
          },
        );
    } else {
      this.vehicleLine.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  getAuthorizedVehicleLineObjectListForReports(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this._dataLayer.loadAuthorizedVehicleLineListForReports(this.nameplate.value)
        .pipe(take(1))
        .subscribe((data: any) => {

          this.vehicleLineArray = data.map((obj) => ({
            label: obj.description,
            value: { id: this.formatId(obj.id), vehicleType: obj.vehicleType },
            contentDescription: this.getVehicleModelName(obj.description),
            vehicleType: obj.vehicleType,
          }));

          this.vehicleLine.enable({ emitEvent: false });

          if (this.templateLoading) {
            this.vehicleLine['controlType'].controlLoading = false;
            const selectedVehicleLines = this._tp.getVehicleLineValuesById(this._tp.template.vehicleLine, this.vehicleLineArray);
            if (this.vehicleLine['controlType'].isMulti) {
              this.vehicleLine.setValue(selectedVehicleLines, { emitEvent: true });
            } else {
              this.vehicleLine.setValue(selectedVehicleLines[0], { emitEvent: true });
            }
          }
        });
    } else {
      this.vehicleLine.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  getAuthorizedVehicleLineListForPassingNames(isValid: boolean) {
    if (isValid) {
      this._dataLayer.loadAuthorizedVehicleLineListForPassingNames(this.nameplate.value).pipe(take(1))
        .subscribe(
          (data: any) => {
            this.vehicleLineArray = [];

            this.vehicleLineArray = this.getItemList(data);
            this.vehicleLine.enable({ emitEvent: false });
          },
        );
    } else {
      this.vehicleLine.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  getAuthorizedVehicleLineListForIncludedContentReport(isValid: boolean) {
    if (isValid) {
      this._dataLayer.loadAuthorizedVehicleLineListForIncludedContentReport(this.nameplate.value).pipe(take(1))
        .subscribe(
          (data: any) => {
            this.vehicleLineArray = [];

            this.vehicleLineArray = this.getItemList(data);
            this.vehicleLine.enable({ emitEvent: false });
          },
        );
    } else {
      this.vehicleLine.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  getMMCCodes(isValid: boolean, loadingTemplate?: boolean) {
    const tempMMCCode = [];
    if (isValid) {
      this._dataLayer.loadMMCCodeUpdated(this.getVehicleLineValue('id')).pipe(take(1))
        .subscribe(
          (data: any) => {

            this.mmcArray = data.map((obj) => ({
              label: obj.code,
              value: this.formatId(obj.id),
              formattedValueArray: this.createIdArray(obj.id),
            }));

            if (this.templateLoading) {
              this.mmc['controlType'].controlLoading = false;
              this.mmc.setValue(this._tp.getSelectedValuesById(this._tp.template.mmcCode, this.mmcArray), { emitEvent: true });
            }
            this.mmc.enable({ emitEvent: false });
          },
        );
    } else {
      this.mmc.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  getMarketOfferStatusList(isValid: boolean, loadingTemplate?: boolean, isMulti?: boolean) {
    if (isValid) {
      this._dataLayer.loadMarketOfferStatusList(this.getVehicleLineValue('id')).pipe(take(1))
        .subscribe(
          (data: any) => {

            this.marketOfferStatusArray = this.getItemList(data);
            this.marketOfferStatus.enable({ emitEvent: false });
            this.marketOfferStatusTo.enable({ emitEvent: false });

            if (this.marketOfferStatusArray.length > 3 && !this.templateLoading) {
              this.setDefaultMarketOfferStatus(isMulti);
            }
          },
        );
    } else {
      this.marketOfferStatus.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  setDefaultMarketOfferStatus(isMulti = false) {
    const statusVal = (isMulti ? [this.marketOfferStatusArray[3].value] : this.marketOfferStatusArray[3].value);
    this.marketOfferStatus.setValue(statusVal, { emitEvent: true });
  }

  getVehicleModelName(modelName: string) {
    let modifiedName: string;
    modifiedName = RegExp('[\\w]-')[Symbol.replace](modelName, '');
    return modifiedName;
  }

  loadModelRestrictionList(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this.modelRestrictionString.setValidators([Validators.required]);
      this._dataLayer.loadModelRestrictionList(this.mmc.value).pipe(take(1))
        .subscribe(
          (data: any) => {

            this.restrictionStringArray = this.getItemList(data);
            this.modelRestrictionString.enable({ emitEvent: false });
            if (this.templateLoading) {
              this.modelRestrictionString['controlType'].controlLoading = false;
              this.modelRestrictionString.setValue(this._tp.getSelectedValuesById(this._tp.template.modelRestrictionString, this.restrictionStringArray), { emitEvent: true });
            }
          },
        );
    } else {
      this.modelRestrictionString.clearValidators();
      this.modelRestrictionString.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  resetMarketOfferArrays() {
    this.selectedMarketOfferArray = [];
    this.availableMarketOfferArray = [];
  }

  updateMarketOfferList() {
    this.resetMarketOfferArrays();
    this.moLogicStarted = true;
    const vehicleLineVal = this.getVehicleLineValue('id');
    this._dataLayer.loadAvailableMarketOffersForChmoGMNAReports(
      vehicleLineVal,
      this.geographicMarket.value,
      this.mmc.value,
      this.modelRestrictionString.value).pipe(take(1))
      .subscribe((data: any) => {

        if (Array.isArray(data) && !data.length) {
          this._notify.notify('warn', 'No Available Market Offers', 'The chosen options do not have any available market offers. Please select new options.');
        } else {
          this.availableMarketOfferArray = data;
          this.availableMarketOfferArray.forEach((obj) => {
            obj.label = obj.description + ' - ' + obj.moDesc;
            obj.value = this.formatId(obj.id);
          });

          this.availableMarketOffers.enable({ emitEvent: false });
          if (this.templateLoading) {
            this.addToSelectedMOByIds(this._tp.template.selectedMarketOffers);
            if (this._tp.template.availableMo) {
              this.setAvailableMOByIds(this._tp.template.availableMo);
            }
          }
        }
      });
  }

  updateMIOMarketOfferList() {
    this.resetMarketOfferArrays();
    const vehicleLineVal = this.getVehicleLineValue('id');
    const effectiveDateFormatted = this.formatEffectiveDateId(this.effectiveDate.value);
    this._dataLayer.loadAvailableMarketOffersForGMNAReports(
      vehicleLineVal,
      this.geographicMarket.value,
      this.mmc.value,
      this.modelRestrictionString.value,
      this.marketOfferStatus.value,
      effectiveDateFormatted,
    ).pipe(take(1))
      .subscribe((data: any) => {
        if (Array.isArray(data) && data.length === 0) {
          this._notify.notify('warn', 'No Available Market Offers', 'The chosen options do not have any available market offers. Please select new options.');
        } else {
          this.availableMarketOfferArray = data.reverse();
          this.availableMarketOfferArray.forEach((obj) => {
            obj.label = obj.description + ' - ' + obj.moDesc;
            obj.value = this.formatId(obj.id);
          });

          this.availableMarketOffers.enable({ emitEvent: false });
          if (this.templateLoading) {
            this.addToSelectedMOByIds(this._tp.template.selectedMarketOffers);
            if (this._tp.template.availableMo) {
              this.setAvailableMOByIds(this._tp.template.availableMo);
            }
          }
        }
      });
  }

  getDefaultLanguages() {
    this.languageListArray = this.getItemList(this.initData.globalLanguagesList);
  }

  addToSelectedMOByIds(idsToAdd: string | string[]) {
    this.allowUpdateMO = false;
    const idArray = Array.isArray(idsToAdd) ? idsToAdd.reduce((acc, val) => acc.concat(val), [])[0] : idsToAdd;
    const formattedIds = idsToAdd ? idArray.split(',') : [];
    // Setting Vehicle Type from Vehicle Lines
    this.addVehicleType(this.getVehicleTypeFromVehicleLine());
    // Setting the Selected Array from Template
    formattedIds.forEach((id) => {
      this.availableMarketOfferArray.forEach((obj) => {
        if (id === obj.value.toString()) {
          this.selectedMarketOfferArray.push(obj);
        }
      });
    });
    this.availableMarketOfferArray = this.availableMarketOfferArray.filter((obj) => !formattedIds.includes(obj.value.toString()));
    this.updateSelectedIds();
  }

  setAvailableMOByIds(idsToAdd: string[]) {
    //Converts array of comma separated ids to array of strings of ids
    //E.g. ["123,456"] => ["123", "456"]
    const idArray = idsToAdd.join().split(",");
    //Maps market offers by ID for lookup.
    const idMap = _keyBy(this.availableMarketOfferArray, 'id');
    this.availableMarketOfferArray = idArray.map(id => idMap[id]);
    this.updateAvailableIds();
  }

  updateSelectedIds() {
    this.setValueOfSelectedMOs(this.selectedMarketOfferArray.map((mo) => mo.value));
    this.getNumberOfSelectedMOs();
  }

  updateAvailableIds() {
    this.setValueOfAvailableMOs(this.availableMarketOfferArray.map((mo) => mo.value));
  }

  setValueOfSelectedMOs(valsToAdd: any) {
    if (this.selectedMarketOfferArray && this.selectedMarketOfferArray.length) {
      this.selectedMarketOffers.enable({ emitEvent: false });
    } else {
      this.selectedMarketOffers.disable({ emitEvent: false });
    }

    this.selectedMarketOffers.setValue(valsToAdd, { emitEvent: true });
    this.selectedMarketOffers.updateValueAndValidity();

  }

  setValueOfAvailableMOs(valsToAdd: any) {
    if (this.availableMarketOfferArray && this.availableMarketOfferArray.length) {
      this.availableMarketOffers.enable({ emitEvent: false });
    } else {
      this.availableMarketOffers.disable({ emitEvent: false });
    }

    this.availableMarketOffers.setValue(valsToAdd, { emitEvent: true });
    this.availableMarketOffers.updateValueAndValidity();
  }

  getNumberOfSelectedMOs() {
    this.numberOfSelectedMOs = (Array.isArray(this.availableMarketOffers.value) && this.availableMarketOffers.value.length > 0) ?
      (this.availableMarketOffers.value.length + ' item(s) selected') : '';
  }

  getVehicleLineData(isValid: boolean) {
    if (isValid) {
      this._dataLayer.loadVehicleLineFromNamePltListForOFCReport(
        this.modelYear.value,
        this.marketGroup.value,
        this.nameplate.value).pipe(take(1))
        .subscribe(
          (data: any) => {
            this.vehicleLineArray = this.getItemList(data);
            this.vehicleProdCode.enable({ emitEvent: false });
          },
        );
    } else {
      this.vehicleLine.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  getMinorBp(array, val) {
    const bp = array.find((entry) => entry.value === val);
    return bp.bpMinorValue ? bp.bpMinorValue : '1';
  }

  getModelYearEffDate(array, val) {
    const bp = array.find((entry) => entry.value === val);
    return bp.bpYearValue ? bp.bpYearValue : this.getBpModelYearFromLabel(bp);
  }

  getBpModelYearFromLabel(val) {
    const splitOption = val.label.split('-');
    return splitOption[1];
  }

  loadBlockPointListForBPComparisonReportsFrom(isValid: boolean, moStatus: string, loadingTemplate?: boolean, isMulti?: boolean) {
    const vehicleLineVal = this.getVehicleLineValue('id');
    if (isValid) {
      this._dataLayer.loadBlockPointListForBPComparisonReports(
        vehicleLineVal,
        this.modelYear.value,
        moStatus,
        this.geographicMarket.value,
        this.modelRestrictionString.value === 0 ? '' : this.checkForInvalidList(this.modelRestrictionString.value),
        this.mmc.value === 0 ? '' : this.checkForInvalidList(this.mmc.value)).pipe(take(1))
        .subscribe(
          (data: any) => {

            this.effectiveDateArray = this.getItemList(data).map((val) => ({ ...val, bpMinorValue: this.getValueForBp(val.value, 1), bpYearValue: this.getValueForBp(val.value, 2) }));
            this.effectiveDateArray.forEach((val) => {
              if (val.value.indexOf('_') > 0) {
                val.value = val.value.split('_')[0];
              }
            });
            this.effectiveDate.enable({ emitEvent: false });
            if (!this.templateLoading) {
              this.setDefaultEffectiveDate(isMulti);
            } else {
              // trigger a template loading change so we have the array values
              this.effectiveDate['controlType'].controlLoading = false;
              const selecteDates = this._tp.getEffectiveDateValuesFromArray(this._tp.template.effectiveDate || this._tp.template.effeDtForCompareFrmBlkPoint, this.effectiveDateArray);
              if (this.effectiveDate['controlType'].isMulti) {
                this.effectiveDate.setValue(selecteDates);
              } else {
                this.effectiveDate.setValue(selecteDates[0]);
              }

              this.effectiveDate.enable();
            }
          },
        );
    } else {
      this.effectiveDate.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
      // unfilter Compare To Effective Date selections since no value is now selected for Compare From Effective date
      if (this.toEffectiveDateArray) {
        this.filteredEffectiveDateArray = this.toEffectiveDateArray;
      }
    }
  }

  loadBlockPointList(isValid: boolean, moStatus: string, loadingTemplate?: boolean, isMulti?: boolean) {
    const vehicleLineVal = this.getVehicleLineValue('id');
    if (isValid) {
      this._dataLayer.loadBlockPointList(
        vehicleLineVal,
        this.modelYear.value,
        moStatus,
        this.geographicMarket.value,
        this.modelRestrictionString.value === 0 ? '' : this.checkForInvalidList(this.modelRestrictionString.value),
        this.mmc.value === 0 ? '' : this.checkForInvalidList(this.mmc.value)).pipe(take(1))
        .subscribe(
          (data: any) => {

            this.effectiveDateArray = this.getItemList(data).map((val) => ({ ...val, bpMinorValue: this.getValueForBp(val.value, 1), bpYearValue: this.getValueForBp(val.value, 2) }));
            this.effectiveDateArray.forEach((val) => {
              if (val.value.indexOf('_') > 0) {
                val.value = val.value.split('_')[0];
              }
            });
            this.effectiveDate.enable({ emitEvent: false });
            if (!this.templateLoading) {
              this.setDefaultEffectiveDate(isMulti);
            } else {
              // trigger a template loading change so we have the array values
              this.effectiveDate['controlType'].controlLoading = false;
              const selecteDates = this._tp.getEffectiveDateValuesFromArray(this._tp.template.effectiveDate || this._tp.template.effeDtForCompareFrmBlkPoint, this.effectiveDateArray);
              if (this.effectiveDate['controlType'].isMulti) {
                this.effectiveDate.setValue(selecteDates);
              } else {
                this.effectiveDate.setValue(selecteDates[0]);
              }

              this.effectiveDate.enable();
            }
          },
        );
    } else {
      this.effectiveDate.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
      // unfilter Compare To Effective Date selections since no value is now selected for Compare From Effective date
      if (this.toEffectiveDateArray) {
        this.filteredEffectiveDateArray = this.toEffectiveDateArray;
      }
    }
  }

  getItemList(data) {
    return data ? data.map((obj) => this.getItem(obj)) : data;
  }

  getItem(obj) {
    const formattedId = this.formatId(obj.id);
    return {
      label: obj.description,
      value: formattedId,
      formattedValueArray: this.createIdArray(formattedId),
    };
  }

  createIdArray(value: any | any[]) {
    if (Array.isArray(value)) {
      return value;
    } else if (typeof value === 'string' || value instanceof String) {
      return value.split(',');
    }

    return [value];
  }

  formatId(value: any | any[]) {
    if (Array.isArray(value)) {
      return value.map((val) => {
        return this.formatId(val);
      });
    } else if (typeof value === 'string' || value instanceof String) {
      return value.replace(this.COMMA_REGEX, '');
    }

    return value;
  }

  setDefaultEffectiveDate(isMulti = false) {
    this.effectiveDateArray.forEach((obj) => {
      if (obj.label.indexOf('WIP') !== -1) {
        if (isMulti) {
          this.effectiveDate.setValue([obj.value], { emitEvent: true });
        } else {
          this.effectiveDate.setValue(obj.value, { emitEvent: true });
        }
      }
    });
  }

  loadBlockPointListForBPComparisonReportsTo(isValid: boolean, moStatus: string, loadingTemplate?: boolean) {
    const vehicleLineVal = this.getVehicleLineValue('id');
    if (isValid) {
      this._dataLayer.loadBlockPointListForBPComparisonReports(
        vehicleLineVal,
        this.modelYear.value,
        moStatus,
        this.geographicMarket.value,
        this.checkForInvalidList(this.modelRestrictionString.value),
        this.checkForInvalidList(this.mmc.value)).pipe(take(1))
        .subscribe((data: any) => {
          this.filteredEffectiveDateArray = [];

          this.toEffectiveDateArray = this.getItemList(data).map((val) => ({ ...val, bpMinorValue: this.getValueForBp(val.value, 1), bpYearValue: this.getValueForBp(val.value, 2) }));
          this.toEffectiveDateArray.forEach((val) => {
            if (val.value.indexOf('_') > 0) {
              val.value = val.value.split('_')[0];
            }
          });
          // trigger a template loading change so we have the array values
          if (this.templateLoading) {
            this.previousEffectiveDate['controlType'].controlLoading = false;
            this.previousEffectiveDate.enable();
          }

          // need to filter toEffectiveDateArray if effectiveDate value has already been chosen
          if (this.effectiveDate.value) {
            this.filterEffectiveDates(true, this.effectiveDate.value);
          } else {
            this.filteredEffectiveDateArray = _cloneDeep(this.toEffectiveDateArray);
          }

          this.previousEffectiveDate.enable({ emitEvent: false });
        },
        );
    } else {
      this.previousEffectiveDate.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  getValueForBp(val, num) {
    if (val.indexOf('_') > -1) {
      const splitVal = val.split('_');
      return splitVal[num];
    } else {
      return null;
    }
  }

  checkForInvalidList(obj) {
    if (obj) {
      return Array.isArray(obj) ? obj.length === 1 && obj[0] === '0' ? null : obj : obj;
    } else {
      return null;
    }
  }

  getEffDateDescsForBpComparison(effDateVal: string, checkArray: any): string {
    if (effDateVal) {
      const trueEl = checkArray.find(
        (date) => {
          if (date.value.indexOf('_') < 0) {
            const holdEffDateSplit = effDateVal.split('_');
            return parseInt(date.value, 10) === parseInt(holdEffDateSplit[0], 10);
          }
          return date.value === effDateVal;
        });
      return (trueEl && trueEl.hasOwnProperty('label')) ? trueEl.label : '';
    }
  }

  // filter toEffectiveDate choices by what has been chosen for effectiveDate
  filterEffectiveDates(isValid: boolean, value: any) {
    if (isValid && this.toEffectiveDateArray) {
      const wipCount = this.toEffectiveDateArray.filter((r) => r.value === this.EFFECTIVE_DATE_WIP_ID).length;
      if (value === this.EFFECTIVE_DATE_WIP_ID && wipCount > 1) {
        this.filteredEffectiveDateArray = this.toEffectiveDateArray;
      } else {
        this.filteredEffectiveDateArray = this.toEffectiveDateArray.filter((obj) => obj.value !== value);
      }
    }
  }

  getBlockPointData(isValid: boolean) {
    const vehicleLineVal = this.getVehicleLineValue('id');
    if (isValid) {
      this._dataLayer.loadBlockPointListForOFC(
        vehicleLineVal,
        this.marketGroup.value,
        this.modelYear.value,
        this.nameplate.value).pipe(take(1))
        .subscribe(
          (data: any) => {
            this.effectiveDateArray = [];

            this.effectiveDateArray = this.getItemList(data);
            this.effectiveDate.enable({ emitEvent: false });
          },
        );
    } else {
      this.effectiveDate.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  getBlockPointForModelYearChangeGMNA(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this._dataLayer.loadBlockPointListForModelYearChangeReport(this.getVehicleLineValue('id')).pipe(take(1))
        .subscribe(
          (data: any) => {
            this.effectiveDateArray = [];

            this.effectiveDateArray = this.getItemList(data);
            this.effectiveDate.enable({ emitEvent: false });
          },
        );
    } else {
      this.effectiveDate.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  // Use this function to obtain either vehicle model name or id
  getVehicleLineValue(attributeName: string) {
    const value: any = this.vehicleLine.value;
    if (Array.isArray(value)) {
      return value.map((valObj) => valObj.hasOwnProperty(attributeName) ? valObj[attributeName] : valObj);
    } else {
      return value ? value.hasOwnProperty(attributeName) ? value[attributeName] : value : null;
    }
  }

  getVehicleTypeFromVehicleLine(): string {
    const value = this.vehicleLine.value;
    let isCar = false;
    let isTruck = false;

    if (Array.isArray(value)) {
      value.forEach(
        (val) => {
          if (val.hasOwnProperty('vehicleType')) {
            if (val.vehicleType === 'C') {
              isCar = true;
            } else if (val.vehicleType === 'T') {
              isTruck = true;
            }
          }
        },
      );
    } else if (value.hasOwnProperty('vehicleType')) {
      if (value.vehicleType === 'C') {
        isCar = true;
      } else if (value.vehicleType === 'T') {
        isTruck = true;
      }
    }
    return this.determinVehicleType(isCar, isTruck);
  }

  determinVehicleType(isCar: boolean, isTruck: boolean) {
    let vehicleType = '';

    if (isCar && isTruck) {
      vehicleType = 'both';
    } else if (isCar) {
      vehicleType = 'C';
    } else if (isTruck) {
      vehicleType = 'T';
    }
    return vehicleType;
  }

  getPreviousBlockPointList(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this._dataLayer.loadPreviousBlockPointListForReports(
        this.marketGroup.value,
        this.modelYear.value,
        this.nameplate.value,
        this.getVehicleLineValue('modelName')).pipe(take(1))
        .subscribe(
          (data: any) => {

            this.previousEffectiveDateArray = this.getItemList(data);
            this.previousEffectiveDate.enable({ emitEvent: false });
          },
        );
    } else {
      this.previousEffectiveDate.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  getBlockPointListForReportsGMNA(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this._dataLayer.loadBlockPointListForReportsGMNA(this.getVehicleLineValue('id')).pipe(take(1))
        .subscribe(
          (data: any) => {
            this.effectiveDateArray = this.getItemList(data);
            this.effectiveDate.enable({ emitEvent: false });
            if (this.effectiveDateArray.length > 0 && !this.templateLoading) {
              this.effectiveDate.setValue([this.effectiveDateArray[0].value], { emitEvent: true });
            }
          },
        );
    } else {
      this.effectiveDate.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }

  loadGroupBy(isCar: boolean, loadingTemplate?: boolean) {
    this.loadCarTruckGroupBy(isCar, !isCar, loadingTemplate);
  }

  loadCarTruckGroupBy(isCar: boolean, isTruck: boolean, loadingTemplate?: boolean) {
    this.groupByArray = null;

    if (isCar && !isTruck) {
      this.groupByArray = this._dataLayer.getGMNAReportCarGroupBy();
    } else if (!isCar && isTruck) {
      this.groupByArray = this._dataLayer.getGMNAReportTruckGroupBy();
    } else if (isCar && isTruck) {
      this.groupByArray = this._dataLayer.getGMNAReportCarAndTruckGroupBy();
    }

    if (loadingTemplate) {
      this.groupBy.setValue(this.groupBy.value, { emitEvent: false });
    }
  }

  getGroupByIndicatorRptGMNA(isValid: boolean, isCar: boolean) {
    this.loadGroupBy(isCar);
    if ((isValid) && (this.groupByArray.length > 0)) {
      this.groupBy.enable({ emitEvent: false });
    } else {
      this.groupBy.disable({ emitEvent: false });
    }
  }

  getGroupByMOPkgRpt(isValid: boolean) {
    if ((isValid) && (this.groupByArray) && (this.groupByArray.length > 0)) {
      this.groupBy.enable({ emitEvent: !this.templateLoading });
    } else {
      this.groupBy.disable({ emitEvent: false });
    }
  }

  getGroupFlag(isValid: boolean) {
    if ((isValid) && (this.groupByArray) && (this.groupByArray.length > 0)) {
      this.groupFlag.enable({ emitEvent: false });
    } else {
      this.groupFlag.reset();
      this.groupBy.reset({ value: '', disabled: true }, { emitEvent: false });
    }
  }

  getAllUsers(loadingTemplate?: boolean, gmin?: string) {
    this.gminArray = [];
    this._dataLayer.getUsers().pipe(take(1))
      .subscribe(
        (data: any) => {
          data.forEach(
            (obj) => {
              this.gminArray.push({ label: obj.userName, value: obj.gmIN });
            },
          );
          if (loadingTemplate) { this.gmin.setValue(gmin, { emitEvent: false }); }
        },
      );
  }

  processForm(form: any, formatEffectiveDate = false) {
    this.marketingData = {};
    const formData = form ? form.value || form : {};
    let holdVehicleLineVal;
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        holdVehicleLineVal = this.checkHoldVehicleVal(key);

        if (key === 'selCodesCommaValues' && this.selectedCodesArray.length > 0) {
          if (formData[key].length < 1) {
            this.selectedCodesArray.forEach((code) => { formData.selCodesCommaValues.push(code.value); });
          } else if (formData[key].length > 1) {
            const currentFormDataArr = formData[key];
            const result = currentFormDataArr.concat(
              this.selectedCodesArray.forEach((code) => code.value));
            formData[key] = _uniqBy(result);
          }
        }
        if (Array.isArray(formData[key]) && formData[key].length > 0 && key !== 'vehicleLine' && key !== 'selCodesCommaValues') {
          this.marketingData[key] = formData[key].join().replace(/,,/g, ',').replace(/,\s*$/, '');
          if (key === 'effectiveDate' && formatEffectiveDate) {
            this.marketingData[key] = this.formatEffectiveDateId(formData[key]);
          }
        } else {
          if (key === 'vehicleLine') {
            holdVehicleLineVal = this.updateHoldVehcileLineVal(holdVehicleLineVal);
            this.marketingData[key] = holdVehicleLineVal;
          } else {
            this.handleKeyNotVehicleLine(formData, key, formatEffectiveDate);
          }
        }
      }
    }
    return this.marketingData;
  }

  checkHoldVehicleVal(key) {
    let holdVehicleLineVal;

    if (key === 'vehicleLine') {
      holdVehicleLineVal = this.getVehicleLineValue('id');
    }

    return holdVehicleLineVal;
  }

  updateHoldVehcileLineVal(holdVehicleLineVal) {
    if (Array.isArray(holdVehicleLineVal) && holdVehicleLineVal.length > 0) {
      holdVehicleLineVal = holdVehicleLineVal.join().replace(/,,/g, ',').replace(/,\s*$/, '');
    }

    return holdVehicleLineVal;
  }

  handleKeyNotVehicleLine(form, key, formatEffectiveDate) {
    if ((key === 'groupFlag') || (key === 'displayRestrictionString')) {
      this.marketingData[key] = (form[key]) ? 'Y' : 'N';
    } else if (key === 'selCodesCommaValues') {
      this.marketingData[key] = Array.isArray(form[key]) ? form[key].join(',') : form[key];
    } else if (key === 'effectiveDate' && formatEffectiveDate) {
      this.marketingData[key] = this.formatEffectiveDateId(form[key]);
    } else if (this._rc.isValidInput(form[key])) {
      this.marketingData[key] = form[key];
    }
  }

  // where formFields is an array of values from a FormGroup
  // optionalFields are fields that arent required but must all be valid if included
  processPartialForm(formFields: any, optionalFields?: any): boolean {

    for (const val of formFields) {
      if (Array.isArray(val) && val.length === 0) {
        // if empty array
        return false;
      } else if (!val) {
        // if a falsy value
        return false;
      }
    }

    if (optionalFields.length) {
      for (const val of optionalFields) {
        if (Array.isArray(val) && val.length === 0) {
          return false;
        } else if (!val) {
          return false;
        }
      }
    }

    // formFields/optionalFields should contain all valid values, return true
    return true;
  }

  // add selected codes to ddd and vds change report parameters
  addSelectedCodes(reportData: any): any {
    this.selectedCodesArray.forEach((codes) => {
      this.selectedArray.push(codes.value);
    });
    return Object.assign({ selCodesCommaValues: this.selectedArray.join(',') }, reportData);
  }

  sortMarketOffers(triggerEl?: any) {
    const sortBy1 = this.sortBy1.value;
    const sortBy2 = this.sortBy2.value;
    const sortBy3 = this.sortBy3.value;
    const sortBy4 = this.sortBy4.value;
    // tslint:disable-next-line:max-line-length
    let sortOptions = triggerEl ? (triggerEl === 'available' ? sortBy1 : sortBy2) : [sortBy1, sortBy2, sortBy3, sortBy4];
    if (Array.isArray(sortOptions)) {
      sortOptions = sortOptions.filter((x) => x);
    }
    if (this.availableMOCheckbox.value || triggerEl === 'available') {
      this.availableMarketOfferArray = _sortBy(this.availableMarketOfferArray, sortOptions);
      this.updateAvailableIds();
    }

    if (this.selectedMOCheckbox.value || triggerEl === 'selected') {
      this.selectedMarketOfferArray = _sortBy(this.selectedMarketOfferArray, sortOptions);
      this.updateSelectedIds();
    }
  }

  moveMarketOffers() {
    this.sortMarketOffers('selected');
    this.sortMarketOffers('available');
  }

  formatEffectiveDateId(val: any) {
    let idStr = '';
    if (Array.isArray(val) && val.length > 0) {
      val.forEach(
        (indexVal, index) => {
          if (index > 0) {
            idStr += ',';
          }
          if (typeof indexVal === 'string') {
            const indexValArr = indexVal.split('_');
            idStr += indexValArr[0];
          } else {
            idStr += indexVal;
          }

        },
      );
    } else if (typeof val === 'string') {
      const indexValArr = val.split('_');
      idStr = indexValArr[0];
    } else {
      idStr = val;
    }
    return idStr;
  }

  resetValue(sortNumber, formControl) {
    for (const i in this.sortArray) {
      if (sortNumber > i) {
        formControl.get(this.sortArray[i]).reset({ value: '', disabled: true }, { emitEvent: false });

      }
    }
  }

  pushValues(sortNumber, event, filterOptions) {
    this.index = filterOptions.map((x) => {
      return x.value;
    }).indexOf(event.value);
    if (this.dropDownArray[3].value !== '' && sortNumber > 2) {
      filterOptions.push({ label: this.dropDownArray[3].label, value: this.dropDownArray[3].value });
      this.dropDownArray[3].value = event.value;
      this.dropDownArray[3].label = filterOptions[this.index].label;
    }
    if (this.dropDownArray[2].value !== '' && sortNumber > 1) {
      filterOptions.push({ label: this.dropDownArray[2].label, value: this.dropDownArray[2].value });
      this.dropDownArray[2].value = event.value;
      this.dropDownArray[2].label = filterOptions[this.index].label;
    }
    if (this.dropDownArray[1].value !== '' && sortNumber > 0) {
      filterOptions.push({ label: this.dropDownArray[1].label, value: this.dropDownArray[1].value });
      this.dropDownArray[1].value = event.value;
      this.dropDownArray[1].label = filterOptions[this.index].label;
    }
    if (this.dropDownArray[0].value !== '') {
      filterOptions.push({ label: this.dropDownArray[0].label, value: this.dropDownArray[0].value });
      this.dropDownArray[0].value = event.value;
      this.dropDownArray[0].label = filterOptions[this.index].label;
    }
    return filterOptions;
  }

  setSortValue(sortNumber, event, filterOptions) {
    if (this.dropDownArray[sortNumber].label === '') {
      this.dropDownArray[sortNumber].value = event.value;
      this.index = filterOptions.map((x) => {
        return x.value;
      }).indexOf(event.value);
      this.dropDownArray[sortNumber].label = filterOptions[this.index].label;
      filterOptions.splice(this.index, 1);
      return filterOptions;
    } else {
      if (this.dropDownArray[sortNumber].label !== 'Choose') {
        filterOptions.push({ label: this.dropDownArray[sortNumber].label, value: this.dropDownArray[sortNumber].value });
      }
      this.dropDownArray[sortNumber].value = event.value;
      this.index = filterOptions.map((x) => {
        return x.value;
      }).indexOf(event.value);
      this.dropDownArray[sortNumber].label = filterOptions[this.index].label;
      filterOptions.splice(this.index, 1);
      return filterOptions;
    }
  }

  enableSort(sortNumber, formControl) {
    if (sortNumber !== 0) {
      formControl.get(this.sortArray[sortNumber - 1]).enable({ emitEvent: false });
    }
  }

  // Method to Add Vehicle Type
  addVehicleType(vehicleType) {
    this.vehicleType = vehicleType;
  }

  getVdsCodeByVehicleLine(isValid: boolean) {
    if (isValid) {
      this._dataLayer.getVdsCodeByVehicleLine(this.getVehicleLineValue('id')).pipe(take(1))
        .subscribe(
          (data: any) => {
            this.filterVdsFamilyArray = this.getItemList(data);
            this.filterVdsFamily.enable({ emitEvent: false });
            if (this.templateLoading) {
              const selectedVdsFamilies = this._tp.getSelectedValuesById(this._tp.template.vdsFamily, this.filterVdsFamilyArray);
              this.filterVdsFamily.setValue(selectedVdsFamilies);
            }
          },
        );
    } else {
      this.filterVdsFamily.reset({ value: '', disabled: true }, { emitEvent: !this.templateLoading });
    }
  }
}
