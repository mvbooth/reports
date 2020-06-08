import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import { Marketing } from '../../../classes/Marketing';
import { ReportControls } from '../../../classes/ReportControls';
import {Template} from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-mdl-yr-change-gmna',
  templateUrl: './mdl-yr-change-gmna.component.html',
  styleUrls: ['./mdl-yr-change-gmna.component.scss'],
  providers: [Marketing, Template],
})

export class MdlYrChangeGmnaComponent implements OnInit, OnDestroy, AfterViewInit {
  reportData: any = {};
  @Input() userPrefs: any = {};
  templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  mdlYrChangeGmnaRpt: any;
  // loading template values flag
  loadingTemplate: boolean;
  reportInfo = {group: 'Marketing', name: 'Model Year Change Report GMNA'};

  constructor(
    public _mkt: Marketing, 
    public _tp: Template,
    private _rc: ReportControls,
    private _reportService: ReportService,
    private route: ActivatedRoute) {}

  destroySubject$: Subject<void> = new Subject();

  ngAfterViewInit() {
    this._reportService.handleInit(this.route.snapshot.paramMap.get('templateName'), this.reportInfo);
    this._reportService.getTemplateData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      this.templateData = data;
      if (this.templateData && Object.keys(this.templateData).length > 0) {
        this._mkt.templateLoading = true;
        // preprocess template values and load template
        this._tp.loadTemplateValuesForForm(this.mdlYrChangeGmnaRpt, this.templateData);
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

    this.mdlYrChangeGmnaRpt = new FormGroup({
      description: this._mkt.reportDescription,
      modelYear: this._mkt.modelYear,
      marketingGroup: this._mkt.marketGroup,
      namePlate: this._mkt.nameplate,
      geographicMarket: this._mkt.geographicMarket,
      vehicleLine: this._mkt.vehicleLine,
      effectiveDate: this._mkt.effectiveDate,
      optionDescriptionType: this._mkt.descriptionType,
      optionLanguage: this._mkt.language,
      previousEffectiveDate: this._mkt.previousEffectiveDate,
    });

    this.mdlYrChangeGmnaRpt.get('description')['controlType'] = { isMulti: false, isString: true };
    this.mdlYrChangeGmnaRpt.get('modelYear')['controlType'] = { isMulti: false, isString: false };
    this.mdlYrChangeGmnaRpt.get('marketingGroup')['controlType'] = { isMulti: false, isString: false };
    this.mdlYrChangeGmnaRpt.get('namePlate')['controlType'] = { isMulti: false, isString: true };
    this.mdlYrChangeGmnaRpt.get('geographicMarket')['controlType'] = { isMulti: false, isString: true };
    this.mdlYrChangeGmnaRpt.get('vehicleLine')['controlType'] = { isMulti: false, isString: true };
    this.mdlYrChangeGmnaRpt.get('effectiveDate')['controlType'] = { isMulti: false, isString: false };
    this.mdlYrChangeGmnaRpt.get('optionDescriptionType')['controlType'] = { isMulti: false, isString: false };
    this.mdlYrChangeGmnaRpt.get('optionLanguage')['controlType'] = { isMulti: false, isString: false };
    this.mdlYrChangeGmnaRpt.get('previousEffectiveDate')['controlType'] = { isMulti: false, isString: false };

    this.mdlYrChangeGmnaRpt.get('modelYear').enable({emitEvent: false});
    this.mdlYrChangeGmnaRpt.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (form) => {
        if (this._rc.isFormValid(this.mdlYrChangeGmnaRpt)) {
          const reportData = this._mkt.processForm(form);

          reportData.folderName = 'Marketing';
          reportData.reportName = 'Model Year Change Report GMNA';
          reportData.marketingCluster = '-1';
          reportData.REG = 'GMNA';
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
        if (this.mdlYrChangeGmnaRpt.valid) {
          this.mdlYrChangeGmnaRpt.updateValueAndValidity({onlySelf: false, emitEvent: true});
        }
      });

    this.mdlYrChangeGmnaRpt.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        this._mkt.getAuthorizedMarketGroupList(this._rc.isValidInput(val), this.loadingTemplate);
      },
    );

    this.mdlYrChangeGmnaRpt.get('marketingGroup').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        this._mkt.getNameplateData(this._rc.isValidInput(val), this.loadingTemplate);
        this._mkt.getMarketData(this._rc.isValidInput(val), this.loadingTemplate);
      },
    );

    this.mdlYrChangeGmnaRpt.get('namePlate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        this._mkt.getAuthorizedVehicleLineWithModelNameListForReports(this._rc.isValidInput(val), this.loadingTemplate);
      },
    );

    this.mdlYrChangeGmnaRpt.get('vehicleLine').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
      (val) => {
        this._mkt.getBlockPointForModelYearChangeGMNA(this._rc.isValidInput(val), this.loadingTemplate);
        this._mkt.getPreviousBlockPointList(this._rc.isValidInput(val), this.loadingTemplate);
        this._mkt.getDescriptionType(this._rc.isValidInput(val));
        this._mkt.getLanguages(this._rc.isValidInput(val), this.loadingTemplate);

        if (this.userPrefs) {
          this.mdlYrChangeGmnaRpt.get('optionDescriptionType').setValue(this.userPrefs.marketOfferDescTypeId);
          this.mdlYrChangeGmnaRpt.get('optionLanguage').setValue(this.userPrefs.marketOfferLangId);
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
