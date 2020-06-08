import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mvp-mdl-yr-change-gme',
  templateUrl: './mdl-yr-change-gme.component.html',
  styleUrls: ['./mdl-yr-change-gme.component.scss'],
})
export class MdlYrChangeGmeComponent implements OnInit {
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
