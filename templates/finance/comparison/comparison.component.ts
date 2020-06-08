import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {NotificationService} from '../../../../shared/notification.service';
import { FinanceReport } from '../../../classes/FinanceReport';
import { ReportControls } from '../../../classes/ReportControls';
import { Template } from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-comparison',
  templateUrl: './comparison.component.html',
  styleUrls: ['./comparison.component.scss'],
  providers: [FinanceReport, Template],
})

export class ComparisonComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() reportData: any = {};
  @Input() templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  @Output() eFormUpdate = new EventEmitter<any>();
  changeComparison: FormGroup;
  reportsArr: any = [];
  // holds latest valid value of model years
  currentModelYears: any = [];
  reportInfo = {group: 'Finance', name: 'Comparison Report'};

  isvalid = true;

  constructor(
    public _fr: FinanceReport, 
    public _tp: Template, 
    private _rc: ReportControls, 
    private  _notifyService: NotificationService,
    private _reportService: ReportService,
    private route: ActivatedRoute) {
  }
  destroySubject$: Subject<void> = new Subject();

  ngAfterViewInit() {
    this._reportService.handleInit(this.route.snapshot.paramMap.get('templateName'), this.reportInfo);
    this._reportService.getTemplateData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      this.templateData = data;
      if (this.templateData && Object.keys(this.templateData).length > 0) {
        this._fr.templateLoading = true;
        // preprocess template values and load template
        this._fr.getMarketGroups(true);
        this._tp.loadTemplateValuesForForm(this.changeComparison, this.templateData);
      } else {
        // for finance reprots, a template is getting returned no matter what (selected vehicle line) if empty continue
        this._fr.getMarketGroups(true);
      }
    });
  }

  ngOnInit() {

    this._reportService.updateShowSideBar(true);
    this.changeComparison = new FormGroup({
      description: this._fr.reportDescription,
      marketingGroup: this._fr.marketGroup,
      modelYear: this._fr.modelYear,
      namePlate: this._fr.nameplate,
      bookCode: this._fr.bookCode,
      vehicleLine: this._fr.vehicleLine,
      toPublishId: this._fr.RecentDatesCmpr,
      fromPublishId: this._fr.CompareReportPreviousDate,
      comparisionReportType: this._fr.ComparisonTypes,
      compareColumns: this._fr.TypeFieldName,
    });

    this.changeComparison.get('description')['controlType'] = { isMulti: false, isString: true };
    this.changeComparison.get('marketingGroup')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeComparison.get('modelYear')['controlType'] = { isMulti: true, isString: false, emitEvent: false };
    this.changeComparison.get('namePlate')['controlType'] = { isMulti: false, isString: true, emitEvent: false };
    this.changeComparison.get('bookCode')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeComparison.get('vehicleLine')['controlType'] = { isMulti: false, isString: true, emitEvent: false };
    this.changeComparison.get('toPublishId')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeComparison.get('fromPublishId')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeComparison.get('comparisionReportType')['controlType'] = { isMulti: false, isString: true };
    this.changeComparison.get('compareColumns')['controlType'] = { isMulti: true, isString: true };

    this.changeComparison.valueChanges
    .pipe(takeUntil(this.destroySubject$))
    .subscribe((form) => {
      if (form.toPublishId && form.fromPublishId) {
        if (form.toPublishId <= form.fromPublishId) {
          this._notifyService.notify('error', 'Error', 'Previous Published Date must be prior to Most Recent Published Date');
          this.isvalid = false;
        } else {
          this.isvalid = true;
        }
      }
      if (this._rc.isFormValid(this.changeComparison)) {
        if (this._tp.templateControlLength === this._fr.countTemplateValuesSet) {
          this._fr.templateLoading = false;
        }
        const reportData = this._fr.processForm(form);

        if (this.isvalid === true) {
          this._reportService.updateValidationStatus(reportData);
        } else {
          this._reportService.updateValidationStatus(false);
        }
      } else {
        this._reportService.updateValidationStatus(false);
      }
    });

    this._fr.eTemplateControlLoaded
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(($event) => {
        if (this._rc.isFormValid(this.changeComparison)) {
          this.changeComparison.updateValueAndValidity({ onlySelf: false, emitEvent: true });
        }
      });

    this._fr.setInitialData(this.reportData);

    this.changeComparison.get('marketingGroup').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getModelYears(this._rc.isValidInput(form));
      });

    this.changeComparison.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        if (this.isModelYearSelectionValid(form)) {
          this._fr.namePlateArray = [];
          this._fr.getNamePlatesCmprReport(this._rc.isValidInput(form));
          this._fr.readComparisonTypes(this._rc.isValidInput(form));
        }
      });

    this.changeComparison.get('namePlate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getVehicleLinesCmprReport(this._rc.isValidInput(form));
      });

    this.changeComparison.get('vehicleLine').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.readBookCodesCmprReport(this._rc.isValidInput(form));
        this._fr.readCompareReportPreviousDate(this._rc.isValidInput(form));
        this._fr.readRecentDatesCmprReport(this._rc.isValidInput(form));
      });

    this.changeComparison.get('comparisionReportType').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
          this._fr.reportTypeFieldName(this._rc.isValidInput(form));
      });
  }

  // show error if user selects more than 2 model years or model year selections aren't sequential
  isModelYearSelectionValid(years): boolean {
    if (years) {
      if (years.length > 2 || ( years.length === 2 && ( years[0] !== years[1] - 1 && years[0] !== years[1] + 1 ))) {
        this._notifyService
          .notify('info', 'Info', 'Selecting more than two model years or non-sequential model years is invalid.');
        this.changeComparison.get('modelYear').setValue(this.currentModelYears, {emitEvent: false});
        return false;
      }
    }
    this.currentModelYears = years;
    return true;
  }

  ngOnDestroy() {
    this.eDestroyTemplate.emit();
    this._fr.resetFormGroups();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._fr);
  }
}
