import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mvp-opt-restrict-matrix',
  templateUrl: './opt-restrict-matrix.component.html',
  styleUrls: ['./opt-restrict-matrix.component.scss'],
})
export class OptRestrictMatrixComponent implements OnInit {
  SELECT_OPTION = 'select option';

  selectData = [
    {id: 1, description: this.SELECT_OPTION},
    {id: 2, description: this.SELECT_OPTION},
    {id: 3, description: this.SELECT_OPTION},
    {id: 4, description: this.SELECT_OPTION},
    {id: 5, description: this.SELECT_OPTION},
    {id: 6, description: this.SELECT_OPTION},
    {id: 7, description: this.SELECT_OPTION},
    {id: 8, description: this.SELECT_OPTION},
    {id: 9, description: this.SELECT_OPTION},
    {id: 10, description: this.SELECT_OPTION},
  ];
  constructor() { }

  ngOnInit() {
  }

}
