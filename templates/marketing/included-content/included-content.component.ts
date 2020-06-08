import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Marketing } from '../../../classes/Marketing';
import { ReportControls } from '../../../classes/ReportControls';
import { Template } from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-included-content',
  templateUrl: './included-content.component.html',
  styleUrls: ['./included-content.component.scss'],
  providers: [Marketing, Template],
})

export class IncludedContentComponent implements OnInit, OnDestroy, AfterViewInit {
  reportData: any = {};
  @Input() userPrefs: any = {};
  templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  includedContentRpt: any;
  // loading template values flag
  loadingTemplate: boolean;
  reportInfo = {group: 'Marketing', name: 'Included Content Report'};

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
        const groupBy = this.templateData['groupBy'];
        if (groupBy) {
          this.includedContentRpt.get('groupBy').setValue(groupBy.toString());
        }
        // preprocess template values and load template
        this._tp.loadTemplateValuesForForm(this.includedContentRpt, this.templateData);
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

    this._mkt.modelYear.enable({ emitEvent: false });
    this.includedContentRpt = new FormGroup({
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
      groupBy:  new FormControl({ value: '', disabled: false }),
    });

    this.includedContentRpt.get('description')['controlType'] = { isMulti: false, isString: true, emitEvent: true };
    this.includedContentRpt.get('modelYear')['controlType'] = { isMulti: false, isString: false };
    this.includedContentRpt.get('marketingGroup')['controlType'] = { isMulti: false, isString: false };
    this.includedContentRpt.get('geographicMarket')['controlType'] = { isMulti: false, isString: true };
    this.includedContentRpt.get('namePlate')['controlType'] = { isMulti: false, isString: true };
    this.includedContentRpt.get('vehicleLine')['controlType'] = { isMulti: false, isString: true };
    this.includedContentRpt.get('effectiveDate')['controlType'] = { isMulti: false, isString: false, emitEvent: true };
    this.includedContentRpt.get('marketOfferStatus')['controlType'] = { isMulti: false, isString: false, emitEvent: true };
    this.includedContentRpt.get('optionDescriptionType')['controlType'] = { isMulti: false, isString: false, emitEvent: true };
    this.includedContentRpt.get('optionLanguage')['controlType'] = { isMulti: false, isString: false, emitEvent: true };
    this.includedContentRpt.get('groupBy')['controlType'] = { isMulti: false, isString: false};

    this.includedContentRpt.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (form) => {
          if (this._rc.isFormValid(this.includedContentRpt)) {
            this._mkt.templateLoading = false;
            const reportData = this._mkt.processForm(form, true);
            // split effective date value into necessary fields
            reportData.rmoParam = 'NA';
            reportData.marketingCluster = '-1';
            reportData.lmoParam = 'NA';
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
        if (this.includedContentRpt.valid) {
          this.includedContentRpt.updateValueAndValidity({ onlySelf: false, emitEvent: true });
        }
      });

    this.includedContentRpt.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.getAuthorizedMarketGroupListHierarchy(this._rc.isValidInput(val), this.loadingTemplate);
        },
    );

    this.includedContentRpt.get('marketingGroup').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          this._mkt.getNameplateData(this._rc.isValidInput(val), this.loadingTemplate);
          this._mkt.getMarketData(this._rc.isValidInput(val), this.loadingTemplate);
        },
    );

    this.includedContentRpt.get('geographicMarket').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          if (this.includedContentRpt.get('namePlate').value && this.includedContentRpt.get('namePlate').value !== '') {
            this._mkt.getAuthorizedVehicleLineListForReports(this._rc.isValidInput(val), this.loadingTemplate);
          }
        },
    );

    this.includedContentRpt.get('namePlate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          if (this.includedContentRpt.get('geographicMarket').value !== '') {
            this._mkt.getAuthorizedVehicleLineListForReports(this._rc.isValidInput(val), this.loadingTemplate);
          }
        },
    );

    this.includedContentRpt.get('vehicleLine').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          if (!this._mkt.templateLoading) {
            this._mkt.effectiveDate.reset({ value: '', disabled: true }, { emitEvent: false });
          }
          if (val && this._mkt.vehicleLineArray) {
            const value = this._mkt.vehicleLineArray.find((x) => x.value.toString() === val.toString());
            if (value) {
              this.includedContentRpt.get('groupBy').setValue(value.vehicleType);
            }
          }
          this._mkt.getMarketOfferStatusList(
            this._rc.isValidInput(val),
            this.loadingTemplate,
            this.includedContentRpt.get('marketOfferStatus')['controlType'].isMulti);
          this._mkt.getDescriptionType(this._rc.isValidInput(val));
          this._mkt.getLanguages(this._rc.isValidInput(val), this.loadingTemplate);
        },
    );

    this.includedContentRpt.get('marketOfferStatus').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (val) => {
          if (this.includedContentRpt.get('geographicMarket').value && this.includedContentRpt.get('geographicMarket').value !== '') {
            this._mkt.loadBlockPointList(this._rc.isValidInput(val), val, this.loadingTemplate, false);
          }
        },
    );
  }

  ngOnDestroy() {
    this.eDestroyTemplate.emit();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._mkt);
  }
}
