import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';


@Component({
  selector: 'mvp-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss'],
})
export class StatusComponent implements OnInit {

  readonly CURRENT: string = 'WIP';
  readonly BY_PUBLISHED_DATE: string = 'PUB';
  private _status: string;
  public readyToEnable: boolean = false;
  private _vehicleLine: number;

  @Input()
  set vehicleLine(newValue: number) {
    this._vehicleLine = newValue;
    this.readyToEnable = newValue && newValue > 0;
  }
  @Input()
  set status(status) {
    if (this._status !== status) {
      this._status = status;
      this.statusChanged.emit(this._status);
    }
  }
  get status() {
    return this._status;
  }

  @Output()
  public statusChanged: EventEmitter<string> = new EventEmitter();

  constructor() {}

  ngOnInit() {

  }
  changeStatus(newStatus: string) {
    if (newStatus === this.CURRENT || newStatus === this.BY_PUBLISHED_DATE) {
      this.status = newStatus;
    }
  }
}
