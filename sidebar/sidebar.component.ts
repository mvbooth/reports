import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ScheduleReportComponent } from '../modals/schedule-report/schedule-report.component';
import { ReportService } from '../report-service';

@Component({
  selector: 'mvp-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @Output() eReportAction = new EventEmitter<any>();
  showingReport: boolean;
  showingReportTemplate: boolean;
  isForUpdatePrompts: boolean;
  showingSchedules: boolean;
  reportValid = false;
  reportFetchData: any;

  constructor(
    private _dialog: MatDialog,
    private _reportService: ReportService) { }

  ngOnInit() {
  }

  openScheduleModal() {
    this.triggerReportAction(3);
    this._dialog.open(ScheduleReportComponent, {
      data: {
        reportData: this.reportFetchData,
      },
      width: '70vw',
    });
  }

  triggerReportAction(actionId: number) {
    this.eReportAction.emit(actionId);
  }

}
