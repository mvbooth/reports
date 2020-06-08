import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { FinanceReport } from '../../classes/FinanceReport';
import { Marketing } from '../../classes/Marketing';
import { OrderFulfillment } from '../../classes/OrderFulfillment';

@Component({
    selector: 'mvp-vehicle-line-form',
    templateUrl: './vehicle-line-form.component.html',
    styleUrls: ['./vehicle-line-form.component.scss'],
})
export class VehicleLineFormComponent implements OnInit {
    @Input() form: FormGroup;
    @Input() reportRef: any;
    isFinance = false;
    isMarketing = false;
    isOf = false;
    financeFormValuesInOrder = ['marketingGroup', 'modelYear', 'namePlate', 'vehicleLine', 'bookCode', 'mmcCode', 'modelRestrictionString'];
    orderFormValuesInOrder = ['modelYear', 'marketingGroup', 'geographicMarket', 'namePlate', 'vehicleLine', 'bookCode'];
    marketingFormValuesInOrder = {
        modelYear: ['marketingGroup', 'geographicMarket', 'namePlate', 'vehicleLine',
            'mmcCode', 'modelRestrictionString', 'marketOfferStatus', 'effectiveDate'],
        marketingGroup: ['geographicMarket', 'namePlate', 'vehicleLine',
            'mmcCode', 'modelRestrictionString', 'marketOfferStatus', 'effectiveDate'],
        geographicMarket: ['vehicleLine',
            'mmcCode', 'modelRestrictionString', 'marketOfferStatus', 'effectiveDate'],
        namePlate: ['vehicleLine',
            'mmcCode', 'modelRestrictionString', 'marketOfferStatus', 'effectiveDate'],
        vehicleLine: ['mmcCode',
          'modelRestrictionString', 'marketOfferStatus', 'effectiveDate', 'marketOfferStatusTo', 'previousEffectiveDate'],
        mmcCode: ['modelRestrictionString'],
    };

    modelYearMulti = true;
    marketGroupMulti = true;
    marketMulti = true;
    namePlateMulti = true;
    vehicleLineMulti = true;
    bookCodeMulti = true;

    constructor() { }

    ngOnInit() {
        this.isFinance = this.reportRef instanceof FinanceReport;
        this.isMarketing = this.reportRef instanceof Marketing;
        this.isOf = this.reportRef instanceof OrderFulfillment;
        const modelYear = this.form.get('modelYear');
        this.modelYearMulti = modelYear ? this.form.get('modelYear')['controlType'].isMulti : false;
        const marketGroup = this.form.get('marketingGroup');
        this.marketGroupMulti = marketGroup ? this.form.get('marketingGroup')['controlType'].isMulti : false;
        const namePlate = this.form.get('namePlate');
        this.namePlateMulti = namePlate ? this.form.get('namePlate')['controlType'].isMulti : false;
        const vehicleLine = this.form.get('vehicleLine');
        this.vehicleLineMulti = vehicleLine ? this.form.get('vehicleLine')['controlType'].isMulti : false;
        const bookCode = this.form.get('bookCode');
        this.bookCodeMulti = bookCode ? this.form.get('bookCode')['controlType'].isMulti : false;
        const market = this.form.get('geographicMarket');
        this.marketMulti = market ? this.form.get('geographicMarket')['controlType'].isMulti : false;

    }

    onChange(model) {
      if (this.isFinance || this.isOf) {
        const formValuesInOrder = this.isFinance ? this.financeFormValuesInOrder : this.orderFormValuesInOrder;
        const index = formValuesInOrder.indexOf(model);
        for (let i = index + 1; i < formValuesInOrder.length; i++) {
          const formVal = this.form.get(formValuesInOrder[i]);
          if (formVal) {
            formVal.reset({ value: '', disabled: true }, { emitEvent: true });
          }
        }
      } else {
        const formValuesInOrder = this.isFinance ? this.financeFormValuesInOrder : this.marketingFormValuesInOrder;
        const list = formValuesInOrder[model];
        for (let i = 0; i < list.length; i++) {
          const formVal = this.form.get(list[i]);
          if (formVal) {
            formVal.reset({ value: '', disabled: true }, { emitEvent: true });
          }
        }
      }
    }

}
