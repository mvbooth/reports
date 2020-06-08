import { EventEmitter, Injectable } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { DataLayerService } from '../../data/data-layer.service';
import { IFinance } from '../interfaces/finance.interface';

@Injectable()
export class FinanceReport {
  // used to check if form is valid when template is loaded
  eTemplateControlLoaded = new EventEmitter<boolean>();

  financeData = {} as IFinance;
  initData: any;
  reportDescription = new FormControl({ value: '', disabled: false }, [Validators.required]);
  publishedDate = new FormControl({ value: '', disabled: false });
  publishId = new FormControl({ value: '0', disabled: false });
  byMRS = new FormControl({ value: true, disabled: false });
  status = new FormControl({ value: 'WIP', disabled: false }, [Validators.required]);
  mmcCodeSP = new FormControl({ value: '', disabled: false });
  marketGroup = new FormControl({ value: '', disabled: true }, [Validators.required]);
  modelYear = new FormControl({ value: '', disabled: true }, [Validators.required]);
  nameplate = new FormControl({ value: '', disabled: true }, [Validators.required]);
  bookCode = new FormControl({ value: '', disabled: true }, [Validators.required]);
  vehicleLine = new FormControl({ value: '', disabled: true }, [Validators.required]);
  merchandiseModelCode = new FormControl({ value: '', disabled: true });
  modelRestrictionString = new FormControl({ value: '', disabled: true });
  availabilityIndicator = new FormControl({ value: '', disabled: false });
  optionCode = new FormControl({ value: '', disabled: false });
  effectiveDate = new FormControl({ value: '', disabled: false });
  effectiveDateTo = new FormControl({ value: '', disabled: false });
  RecentDatesCmpr = new FormControl({ value: '', disabled: false }, [Validators.required]);
  CompareReportPreviousDate = new FormControl({ value: '', disabled: false }, [Validators.required]);
  ComparisonTypes = new FormControl({ value: '', disabled: false }, [Validators.required]);
  TypeFieldName = new FormControl({ value: '', disabled: false }, [Validators.required]);
  toDate = new FormControl({ value: new Date(), disabled: false });
  fromDate = new FormControl({ value: new Date(), disabled: false });
  sortOrder = new FormControl({ value: 'optionCode', disabled: false });
  marketGroupArray: any;
  modelYearArray: any;
  namePlateArray: any;
  bookCodeArray: any;
  vehicleLineArray: any;
  modelCodeArray: any;
  restrictionStringArray: any;
  publishDateFormated: any;
  availabilityIndicatorArray: any;
  optionCodeArray: any;
  effectiveDateArray: any;
  RecentDatesCmprArray: any;
  CompareReportPreviousDateArray: any;
  ComparisonTypesArray: any;
  reportTypeFieldNameArray: any;
  countTemplateValuesSet = 0;
  templateLoading = false;

  constructor(private _datalayer: DataLayerService) { }

  processForm(form: any) {
    this.financeData = {};
    for (const key in form) {
      if (form.hasOwnProperty(key) && (form[key] || typeof form[key] === 'boolean')) {
        if (Array.isArray(form[key])) {
          this.financeData[key] = form[key].join();
        } else {
          this.financeData[key] = form[key];
        }
      }
    }
    return this.financeData;
  }

  setInitialData(initData: any) {
    this.initData = initData;
  }

