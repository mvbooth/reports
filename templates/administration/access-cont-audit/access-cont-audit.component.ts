import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminReport } from '../../../classes/AdminReport';
import { ReportControls } from '../../../classes/ReportControls';
import { Template } from '../../../classes/Template';
import { ReportService } from '../../../report-service';

@Component({
  selector: 'mvp-access-cont-audit',
  templateUrl: './access-cont-audit.component.html',
  styleUrls: ['./access-cont-audit.component.scss'],
  providers: [AdminReport, ReportControls, Template],
})
export class AccessContAuditComponent implements AfterViewInit, OnInit, OnDestroy {
  reportData: any = {};
  templateData: any = {};
  @Output() eDestroyTemplate = new EventEmitter<boolean>();
  @Output() eFormUpdate = new EventEmitter<any>();
  accessContAudit: any;

  reportInfo = {group: 'Admin', name: 'Access Control Audit Report'};

  constructor(
    public _ar: AdminReport, 
    public _tp: Template, 
    private _rc: ReportControls,
    private _reportService: ReportService,
    private route: ActivatedRoute) { }
  destroySubject$: Subject<void> = new Subject();

  ngOnInit() {

    this._reportService.updateShowSideBar(true);

    this.accessContAudit = new FormGroup({
      description: this._ar.reportDescription,
      user: this._ar.user,
      geographicMarket: this._ar.geographicMarket,
      marketingCluster: this._ar.marketingCluster,
      marketingNSC: this._ar.marketingNSC,
      isLongReport: this._ar.isLongReport,
    });

    this.accessContAudit.get('description')['controlType'] = { isMulti: false, isString: true };
    this.accessContAudit.get('user')['controlType'] = { isMulti: false, isString: true };
    this.accessContAudit.get('geographicMarket')['controlType'] = { isMulti: false, isString: true };
    this.accessContAudit.get('marketingCluster')['controlType'] = { isMulti: false, isString: true };
    this.accessContAudit.get('marketingNSC')['controlType'] = { isMulti: false, isString: true };

    this._ar.reportName.setValue('Access Control Audit', {emitEvent: false});
    this.accessContAudit.get('user').enable({emitEvent: false});
    this.accessContAudit.get('user').setValue('Current', {emitEvent: false});

    this.accessContAudit.get('isLongReport').setValue(true);
    this.accessContAudit.get('isLongReport').enable({ emitEvent: false });

    this.accessContAudit.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((form) => {
        if (this._rc.isFormValid(this.accessContAudit)) {
          const reportData = this._ar.processForm(form);
          this._reportService.updateValidationStatus(reportData);
        } else {
          this._reportService.updateValidationStatus(false);
        }
    });
  }
  preProcessTemplateData() {
    const template = this.templateData;
    const templateKeys = Object.keys(template);

    // change user value from array to string
    const user = 'user';
    if (templateKeys.indexOf(user) !== -1) {
      template[user] = template[user][0];
    }
    return template;
  }

  ngAfterViewInit() {
    this._reportService.handleInit(this.route.snapshot.paramMap.get('templateName'), this.reportInfo);
    this._reportService.getTemplateData().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      this.templateData = data;
      if (this.templateData && Object.keys(this.templateData).length > 0) {
        this._tp.loadTemplateValuesForForm(this.accessContAudit, this.preProcessTemplateData());
      } 
    });
  }

  ngOnDestroy() {
    this.eDestroyTemplate.emit();
    this.destroySubject$.next();
    this._rc.cleanReportClass(this._ar);
  }

}
