import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataReportsService } from '../../../../../data/data-reports.service';
import { NotificationService } from '../../../../../shared/notification.service';

@Component({
  selector: 'mvp-effective-date',
  templateUrl: './effective-date.component.html',
  styleUrls: ['./effective-date.component.scss'],
})
export class EffectiveDateComponent implements OnInit, OnDestroy {

  readonly BY_PUBLISHED_DATE: string = 'PUB';
  private _status: string;
  private _required = false;
  private _vehicleLine: number;
  private _publishId: number;
  private templateEffValue: any[];
  private _effectiveDate: string;
  public readyToDisplay: boolean;
  public selectedOptions = [];
  destroySubject$: Subject<void> = new Subject();

  @Input()
  set publishId(pubId: any) {
    this.selectedOptions = [];
    if (pubId || pubId === 0) {
      this._publishId = pubId;
    }
    this.getEffectiveDates();
  }

  @Input()
  set templateEffDate(templateEffValue) {
    if (templateEffValue) {
      this.templateEffValue = templateEffValue[0] ? templateEffValue[0].split(',') : templateEffValue;
    }
  }

  @Input()
  set status(newStatus: string) {
    if (this._status !== newStatus) {
      this.reset();
    }
    this._status = newStatus;
    this._effectiveDate = newStatus !== this.BY_PUBLISHED_DATE ? '' : this._effectiveDate;
    this.getEffectiveDates();
  }
  get status() { return this._status; }

  @Input()
  set vehicleLine(newVehicleLine: number) {
    if (this._vehicleLine !== newVehicleLine) {
      this.reset();
    }
    this._vehicleLine = newVehicleLine;
    this.getEffectiveDates();
  }

  @Input()
  set required(requireFormInput: boolean) {
    this._required = requireFormInput;
  }
  get required() { return this._required && this.BY_PUBLISHED_DATE === this._status; }

  @Output('change')
  effDate: EventEmitter<any> = new EventEmitter();

  effDateOptions: Array<any>;

  constructor(private _reportService: DataReportsService, private _notifyService: NotificationService) { }

  ngOnInit() {
    
  }

  ngOnDestroy() {
    this.destroySubject$.next();
  }

  reset() {
    this.readyToDisplay = false;
    this._effectiveDate = '';
    this.selectedOptions = [];
    this.effDate.emit({ label: this._effectiveDate });
  }
  getEffectiveDates() {
    if (this._vehicleLine > 0 && this._status === this.BY_PUBLISHED_DATE && this._publishId > 0) {
      // Temporary
      this._reportService.readEffectiveDatesByPublishID(this._publishId, this._vehicleLine)
        .pipe(takeUntil(this.destroySubject$))
        .subscribe((effDateOptions: any) => {
          if (effDateOptions.length > 0) {
            this.effDateOptions = effDateOptions;
            this.readyToDisplay = true;
            if (this.templateEffValue) {
              this.selectedOptions = this.effDateOptions.filter((x) =>
                this.templateEffValue.includes(x.label.toString())).map((y) => y.value);
            }
            this.selection();
          } else {
            this.readyToDisplay = false;
            this._notifyService.notify('error', 'No effective dates', 'There are no effective dates for the chosen vehicle line.');
          }
        });
    }
  }
  selection() {
    const selectionArray = this.selectedOptions;
    const dates = selectionArray.map((selection) => (this.effDateOptions[selection]));
    this.effDate.emit(dates);
  }
}
