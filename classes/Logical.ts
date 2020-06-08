import { EventEmitter, Injectable } from '@angular/core';

@Injectable()
export class Logical {
  // selectedValues is string in the form of "1,2,3,4"
  // availableValuesArray is string array in form of key-value paired
  getLabelsFromSelectedValues(selectedValues: string, availableValuesArray: any[]): string {
    if (selectedValues && availableValuesArray) {
      // Convert selected values to array for comparison
      let selectedValue: string;
      let selectedValueArray: string[];
      try {
        selectedValueArray = selectedValues.split(',');
      } catch (e) {
        selectedValue = selectedValues;
      }
      const selectedLabelsArray = [];

      availableValuesArray.forEach(
        (entry) => {
          let keyElement : string = entry.label;
          let valueElement : any = entry.value;

          // Obtain value from the key-value paired
          let valueElementArray : string[] = valueElement.toString().split(',');

          // Compare value element against array of selectedValues
          if (selectedValueArray && valueElementArray) {
            let intersection : any = valueElementArray.filter(x => selectedValueArray.includes(x));
            if (intersection.length > 0) {
              selectedLabelsArray.push(keyElement);
            }
          }
          if (selectedValue === valueElement) {
            selectedLabelsArray.push(keyElement);
          }
        });

      return selectedLabelsArray.join(',');
    }

    return '';
  }
}
