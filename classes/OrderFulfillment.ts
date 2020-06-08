import { EventEmitter, Injectable } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {take} from 'rxjs/operators';
import { DataLayerService } from '../../data/data-layer.service';
import { IOrderFulfillment } from '../interfaces/orderfulfillment.interface';
import { ReportControls } from './ReportControls';

@Injectable()
export class OrderFulfillment {
    // used to check if form is valid when template is loaded
    eTemplateControlLoaded = new EventEmitter<boolean>();

    initData: any;
    // properties for every FormControl in the report group
    reportDescription = new FormControl({value: '', disabled: false}, [Validators.required]);
    modelYear = new FormControl({value: '', disabled: true}, [Validators.required]);
    marketGroup = new FormControl({value: '', disabled: true}, [Validators.required]);
    market = new FormControl({value: '', disabled: true}, [Validators.required]);
    nameplate = new FormControl({value: '', disabled: true}, [Validators.required]);
    bookCode = new FormControl({value: '', disabled: true}, [Validators.required]);
    optionCategory = new FormControl({value: '', disabled: true}, [Validators.required]);
    vehicleProdCode = new FormControl({value: '', disabled: true}, [Validators.required]);
    effectiveDate = new FormControl({value: '', disabled: true}, [Validators.required]);
    // properties to hold all the arrays to populate form selects
    modelYearArray: any;
    optionCategoryArray: any;
    marketingGroupArray: any;
    bookCodeArray: any;
    marketArray: any;
    nameplateArray: any;
    vehicleLineArray: any;
    effectiveDateArray: any;

    orderFulfillmentData = {} as IOrderFulfillment;

    constructor(private _datalayer: DataLayerService, private _rc: ReportControls) {

    }

    setInitialData(initData: any) {
        this.initData = initData;
        this.getModelYearData();
    }

    processForm(form: any) {
        this.orderFulfillmentData = {};
        for (const key in form) {
            if (form.hasOwnProperty(key) && form[key]) {
                if (Array.isArray(form[key])) {
                    this.orderFulfillmentData[key] = form[key].join();
                } else {
                    this.orderFulfillmentData[key] = form[key];
                }
            }
        }
        return this.orderFulfillmentData;
    }

    getModelYearData() {
        const selectItemArr = [];
        this.initData.modelYearMasterList.forEach(
            (obj) => {
                selectItemArr.push({label: obj.description, value: obj.id});
            },
        );
        this.modelYearArray = selectItemArr;
    }

    getOptionCategoryData() {
        const selectItemArr = [];
        this.initData.marketOptCategoryMasterList.forEach(
            (obj) => {
                selectItemArr.push({label: obj.description, value: obj.id});
            },
        );
        this.optionCategoryArray = selectItemArr;
    }

    getMarketingGroupData(isValid: boolean, loadingTemplate?: boolean) {
        if (isValid) {
            this._datalayer.loadAuthorizedMarketGroupListForCodeUsage().pipe(take(1))
            .subscribe(
                (data: any) => {
                    const templateVal = this.marketGroup.value;
                    this.marketingGroupArray = [];
                    data.forEach(
                        (obj) => {
                            this.marketingGroupArray.push({label: obj.description, value: obj.id});
                        },
                    );
                    this.marketGroup.enable({emitEvent: false});
                    if (loadingTemplate) {
                      this.marketGroup.setValue(templateVal, {emitEvent: false});
                      this.eTemplateControlLoaded.emit();
                    }
                },
            );
        } else {
            this.marketGroup.disable();
        }
    }

    getBookCodeData(isValid: boolean, loadingTemplate?: boolean) {
        if (isValid) {
            this._datalayer.loadBookListFromModelYearForCodeUsage(this.modelYear.value).pipe(take(1))
            .subscribe(
                (data: any) => {
                    const templateVal = this.bookCode.value;
                    this.bookCodeArray = [];
                    data.forEach(
                        (obj) => {
                            this.bookCodeArray.push({label: obj.description, value: obj.id});
                        },
                    );
                    this.bookCode.enable({emitEvent: false});
                    if (loadingTemplate) {
                      this.bookCode.setValue(templateVal, {emitEvent: false});
                      this.eTemplateControlLoaded.emit();
                    }
                },
            );
        } else {
            this.bookCode.disable();
        }
    }

    getMarketData(isValid: boolean, loadingTemplate?: boolean) {
      if (isValid) {
        this._datalayer.loadMarketsListForCodeUsage(this.marketGroup.value).pipe(take(1)).subscribe(
          (data: any) => {
            const templateVal = this.market.value;
            this.marketArray = [];
            data.forEach((obj) => {
              this.marketArray.push({label: obj.description, value: obj.id});
            });
            this.market.enable({emitEvent: false});
            if (loadingTemplate) {
              this.market.setValue(templateVal, {emitEvent: false});
              this.eTemplateControlLoaded.emit();
            }
          },
        );
      } else {
        this.market.disable();
      }
    }

    getNameplateData(isValid: boolean, loadingTemplate?: boolean) {
      if (isValid) {
        this._datalayer.loadNameplateListFromGroupIdModelYearIdForCodeUsage(this.modelYear.value, this.marketGroup.value)
          .pipe(take(1)).subscribe((data: any) => {
            const templateVal = this.nameplate.value;
            this.nameplateArray = [];
            data.forEach(
                (obj) => {
                    this.nameplateArray.push({label: obj.description, value: obj.id});
                },
            );
            this.nameplate.enable({emitEvent: false});
            if (loadingTemplate) {
              this.nameplate.setValue(templateVal, {emitEvent: false});
              this.eTemplateControlLoaded.emit();
            }
          },
        );
      } else {
        this.nameplate.disable();
      }
    }

    getVehicleLineData(isValid: boolean, loadingTemplate?: boolean) {

        if (isValid) {
            this._datalayer.loadVehicleLineFromNamePltListForOFCReport(
                this.modelYear.value,
                this.marketGroup.value,
                this.nameplate.value).pipe(take(1))
                .subscribe(
                (data: any) => {
                    const templateVal = this.vehicleProdCode.value;
                    this.vehicleLineArray = [];
                    data.forEach(
                        (obj) => {
                            this.vehicleLineArray.push({label: obj.description, value: obj.id});
                        },
                    );
                    this.vehicleProdCode.enable({emitEvent: false});
                    if (loadingTemplate) {
                      this.vehicleProdCode.setValue(templateVal, {emitEvent: false});
                      this.eTemplateControlLoaded.emit();
                    }
                },
            );
        } else {
            this.vehicleProdCode.disable();
        }
    }

    getBlockPointData(isValid: boolean, loadingTemplate?: boolean) {
        if (isValid) {
            this._datalayer.loadBlockPointListForOFC(
                this.vehicleProdCode.value,
                this.marketGroup.value,
                this.modelYear.value,
                this.nameplate.value).pipe(take(1))
                .subscribe(
                    (data: any) => {
                        const templateVal = this.effectiveDate.value;
                        this.effectiveDateArray = [];
                        this.effectiveDate.reset('', {emitEvent: false});
                        data.forEach(
                            (obj) => {
                                this.effectiveDateArray.push({label: obj.description, value: obj.id});
                            },
                        );
                        this.effectiveDate.enable({emitEvent: false});
                        if (loadingTemplate) {
                          this.effectiveDate.setValue(templateVal, {emitEvent: false});
                          this.eTemplateControlLoaded.emit();
                        }
                    },
                );
        } else {
            this.effectiveDate.disable();
        }
    }
}
