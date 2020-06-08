import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ReportService } from '../report-service';
import { Marketing } from './Marketing';
// import { filter } from 'rxjs/operators';
@Injectable()
export class Template {
  // tslint:disable:max-line-length
  templateControlLength = 0;
  template: any;
  constructor( private readonly _reportService: ReportService) {  }

  loadTemplateValuesForForm(form: FormGroup, template: any) {
    this.template = template;
    // only get form controls that have values defined in the template
    const filteredFormControls = Object.keys(form.controls).filter(
        (control) => {
          return Object.keys(template).indexOf(control) !== - 1;
        },
    );
    this.templateControlLength = filteredFormControls.length;
    // enable all form controls first
    filteredFormControls.forEach((control) => {
        const holdFormControl = form.get(control);
        // form.get(control).enable({emitEvent: false});
        if (holdFormControl.hasOwnProperty('controlType')) {
          const controlType = form.get(control)['controlType'];
          const emitEventFlag = (controlType.hasOwnProperty('emitEvent')) ? controlType.emitEvent : true;
          let val = null;
          if (controlType.isMulti) {
            // our formcontrol will be expecting an array when we set the value
            val = [];
            if (Array.isArray(template[control]) && template[control].length > 1) {
              // our template value is an array with multiple indexes
              template[control].forEach(
                (templateVal) => {
                  if (controlType.isString) {
                    // no need to convert, push the templateVal (string) to our val array
                    val.push(templateVal);
                  } else {
                    // formcontrol values need to be numbers, convert then push to our val array
                    val.push(parseInt(templateVal, 10));
                  }
                },
              );
            } else {
              // template value is only is one item or a string
              // create tempVal based on whether or not the template value is an array.
              const tempVal: any = Array.isArray(template[control]) ? template[control][0] : template[control];
              const valHasComma = controlType.hasOwnProperty('commaVal') ? controlType.commaVal : false;
              let tempValArray = [];
              if (tempVal.toString().indexOf(',') !== -1 && !valHasComma) {
                // our value is probably a string of comma separated values, split it into array
                tempValArray = tempVal.split(',').filter((v) => v);
              }

              if (controlType.isString) {
                // no need to convert, push the template value (string) to our val array
                if (tempValArray.length > 0) {
                  tempValArray.forEach(
                    (tempValArrayVal) => {
                      val.push(tempValArrayVal);
                    },
                  );
                } else {
                  val.push(tempVal);
                }
              } else {
                // formcontrol values need to be numbers, convert then push to our val array
                if (tempValArray.length > 0) {
                  tempValArray.forEach(
                    (tempValArrayVal) => {
                      val.push(parseInt(tempValArrayVal, 10));
                    },
                  );
                } else {
                  val.push(parseInt(tempVal, 10));
                }
              }
            }
          } else {
            // our formcontrol is not a multiselect, so we can directly set the values without fancy loops
            // create tempVal based on whether or not the template value is an array.
            const tempVal = Array.isArray(template[control]) ? template[control][0] : template[control];

            if (controlType.isString) {
              // no need to convert, set val to the template value (string)
              val = tempVal;
            } else if (typeof tempVal === 'object' && 'getMonth' in tempVal) {
              val = new Date(tempVal);
            } else {
              // formcontrol values need to be numbers, convert then set val
              val = parseInt(tempVal, 10);
            }
          }

          // check if the control is disabled, if it is enable it (should happen in report classes... but just in case)
          if (holdFormControl.disabled) {
            holdFormControl.enable({emitEvent: false});
          }

          // need to set a flag as to whether setting the value is the final step or if the control will later be changed in a data service subscription
          if (emitEventFlag) {
            holdFormControl['controlType'].controlLoading = false;
          } else {
            holdFormControl['controlType'].controlLoading = true;
          }

          // set the value, unless emitEventFlag is explicitly set to false on control, events emit.
          form.get(control).setValue(val, {emitEvent: emitEventFlag});
        }
      });
  }

  getVehicleLineValues(_mkt: Marketing) {
    // Check if array if not make it an array
    const originalVal = Array.isArray(_mkt.vehicleLine.value) ? _mkt.vehicleLine.value : [_mkt.vehicleLine.value];
    // go through the array of all vehicleline options
    return _mkt.vehicleLineArray
    .filter((vlObj) => originalVal.includes(vlObj.value.id))
    .map((vlObj) => {
        // our template value matches an option in the vehicle line array, so return it.
        return vlObj.value;
    });
  }

  getVehicleLineValuesById(ids: any | any[], formValueArray: any[]) {
    // Check if array if not make it an array
    // go through the array of all vehicleline options
    const originalVal = Array.isArray(ids) ? ids : [ids];
    return formValueArray
    .filter((obj) => originalVal.includes(obj.value.id))
    .map((obj) => obj.value);
  }

  getSelectedValuesById(ids: any | any[], formValueArray: any[]) {
    // Check if array if not make it an array
    const originalVal = this.createIdArray(ids);
    // go through the array options
    return formValueArray
    .filter((obj) => this.doArraysIntersect(originalVal, obj.formattedValueArray))
    .map((obj) => obj.value);
  }

   createIdArray(value: any | any[]) {
    if (Array.isArray(value)) {
      return value.flatMap((arr) => arr.split(','));
    } else if (typeof value === 'string' || value instanceof String) {
      return value.split(',');
    }

    return [value];
  }

  doArraysIntersect(a: any[], b: any[]) {
    const sect = this.intersect_safe(a, b);
    return sect && sect.length;
  }

  intersect_safe(a: any[], b: any[]) {
    if (!a || !b) { return []; }

    let ai = 0;
    let bi = 0;
    const result = [];

    while (ai < a.length && bi < b.length) {
      if (a[ai] === b[bi]) {
        result.push(ai);
        ai++;
        bi++;
      } else {
        ai++;
      }
    }

    return result;
  }

  getEffectiveDateValuesFromArray(ids: string | string[], effectiveDateArray: any[]) {
    if (!ids || !effectiveDateArray) {
      return [];
    }
    const idArray = Array.isArray(ids) ? (ids[0] ? ids[0].split(',') : []) : ids.split(',');
    return effectiveDateArray
    .filter((efObj) => {

      // compare the first number in efObj.value array to our set values from template
      return idArray.includes(efObj.value) || idArray.includes(efObj.label);
    })
    .map((efObj) => efObj.value);
  }
}
