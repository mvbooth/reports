import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import { FinanceReport } from '../../../classes/FinanceReport';
import {ReportControls} from '../../../classes/ReportControls';
import {Template} from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-rollover-log',
  templateUrl: './rollover-log.component.html',
  styleUrls: ['./rollover-log.component.scss'],
  providers: [FinanceReport],
})

export class RolloverLogComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() reportData: any = {};
  @Input() templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  @Output() eFormUpdate = new EventEmitter<any>();
  changeRollover: FormGroup;
  reportsArr: any = [];
  // loading template values flag
  // loadingTemplate: boolean;
  reportInfo = {group: 'Finance', name: 'Rollover Log'};

  constructor(
    public _fr: FinanceReport, 
    public _tp: Template, 
    private _rc: ReportControls,
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
        this._tp.loadTemplateValuesForForm(this.changeRollover, this.templateData);
      } else {
        // for finance reprots, a template is getting returned no matter what (selected vehicle line) if empty continue
        this._fr.getMarketGroups(true);
      }
    });
  }

  ngOnInit() {
    this._reportService.updateShowSideBar(true);

    this.changeRollover = new FormGroup({
      description: this._fr.reportDescription,
      marketingGroup: this._fr.marketGroup,
      modelYear: this._fr.modelYear,
      namePlate: this._fr.nameplate,
      bookCode: this._fr.bookCode,
      vehicleLine: this._fr.vehicleLine,
    });

    this.changeRollover.get('description')['controlType'] = { isMulti: false, isString: true };
    this.changeRollover.get('marketingGroup')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeRollover.get('modelYear')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeRollover.get('namePlate')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeRollover.get('bookCode')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeRollover.get('vehicleLine')['controlType'] = { isMulti: false, isString: false, isObject: true, emitEvent: false };

    this.changeRollover.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
      if (this._rc.isFormValid(this.changeRollover)) {
        this._fr.templateLoading = false;
        const reportData = this._fr.processForm(form);
        this._reportService.updateValidationStatus(reportData);
      } else {
        this._reportService.updateValidationStatus(false);
      }
    });

    this._fr.eTemplateControlLoaded
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(($event) => {
        if (this._rc.isFormValid(this.changeRollover)) {
          this.changeRollover.updateValueAndValidity({onlySelf: false, emitEvent: true});
        }
      });

    this._fr.setInitialData(this.reportData);

    this.changeRollover.get('marketingGroup').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
      this._fr.getModelYears(this._rc.isValidInput(form), this._fr.templateLoading);
    });

    this.changeRollover.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
      this._fr.getNamePlates(this._rc.isValidInput(form), this._fr.templateLoading);
    });

    this.changeRollover.get('namePlate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getVehicleLine2(this._rc.isValidInput(form), this._fr.templateLoading);
    });

    this.changeRollover.get('vehicleLine').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getBookCodesByVehicleLineOffering(this._rc.isValidInput(form), this._fr.templateLoading);
    });

  }

  ngOnDestroy() {
    this.eDestroyTemplate.emit();
    this._fr.resetFormGroups();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._fr);
  }
}
