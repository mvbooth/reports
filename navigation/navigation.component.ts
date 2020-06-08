import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSelect } from '@angular/material';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { ReportService } from '../report-service';

@Component({
  selector: 'mvp-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {

  @ViewChildren('ms') matSelect: QueryList<any>;

  reportsArr: any = [];
  selectedReportInfo: any;
  selectedReportId: string;
  selectedReportGroup: string;
  clickedMyReport: number;
  selectedReport: any;
  destroySubject$: Subject<void> = new Subject();

  reportSelects = new FormGroup({
    marketing: new FormControl(),
    finance: new FormControl(),
    orderfulfillment: new FormControl(),
    admin: new FormControl(),
  });

  constructor(
    private readonly router: Router,
    private readonly _reportService: ReportService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this._reportService.getReportInfo().pipe(takeUntil(this.destroySubject$)).subscribe((data) => {
      if (data) {
        this.selectedReportInfo = data;
      }
      if (this.reportsArr && this.reportsArr.length > 0) {
        this.assignDropDownValue();
      }
    });
  }

  setReportsArr(arr) {
    this.reportsArr = arr;
    this.assignDropDownValue();
  }

  assignDropDownValue() {
    if (this.selectedReportInfo && this.selectedReportInfo.name) {
      const val = this.getReportSelectionValue();
      if (val) {
        this.reportSelects.get(this.formatFormName(this.selectedReportInfo.group)).setValue(val);
        this.cdr.detectChanges();
      }
    }
  }

  getReportSelectionValue() {
    const reportGroup =
      this.reportsArr.find((x) => x.folderName === this.selectedReportInfo.group);
    const report = reportGroup.reports.find(
      (y) => y.reportName === this.selectedReportInfo.name);
    if (report) {
      return this.selectedReportInfo.group + '-' + report.id;
    } else {
      return null;
    }

  }

  reportSelect($event: any) {
    const valueArr = $event.value.split('-');
    const selectControl = $event.source.ngControl.name;
    this.resetSelects(this.reportSelects.get(selectControl));
    this.selectedReportId = valueArr[1];
    this.selectedReportGroup = valueArr[0];
    const folder = this.reportsArr.filter((holdFolder) => holdFolder.folderName === valueArr[0])[0];
    if (folder) {
      const report = folder.reports.find((rep) => rep.id === this.selectedReportId);
      if (report) {
        this._reportService.loadTemplateFromSchedule = false;
        this._reportService.showingReportTemplate = false;
        this.router.navigateByUrl(`report/${report.reportName.replace(/ /g, '-').toLowerCase()}`);
      }
    }
  }

  loadMyReportSection(sectionName) {
    this.resetSelects();
    this.selectedReportId = '';
    this.selectedReportGroup = '';
    this._reportService.updateShowSideBar(false);
    this.router.navigate([`report/${sectionName}`]);
  }

  selectReportForTemplate(folderName: string, reportName: string) {
    const name = this.formatFormName(folderName);
    this.reportSelects.get(name).setValue(reportName);
    // get id from folder and report name
    const folder = this.reportsArr.filter((holdFolder) => holdFolder.folderName === folderName)[0];
    folder.reports.find(
      (report) => {
        if (report.reportName === reportName) {
          this.selectedReportId = report.id;
        }
      });
    this.selectedReportGroup = folderName;
  }

  formatFormName(name: string) {
    return name.replace(/\s+/g, '').toLowerCase();
  }

  resetSelects(select: any = null) {
    Object.keys(this.reportSelects.controls).forEach(
      (key) => {
        const holdFC = this.reportSelects.get(key);
        if (select) {
          if (select !== holdFC) {
            holdFC.setValue(undefined);
          }
        } else {
          holdFC.setValue(undefined);
        }
      },
    );
  }
}
