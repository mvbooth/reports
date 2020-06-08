import {AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {FinanceReport} from '../../../classes/FinanceReport';
import {ReportControls} from '../../../classes/ReportControls';
import {Template} from '../../../classes/Template';
import {ReportService} from '../../../report-service';

@Component({
  selector: 'mvp-wndw-lbl-preview',
  templateUrl: './wndw-lbl-preview.component.html',
  styleUrls: ['./wndw-lbl-preview.component.scss'],
})

export class WndwLblPreviewComponent implements AfterViewInit, OnInit, OnDestroy {
  reportData: any = {};
  templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  changeWndwLblPreview: any;
  reportsArr: any = [];
  reportInfo = {group: 'Finance', name: 'Window Label Preview'};

  constructor(
    public _fr: FinanceReport,
    public _tp: Template,
    readonly _rc: ReportControls,
    private _reportService: ReportService,
    private route: ActivatedRoute,
  ) {

  }
  destroySubject$: Subject<void> = new Subject();

  ngAfterViewInit() {
    this._reportService.handleInit(this.route.snapshot.paramMap.get('templateName'), this.reportInfo);
    this._reportService.getTemplateData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      this.templateData = data;
      if (this.templateData && Object.keys(this.templateData).length > 0) {
        this._fr.templateLoading = true;
        // preprocess template values and load template
        this.handleLoadingTemplate();
        this._tp.loadTemplateValuesForForm(this.changeWndwLblPreview, this.preProcessTemplateData());
      } else {
        // for finance reprots, a template is getting returned no matter what (selected vehicle line) if empty continue
        this.handleLoadingTemplate();
      }
    });
    this._reportService.getReportData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      if (data) {
        this.reportData = data;
            // set initial form values
        this._fr.setInitialData(this.reportData.reportData);
      }
    });
  }

  ngOnInit() {
    this._reportService.updateShowSideBar(true);

    this.changeWndwLblPreview = new FormGroup({
      publishDate: this._fr.publishedDate,
      description: this._fr.reportDescription,
      marketingGroup: this._fr.marketGroup,
      modelYear: this._fr.modelYear,
      namePlate: this._fr.nameplate,
      bookCode: this._fr.bookCode,
      vehicleLine: this._fr.vehicleLine,
      mmcCode: this._fr.merchandiseModelCode,
      mmcCodeSP: this._fr.mmcCodeSP,
      publishId: this._fr.publishId,
      modelRestrictionString: this._fr.modelRestrictionString,
      status: this._fr.status,
    });

    this.changeWndwLblPreview.get('description')['controlType'] = { isMulti: false, isString: true };
    this.changeWndwLblPreview.get('status')['controlType'] = { isMulti: false, isString: true };
    this.changeWndwLblPreview.get('publishDate')['controlType'] = { isMulti: false, isString: true, emitEvent: false };
    this.changeWndwLblPreview.get('marketingGroup')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeWndwLblPreview.get('modelYear')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeWndwLblPreview.get('namePlate')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeWndwLblPreview.get('bookCode')['controlType'] = { isMulti: false, isString: false, emitEvent: false };
    this.changeWndwLblPreview.get('vehicleLine')['controlType'] = { isMulti: false, isString: false, isObject: true, emitEvent: false };
    this.changeWndwLblPreview.get('mmcCode')['controlType'] = { isMulti: true, isString: false, emitEvent: false };
    this.changeWndwLblPreview.get('mmcCodeSP')['controlType'] = { isMulti: false, isString: true, emitEvent: false };
    this.changeWndwLblPreview.get('modelRestrictionString')['controlType'] = { isMulti: false, isString: true, emitEvent: false };

    this.changeWndwLblPreview.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form: any) => {
        if (this._rc.isFormValid(this.changeWndwLblPreview)) {
          if (this._tp.templateControlLength === this._fr.countTemplateValuesSet) {
            this._fr.templateLoading = false;
          }
          let reportData = this._fr.processForm(form);
          reportData = this._rc.formatReportDates(reportData);

          if (reportData.mmcCode === undefined) {
              reportData.mmcCode = '0';
              reportData.mmcCodeSP = '0';
            }
          if (reportData.modelRestrictionString === undefined) {
              reportData.modelRestrictionString = '0';
            }

          delete reportData.fromDate;
          delete reportData.toDate;
          this._reportService.updateValidationStatus(reportData);
        } else {
          this._reportService.updateValidationStatus(false);
        }

    });

    this._fr.eTemplateControlLoaded
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(($event) => {
        if (this._rc.isFormValid(this.changeWndwLblPreview)) {
          this.changeWndwLblPreview.updateValueAndValidity({onlySelf: false, emitEvent: true});
        }
      });

    this.changeWndwLblPreview.get('publishDate').enable({emitEvent: false});

    this.changeWndwLblPreview.get('status').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this.getPublishId(form);
      });
    this.changeWndwLblPreview.get('publishDate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.publishDateFormated = this._fr.formatDateInput(this._fr.publishedDate.value);
        this.getPublishId(form);
      });
    this.changeWndwLblPreview.get('marketingGroup').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getModelYears(this._rc.isValidInput(form), this._fr.templateLoading);
      });
    this.changeWndwLblPreview.get('modelYear').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getNamePlates(this._rc.isValidInput(form), this._fr.templateLoading);
      });
    this.changeWndwLblPreview.get('namePlate').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getVehicleLine2(this._rc.isValidInput(form), this._fr.templateLoading);
      });
    this.changeWndwLblPreview.get('vehicleLine').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this._fr.getBookCodesByVehicleLineOffering(this._rc.isValidInput(form), this._fr.templateLoading);
        this._fr.getModelCode(this._rc.isValidInput(form), this._fr.templateLoading);
      });
    this.changeWndwLblPreview.get('bookCode').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this.getPublishId(form);
      });
    this.changeWndwLblPreview.get('mmcCode').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        this.changeWndwLblPreview.get('mmcCodeSP').setValue(this._fr.merchandiseModelCode.value, {emitEvent: false});
        this._fr.getRestrictionString(this._rc.isValidInput(form), this._fr.templateLoading);
      });
  }

  handleLoadingTemplate() {
    this.changeWndwLblPreview.get('status').enable({emitEvent: false});
    this.changeWndwLblPreview.get('publishDate').enable({emitEvent: false});
    this.changeWndwLblPreview.get('publishDate').setValue(new Date());
    this._fr.publishDateFormated = this._fr.formatDateInput(this.changeWndwLblPreview.get('publishDate').value);
    this._fr.getMarketGroups(true);
  }

  preProcessTemplateData(): any {
    const template = this.templateData;
    const templateKeys = Object.keys(template);

    // reformat publishDate for datepicker
    const pubDate = 'publishDate';
    if (templateKeys.indexOf(pubDate) !== -1) {
      template[pubDate] = this._fr.getDateFromString(template[pubDate]);
    }
    return template;
  }

  ngOnDestroy() {
    this._fr.resetFormGroups();
    this.eDestroyTemplate.emit();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._fr);
  }

  getPublishId(form: any) {
    if (this.changeWndwLblPreview.get('status').value === 'PUB') {
      this._fr.getPublishId(
        this._rc.isValidInput(form),
        this._fr.publishDateFormated,
        false,
        this.changeWndwLblPreview.get('bookCode').value,
        this.changeWndwLblPreview.get('vehicleLine').value);
    } else {
      this._fr.publishId.setValue('0', {emitEvent: false});
    }
  }
}