  resetFormGroups() {

    this.reportDescription = new FormControl({ value: '', disabled: false }, [Validators.required]);
    this.publishedDate = new FormControl({ value: '', disabled: false });
    this.publishId = new FormControl({ value: '0', disabled: false });
    this.byMRS = new FormControl({ value: true, disabled: false });
    this.status = new FormControl({ value: 'WIP', disabled: false }, [Validators.required]);
    this.mmcCodeSP = new FormControl({ value: '', disabled: false });
    this.marketGroup = new FormControl({ value: '', disabled: true }, [Validators.required]);
    this.modelYear = new FormControl({ value: '', disabled: true }, [Validators.required]);
    this.nameplate = new FormControl({ value: '', disabled: true }, [Validators.required]);
    this.bookCode = new FormControl({ value: '', disabled: true }, [Validators.required]);
    this.vehicleLine = new FormControl({ value: '', disabled: true }, [Validators.required]);
    this.merchandiseModelCode = new FormControl({ value: '', disabled: true });
    this.modelRestrictionString = new FormControl({ value: '', disabled: true });
    this.availabilityIndicator = new FormControl({ value: '', disabled: false });
    this.optionCode = new FormControl({ value: '', disabled: false });
    this.effectiveDate = new FormControl({ value: '', disabled: false });
    this.effectiveDateTo = new FormControl({ value: '', disabled: false });
    this.RecentDatesCmpr = new FormControl({ value: '', disabled: false }, [Validators.required]);
    this.CompareReportPreviousDate = new FormControl({ value: '', disabled: false }, [Validators.required]);
    this.ComparisonTypes = new FormControl({ value: '', disabled: false }, [Validators.required]);
    this.TypeFieldName = new FormControl({ value: '', disabled: false }, [Validators.required]);
    this.toDate = new FormControl({ value: new Date(), disabled: false });
    this.fromDate = new FormControl({ value: new Date(), disabled: false });
    this.sortOrder = new FormControl({ value: 'optionCode', disabled: false });
    this.eTemplateControlLoaded = new EventEmitter<boolean>();

  }

  getPublishId(isValid: boolean, publishDate: any, isBarsReport: any, bookCodes: any, vehicleLineIds: any) {
    if (isValid) {
      // convert arrays to strings for ternary in retrievePublishId
      if (bookCodes instanceof Array) {
        bookCodes = bookCodes.join();
      }
      if (vehicleLineIds instanceof Array) {
        vehicleLineIds = vehicleLineIds.join();
      }
      this._datalayer.retrievePublishId(publishDate, isBarsReport, bookCodes, vehicleLineIds)
        .pipe(take(1))
        .subscribe((data: any) => {
          data.forEach((obj) => {
            this.publishId.setValue(obj, { emitEvent: true });
          });
        });
      if (this.templateLoading) {
        if (this.publishId.hasOwnProperty('controlType')) {     // this looks like it shouldn't be here, but it works.
          this.publishId['controlType'].controlLoading = false; // If you can figure out a better way, feel free to refactor.
        }
        this.countTemplateValuesSet++;
        this.publishId.setValue(this.publishId.value);
      }
      this.publishId.enable({ emitEvent: false });
    }
  }

  getByMRS(isValid: boolean, vehicleLineId: any) {
    if (isValid) {
      this._datalayer.retrieveByMRS(vehicleLineId)
        .pipe(take(1))
        .subscribe((data: any) => {
          this.byMRS.setValue(data, { emitEvent: true });
        });
    }
  }

  // only return publish date if 'current' radio is not selected in reports
  usePublishDate(): any {
    return this.status.value === 'PUB' && this.publishDateFormated != 'Invalid date' ? this.publishDateFormated : null;
  }

