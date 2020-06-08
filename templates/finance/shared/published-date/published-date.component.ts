import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataReportsService } from '../../../../../data/data-reports.service';
import { NotificationService } from '../../../../../shared/notification.service';

@Component({
  selector: 'mvp-published-date',
  templateUrl: './published-date.component.html',
  styleUrls: ['./published-date.component.scss'],
})
export class PublishedDateComponent implements OnInit, OnDestroy {

  readonly BY_PUBLISHED_DATE: string = 'PUB';
  readonly DATE_STRING_FORMAT: string = 'YYYY-MM-DD';
  private _required = false;
  private _status: string;
  private _vehicleLine: number;
  private _publishDate: string;
  private selectedOpt: any;
  public readyToDisplay = false;
  public pubDateOptions: any[];
  public selectedOption: any;
  destroySubject$: Subject<void> = new Subject();

  @Input()
  set required(requireFormInput: boolean) {
    this._required = requireFormInput;
  }
  get required() { return this._required && this.BY_PUBLISHED_DATE === this._status; }

  @Input()
  set status(newStatus: string) {
    this._status = newStatus;
    if (newStatus === this.BY_PUBLISHED_DATE) {
      this.getPublishedDates(this._vehicleLine);
    } else {
      this.reset();
      this.change.emit({ value: new Date(), id: this._publishDate });
    }
  }
  get status() { return this._status; }

  @Input()
  set vehicleLine(newVehicleLine) {
    this._vehicleLine = newVehicleLine;
    this.getPublishedDates(newVehicleLine);
  }

  @Input()
  set selectedOpts(opt) {
    this.selectedOpt = opt;
  }

  @Output()
  change: EventEmitter<any> = new EventEmitter();

  constructor(private _dataLayer: DataReportsService, public _notifyService: NotificationService) { }

  ngOnInit() {
  }

  ngOnDestroy() {

    this.destroySubject$.next();
  }

  reset() {
    this.readyToDisplay = false;
    this.pubDateOptions = new Array<any>();
    this._publishDate = '0';
    this.change.emit({ value: new Date().toDateString(), id: this._publishDate });
  }
  getPublishedDates(vehicleLine: number) {
    if (vehicleLine > 0 && this._status === this.BY_PUBLISHED_DATE) {
      
      this._dataLayer.readCompareReportPreviousDate(vehicleLine)
        .pipe(takeUntil(this.destroySubject$))
        .subscribe((publishDates: any) => {
          if (publishDates.length > 0) {
            this.pubDateOptions = publishDates;
            this.readyToDisplay = true;
            if (this.selectedOpt) {
              const selectedPubDate = this.pubDateOptions.find((pubOt) => pubOt.value.toString() === this.selectedOpt.toString());
              if (selectedPubDate) {
                this.selectedOption = selectedPubDate.value;
              }
            }
          } else {
            this.readyToDisplay = this.pubDateOptions && this.pubDateOptions.length > 0;
            this._notifyService.notify('error', 'No published dates', 'There are no published dates for the chosen vehicle line.');
          }
        });
    }
  }
  selection() {

    let str = '';
    if (this.selectedOption && this._status === this.BY_PUBLISHED_DATE) {
      this.pubDateOptions.forEach((option: any) => {
        if (option.value === this.selectedOption) {
          const date = this.getDateFromBlockPoint(option.label);
          str = date;
        }
      });
      const result = {
        value: str,
        id: this.selectedOption,
      };
      this.change.emit(result);
    } 
  }
  getDateFromBlockPoint(blockPointDate: string): string {
    let result = new Date().toDateString();
    const resultArr = blockPointDate.split(' ');
    resultArr.forEach((str) => {
      const date = moment(str).format(this.DATE_STRING_FORMAT);
      if (str.length > 8) {
        result = date;
      }
    });
    return result;
  }
}
