import { EventEmitter, Injectable } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import * as moment from 'moment';
import { IAdmin } from '../interfaces/admin.interface';

@Injectable()
export class AdminReport {
  // used to check if form is valid when template is loaded
  eTemplateControlLoaded = new EventEmitter<boolean>();

  adminData = {} as IAdmin;
  initData: any;
  // properties for every FormControl in report group
  reportDescription = new FormControl({value: '', disabled: false}, [Validators.required]);
  tableName = new FormControl({value: '', disabled: false}, [Validators.required]);
  fromDate = new FormControl({value: '', disabled: false}, [Validators.required]);
  toDate = new FormControl({value: '', disabled: false}, [Validators.required]);
  userName = new FormControl({value: '', disabled: false}, [Validators.required]);
  gmin = new FormControl({value: '', disabled: false}, [Validators.required]);
  user = new FormControl({value: 'Current', disabled: false}, [Validators.required]);
  geographicMarket = new FormControl({value: '-1', disabled: false});
  marketingCluster = new FormControl({value: '-1', disabled: false});
  marketingNSC = new FormControl({value: '-1', disabled: false});
  folderName = new FormControl({value: 'Admin', disabled: false});
  reportName = new FormControl({value: '', disabled: false});
  isLongReport = new FormControl({value: false});

  tableNameArray = [];

  constructor() {

  }
  processForm(form: any) {
    this.adminData = {};
    for (const key in form) {
      if (form.hasOwnProperty(key) && form[key]) {
        if (Array.isArray(form[key])) {
          this.adminData[key] = form[key].join();
        } else {
          this.adminData[key] = form[key];
        }
      }
    }
    return this.adminData;
  }

  formatDateInput(form: any) {
    // set date to YYYY-MM-DD
    return moment(form).format('YYYY-MM-DD');
  }

  getDateFromString(strDate: string, format = 'YYYY-MM-DD'): any {
    return moment(strDate, format).toDate();
  }

  setInitialData(initData: any) {
    // need tableNameList -> change history misc
    this.initData = initData;

  }
  getTableNameData() {
    const selectItemArr = [];
    this.initData.tableNameList.forEach(
      (obj) => {
        selectItemArr.push({label: obj.description, value: obj.code});
      },
    );
    this.tableNameArray = selectItemArr;
  }
}
