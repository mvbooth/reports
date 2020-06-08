import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Marketing } from '../../../classes/Marketing';
import { ReportControls } from '../../../classes/ReportControls';
import { Template } from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-mo-packaging',
  templateUrl: './mo-packaging.component.html',
  styleUrls: ['./mo-packaging.component.scss'],
  providers: [Marketing, Template],
})

export class MoPackagingComponent implements OnInit, OnDestroy, AfterViewInit {
  reportData: any = {};
  @Input() userPrefs: any = {};
  templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  MoPkgRpt: any;
  // loading template values flag
  loadingTemplate: boolean;
  reportInfo = {group: 'Marketing', name: 'Market Offer Packaging Report'};

  constructor(
    public _mkt: Marketing, 
    public _tp: Template, 
    private _rc: ReportControls,
    private _reportService: ReportService,
    private route: ActivatedRoute) { }

  destroySubject$: Subject<void> = new Subject();

  ngAfterViewInit() {
    this._reportService.handleInit(this.route.snapshot.paramMap.get('templateName'), this.reportInfo);
    this._reportService.getTemplateData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      this.templateData = data;
      if (this.templateData && Object.keys(this.templateData).length > 0) {
        this._mkt.templateLoading = true;
        this.loadingTemplate = true;
        // preprocess template values and load template
        this._tp.loadTemplateValuesForForm(this.MoPkgRpt, this.templateData);
        this.processTemplate();
      }
    });
    this._reportService.getReportData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      if (data) {
        this.reportData = data;
            // set initial form values
        this._mkt.setInitialData(this.reportData.reportData, this.reportData.userPrefs);
      }
    });
  }
  ngOnInit() {

    this._reportService.updateShowSideBar(true);

    this.MoPkgRpt = new FormGroup({
      description: this._mkt.reportDescription,
      modelYear: this._mkt.modelYear,
      marketingGroup: this._mkt.marketGroup,
      geographicMarket: this._mkt.geographicMarket,
      namePlate: this._mkt.nameplate,
      vehicleLine: this._mkt.vehicleLine,
      effectiveDate: this._mkt.effectiveDate,
      marketOfferStatus: this._mkt.marketOfferStatus,
      optionDescriptionType: this._mkt.descriptionType,
      optionLanguage: this._mkt.language,
      element: this._mkt.groupBy,
      groupFlag: this._mkt.groupFlag,
    });

    this.MoPkgRpt.get('description')['controlType'] = { isMulti: false, isString: true };
    this.MoPkgRpt.get('modelYear')['controlType'] = { isMulti: false, isString: false };
    this.MoPkgRpt.get('marketingGroup')['controlType'] = { isMulti: false, isString: false };
    this.MoPkgRpt.get('geographicMarket')['controlType'] = { isMulti: false, isString: true };
    this.MoPkgRpt.get('namePlate')['controlType'] = { isMulti: false, isString: true };
    this.MoPkgRpt.get('vehicleLine')['controlType'] = { isMulti: false, isString: true };
    this.MoPkgRpt.get('effectiveDate')['controlType'] = { isMulti: false, isString: false };
    this.MoPkgRpt.get('marketOfferStatus')['controlType'] = { isMulti: false, isString: false };
    this.MoPkgRpt.get('optionDescriptionType')['controlType'] = { isMulti: false, isString: false };
    this.MoPkgRpt.get('optionLanguage')['controlType'] = { isMulti: false, isString: false };
    this.MoPkgRpt.get('element')['controlType'] = { isMulti: false, isString: true };
    this.MoPkgRpt.get('groupFlag')['controlType'] = { isMulti: false, isString: false };

    this.MoPkgRpt.get('modelYear').enable({ emitEvent: false });
    this.MoPkgRpt.get('element').setValidators(null);
    this.MoPkgRpt.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (form) => {
          if (this._rc.isFormValid(this.MoPkgRpt)) {
            const reportData = this._mkt.processForm(form, true);

            reportData.marketingCluster = '-1';
            reportData.lmoParam = 'NA';
            reportData.rmoParam = 'NA';
            reportData.cmoParam = 'N';
            reportData.marketingNSC = '-1';

            this._reportService.updateValidationStatus(reportData);
          } else {
            this._reportService.updateValidationStatus(false);
          }
        },
    );

    this._mkt.eTemplateControlLoaded
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(($event) => {
        if (this.MoPkgRpt.valid) {
          this.MoPkgRpt.updateValueAndValidity({ onlySelf: false, emitEvent: true });
        }
      });

    this.MoPkgRpt.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.getAuthorizedMarketGroupListHierarchy(this._rc.isValidInput(val), this.loadingTemplate);
        },
    );

    this.MoPkgRpt.get('marketingGroup').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.getNameplateData(this._rc.isValidInput(val), this.loadingTemplate);
          this._mkt.getMarketData(this._rc.isValidInput(val), this.loadingTemplate);
        },
    );

    this.MoPkgRpt.get('geographicMarket').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          if (this.MoPkgRpt.get('namePlate').value && this.MoPkgRpt.get('namePlate').value !== '') {
            this.doAfterMarketAndNameplate(val);
          }
        },
    );

    this.MoPkgRpt.get('namePlate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          if (this.MoPkgRpt.get('geographicMarket').value !== '') {
            this.doAfterMarketAndNameplate(val);
          }
        },
    );

    this.MoPkgRpt.get('vehicleLine').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          if (!this._mkt.templateLoading) {
            this._mkt.effectiveDate.reset({ value: '', disabled: true }, { emitEvent: false });
          }

          this._mkt.getMarketOfferStatusList(
            this._rc.isValidInput(val),
            this.loadingTemplate,
            this.MoPkgRpt.get('marketOfferStatus')['controlType'].isMulti);

          if (val) {
            // Vehicle Type C or T (car or truck) yields different results
            this._mkt.loadGroupBy(val.vehicleType === 'C', this.loadingTemplate);
          }

          this.MoPkgRpt.get('marketOfferStatus').valueChanges
            .pipe(takeUntil(this.destroySubject$))
            .subscribe(
              (val1) => {
                this._mkt.loadBlockPointList(this._rc.isValidInput(val1), val1, this.loadingTemplate, false);
              },
          );

          // Must come after group by because it depends on group by entry count
          // this._mkt.getGroupByMOPkgRpt(this._rc.isValidInput(val));
          this._mkt.getGroupFlag(this._rc.isValidInput(val));
        },
    );

    this.MoPkgRpt.get('groupFlag').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          if ((val) && (this._mkt.groupByArray) && (this._mkt.groupByArray.length > 0)) {
            this.MoPkgRpt.get('element').enable();
            this.MoPkgRpt.get('element').setValidators([Validators.required]);
          } else {
            this.MoPkgRpt.get('element').setValidators(null);
            this.MoPkgRpt.get('element').disable();
            this.MoPkgRpt.get('element').reset();
          }
          this._mkt.getGroupByMOPkgRpt(this._rc.isValidInput(val));
        },
    );
  }

  // Process template data and set field values on a field by field basis.
  processTemplate() {
    
    if (this.templateData.groupFlag && this.templateData.groupFlag[0] === 'Y') {
      this.MoPkgRpt.get('groupFlag').setValue(true);
      this.MoPkgRpt.get('element').setValue(this.templateData.element[0]);
    } else {
      this.MoPkgRpt.get('groupFlag').setValue(false);
    }
  }

  // load vehicle line, language, and description once market and nameplate have both been selected
  doAfterMarketAndNameplate(val) {
    this._mkt.getAuthorizedVehicleLineObjectListForReports(this._rc.isValidInput(val), this.loadingTemplate);
    this._mkt.getLanguages(this._rc.isValidInput(val), this.loadingTemplate);
    this._mkt.getDescriptionType(this._rc.isValidInput(val));
  }

  ngOnDestroy() {
    this.eDestroyTemplate.emit();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._mkt);
  }
}