  getMarketGroups(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this._datalayer.readMarketingGroups(this.usePublishDate()).pipe(take(1))
        .subscribe((data: any) => {
          // const templateVal = this.marketGroup.value;
          this.marketGroupArray = [];
          data.forEach((obj) => {
            this.marketGroupArray.push({ label: obj.label, value: obj.value });
          });
          if (this.templateLoading) {
            if (this.publishedDate.hasOwnProperty('controlType')
              && this.publishedDate['controlType']) {     // this looks like it shouldn't be here, but it works.
              this.publishedDate['controlType'].controlLoading = false; // If you can figure out a better way, feel free to refactor.
            }
            if (this.marketGroup.hasOwnProperty('controlType') && this.marketGroup['controlType']) {
              this.marketGroup['controlType'].controlLoading = false;
            }
            this.countTemplateValuesSet++;
            this.marketGroup.setValue(this.marketGroup.value);
          }
          this.marketGroup.enable({ emitEvent: false });
        });
    } else {
      this.marketGroup.reset({ value: '', disabled: true }, { emitEvent: true });
    }
  }

  getModelYears(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this.modelYearArray = [];
      this._datalayer.readModelYears(this.usePublishDate()).pipe(take(1))
        .subscribe((data: any) => {
          data.forEach((obj) => {
            this.modelYearArray.push({ label: obj.label, value: obj.value });
          });
          if (this.templateLoading && this.modelYear.hasOwnProperty('controlType') && this.modelYear['controlType']) {
            this.modelYear['controlType'].controlLoading = false;
            this.countTemplateValuesSet++;
            this.modelYear.setValue(this.modelYear.value);
          }
          this.modelYear.enable({ emitEvent: false });
        });
    } else {
      this.modelYear.reset({ value: '', disabled: true }, { emitEvent: true });
    }
  }

  getNamePlates(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this.namePlateArray = [];
      this._datalayer.readNamePlates(this.marketGroup.value, this.modelYear.value, this.usePublishDate()).pipe(take(1))
        .subscribe((data: any) => {
          data.forEach((obj) => {
            this.namePlateArray.push({ label: obj.label, value: obj.value });
          });
          if (this.templateLoading && this.nameplate['controlType']) {
            this.nameplate['controlType'].controlLoading = false;
            this.countTemplateValuesSet++;
            this.nameplate.setValue(this.nameplate.value);
          }
          this.nameplate.enable({ emitEvent: false });
        });
    } else {
      this.nameplate.reset({ value: '', disabled: true }, { emitEvent: true });
    }
  }

  getNamePlatesCmprReport(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this.namePlateArray = [];
      this._datalayer.readNamePlatesCmprReport(this.marketGroup.value, this.modelYear.value, this.usePublishDate()).pipe(take(1))
        .subscribe((data: any) => {
          data.forEach((obj) => {
            this.namePlateArray.push({ label: obj.label, value: obj.value });
          });
          if (this.templateLoading) {

            this.nameplate['controlType'].controlLoading = false;
            this.countTemplateValuesSet++;
            if (this.nameplate.value) {
              this.nameplate.setValue(this.nameplate.value.toString());
            }
          }
          this.nameplate.enable({ emitEvent: false });
        });
    } else {
      this.nameplate.reset({ value: '', disabled: true }, { emitEvent: true });
    }
  }

  getBookCodes(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this.bookCodeArray = [];
      this._datalayer.readBookCodes(this.modelYear.value, this.nameplate.value, this.usePublishDate()).pipe(take(1))
        .subscribe((data: any) => {
          data.forEach((obj) => {
            this.bookCodeArray.push({ label: obj.label, value: obj.value });
          });
          if (this.templateLoading) {
            this.bookCode['controlType'].controlLoading = false;
            this.countTemplateValuesSet++;
            this.bookCode.setValue(this.bookCode.value);
          }
          this.bookCode.enable({ emitEvent: false });
        });
    } else {
      this.bookCode.reset({ value: '', disabled: true }, { emitEvent: true });
    }
  }

  getBookCodesByVehicleLineOffering(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this.bookCodeArray = [];
      this._datalayer.readBookCodesByVehicleLineOffering(this.vehicleLine.value, this.usePublishDate()).pipe(take(1))
        .subscribe((data: any) => {
          data.forEach((obj) => {
            this.bookCodeArray.push({ label: obj.label, value: obj.value });
          });
          if (this.templateLoading) {
            this.bookCode['controlType'].controlLoading = false;
            this.countTemplateValuesSet++;
            this.bookCode.setValue(this.bookCode.value);
          }
          this.bookCode.enable({ emitEvent: false });
        });
    } else {
      this.bookCode.reset({ value: '', disabled: true }, { emitEvent: true });
    }
  }

  readBookCodesCmprReport(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this.bookCodeArray = [];
      this._datalayer.readBookCodesCmprReport(this.vehicleLine.value, this.usePublishDate()).pipe(take(1))
        .subscribe((data: any) => {

          data.forEach((obj) => {
            this.bookCodeArray.push({ label: obj.label, value: obj.value });
          });
          if (this.templateLoading) {
            this.bookCode['controlType'].controlLoading = false;
            this.countTemplateValuesSet++;
            this.bookCode.setValue(this.bookCode.value);
          }
          this.bookCode.enable({ emitEvent: false });
        });
    } else {
      this.bookCode.reset({ value: '', disabled: true }, { emitEvent: true });
    }
  }

  getVehicleLine(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this.vehicleLineArray = [];
      this._datalayer.readVehicleLines(this.modelYear.value, this.nameplate.value, this.bookCode.value, this.usePublishDate())
        .pipe(take(1))
        .subscribe((data: any) => {

          data.forEach((obj) => {
            this.vehicleLineArray.push({ label: obj.label, value: obj.value });
          });
          if (this.templateLoading &&  this.vehicleLine['controlType']) {
            this.vehicleLine['controlType'].controlLoading = false;
            this.countTemplateValuesSet++;
            this.vehicleLine.setValue(this.vehicleLine.value);
          }
          this.vehicleLine.enable({ emitEvent: false });
        });
    } else {
      this.vehicleLine.reset({ value: '', disabled: true }, { emitEvent: true });
    }
  }

  getVehicleLine2(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this.vehicleLineArray = [];
      this._datalayer.readVehicleLines2(this.modelYear.value, this.nameplate.value, this.usePublishDate())
        .pipe(take(1))
        .subscribe((data: any) => {

          data.forEach((obj) => {
            this.vehicleLineArray.push({ label: obj.label, value: obj.value });
          });
          if (this.templateLoading && this.vehicleLine['controlType']) {
            this.vehicleLine['controlType'].controlLoading = false;
            this.countTemplateValuesSet++;
            this.vehicleLine.setValue(this.vehicleLine.value);
          }
          this.vehicleLine.enable({ emitEvent: false });
        });
    } else {
      this.vehicleLine.reset({ value: '', disabled: true }, { emitEvent: true });
    }
  }

  getVehicleLinesCmprReport(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this.vehicleLineArray = [];
      this._datalayer.readVehicleLinesCmprReport(this.modelYear.value, this.nameplate.value, this.bookCode.value, this.usePublishDate())
        .pipe(take(1))
        .subscribe((data: any) => {

          data.forEach((obj) => {
            this.vehicleLineArray.push({ label: obj.label, value: obj.value });
          });
          if (this.templateLoading && this.vehicleLine['controlType']) {
            this.vehicleLine['controlType'].controlLoading = false;
            this.countTemplateValuesSet++;
            this.vehicleLine.setValue(this.vehicleLine.value.toString());
          }
          this.vehicleLine.enable({ emitEvent: false });
        });
    } else {
      this.vehicleLine.reset({ value: '', disabled: true }, { emitEvent: true });
    }
  }

  getModelCode(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this.modelCodeArray = [];
      this._datalayer.readModelCodes(this.vehicleLine.value).pipe(take(1))
        .subscribe((data: any) => {

          data.forEach((obj) => {
            this.modelCodeArray.push({ label: obj.label, value: obj.value });
          });
          if (this.templateLoading && this.merchandiseModelCode['controlType']) {
            this.merchandiseModelCode['controlType'].controlLoading = false;
            this.countTemplateValuesSet++;
            if (this.merchandiseModelCode.value != 0) {
              this.merchandiseModelCode.setValue(this.merchandiseModelCode.value);
            } else {
              this.merchandiseModelCode.setValue('');
            }
          }
          this.merchandiseModelCode.enable({ emitEvent: false });
        });
    }
  }

  getOptionCodes(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this.optionCodeArray = [];
      this._datalayer.readOptionCodes(this.vehicleLine.value).pipe(take(1))
        .subscribe((data: any) => {

          data.forEach((obj) => {
            this.optionCodeArray.push({ label: obj.label, value: obj.value });
          });
          if (this.templateLoading) {
            this.optionCode['controlType'].controlLoading = false;
            this.countTemplateValuesSet++;
            if (this.merchandiseModelCode.value != 0) {
              this.optionCode.setValue(this.optionCode.value);
            } else {
              this.optionCode.setValue('');
            };
          }
          this.optionCode.enable({ emitEvent: false });
        });
    }
  }

  getRestrictionString(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this.restrictionStringArray = [];

      if (!Array.isArray(this.merchandiseModelCode.value) && isNaN(this.merchandiseModelCode.value)) {
        this.merchandiseModelCode.reset('', { emitEvent: false });
      } else {
        this._datalayer.readRestrictionString(this.merchandiseModelCode.value, this.vehicleLine.value).pipe(take(1))
          .subscribe((data: any) => {

            data.forEach((obj) => {
              this.restrictionStringArray.push({ label: obj.label, value: obj.label });
            });
            if (this.templateLoading) {
              this.modelRestrictionString['controlType'].controlLoading = false;
              this.countTemplateValuesSet++;
              this.modelRestrictionString.setValue(this.modelRestrictionString.value);
            }
            this.modelRestrictionString.enable({ emitEvent: false });
          });
      }
    } else {
      this.modelRestrictionString.reset({ value: '', disabled: true }, { emitEvent: true });
    }
  }

  getAvailabilityIndicators(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this.availabilityIndicatorArray = [];
      this._datalayer.readAvailabilityIndicators().pipe(take(1))
        .subscribe((data: any) => {

          data.forEach((obj) => {
            this.availabilityIndicatorArray.push({ label: obj.label, value: obj.label });
          });
          if (this.templateLoading && this.availabilityIndicator['controlType']) {
            this.availabilityIndicator['controlType'].controlLoading = false;
            this.countTemplateValuesSet++;
            if (this.availabilityIndicator.value != 0) {
              this.availabilityIndicator.setValue(this.availabilityIndicator.value);
            } else {
              this.availabilityIndicator.setValue('');
            }

          }
          this.availabilityIndicator.enable({ emitEvent: false });
        });
    }
    return this.availabilityIndicatorArray;
  }

  readRecentDatesCmprReport(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this.RecentDatesCmprArray = [];
      this._datalayer.readRecentDatesCmprReport(this.vehicleLine.value).pipe(take(1))
        .subscribe((data: any) => {
          data.forEach((obj) => {
            this.RecentDatesCmprArray.push({ label: obj.label, value: obj.value });
          });
          if (this.templateLoading && this.RecentDatesCmpr['controlType']) {
            this.RecentDatesCmpr['controlType'].controlLoading = false;
            this.countTemplateValuesSet++;
            this.RecentDatesCmpr.setValue(this.RecentDatesCmpr.value);
          }
          this.RecentDatesCmpr.enable({ emitEvent: false });
        });
    } else {
      this.RecentDatesCmpr.reset({ value: '', disabled: true }, { emitEvent: true });
    }
  }

  readCompareReportPreviousDate(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this.CompareReportPreviousDateArray = [];
      this._datalayer.readRecentDatesCmprReport(this.vehicleLine.value).pipe(take(1))
        .subscribe((data: any) => {
          data.forEach((obj) => {
            this.CompareReportPreviousDateArray.push({ label: obj.label, value: obj.value });
          });
          if (this.templateLoading && this.CompareReportPreviousDate['controlType']) {
            this.CompareReportPreviousDate['controlType'].controlLoading = false;
            this.countTemplateValuesSet++;
            this.CompareReportPreviousDate.setValue(this.CompareReportPreviousDate.value);
          }
          this.CompareReportPreviousDate.enable({ emitEvent: false });
        });
    } else {
      this.CompareReportPreviousDate.reset({ value: '', disabled: true }, { emitEvent: true });
    }
  }

  readComparisonTypes(isValid: boolean, loadingTemplate?: boolean) {
    if (isValid) {
      this.ComparisonTypesArray = [];
      this._datalayer.readComparisonTypes(this.modelYear.value)
        .pipe(take(1))
        .subscribe((data: any) => {
          if (!this.templateLoading) {
            this.ComparisonTypes.reset('', { emitEvent: true });
          }
          data.forEach((obj) => {
            this.ComparisonTypesArray.push({ label: obj.label, value: obj.value.toUpperCase() });
          });
          if (this.templateLoading) {
            this.ComparisonTypes['controlType'].controlLoading = false;
            this.countTemplateValuesSet++;
            this.ComparisonTypes.setValue(this.ComparisonTypes.value);
          }
          this.ComparisonTypes.enable({ emitEvent: false });
        });
    } else {
      this.ComparisonTypes.reset({ value: '', disabled: true }, { emitEvent: true });
    }
  }

  reportTypeFieldName(isValid: boolean) {
    if (isValid) {
      this.reportTypeFieldNameArray = [];
      if (!this.templateLoading) {
        this.TypeFieldName.reset('', { emitEvent: false });
      }
      this._datalayer.reportTypeFieldName(this.ComparisonTypes.value).pipe(take(1))
        .subscribe((data: any) => {
          data.forEach((obj) => {
            this.reportTypeFieldNameArray.push({ label: obj.label, value: obj.value });
          });
          this.TypeFieldName.enable({ emitEvent: false });
          this.TypeFieldName.setValue(this.TypeFieldName.value)
        });
    } else {
      this.TypeFieldName.reset({ value: '', disabled: true }, { emitEvent: true });
    }
  }

  formatDateInput(form: any) {
    return new Date(moment(form).format('MM/DD/YYYY'));
  }

  getDateFromString(strDate: string, format = 'YYYY-MM-DD'): any {
    return moment(strDate, format).toDate();
  }
}
