// tslint:disable:ordered-imports
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressBarModule, MatTableDataSource, MatTableModule } from '@angular/material';
import { SharedModule } from '../shared/shared.module';
import { NavigationComponent } from './navigation/navigation.component';
import { ReportComponent } from './report.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { SliderModule } from 'primeng/slider';
import { DropdownModule } from 'primeng/dropdown';
import { ListboxModule } from 'primeng/listbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { PickListModule } from 'primeng/picklist';
// marketing
import { BlkptMoComparisonComponent } from './templates/marketing/blkpt-mo-comparison/blkpt-mo-comparison.component';
import { ChangeHistMoByUserComponent } from './templates/marketing/change-hist-mo-by-user/change-hist-mo-by-user.component';
import { ChangeHistMoComponent } from './templates/marketing/change-hist-mo/change-hist-mo.component';
import { DefaultDescDeviationComponent } from './templates/marketing/default-desc-deviation/default-desc-deviation.component';
import { IncludedContentComponent } from './templates/marketing/included-content/included-content.component';
import { IndicatorComponent } from './templates/marketing/indicator/indicator.component';
import { MdlYrChangeGmeComponent } from './templates/marketing/mdl-yr-change-gme/mdl-yr-change-gme.component';
import { MdlYrChangeGmnaComponent } from './templates/marketing/mdl-yr-change-gmna/mdl-yr-change-gmna.component';
import { MktIntentOverviewComponent } from './templates/marketing/mkt-intent-overview/mkt-intent-overview.component';
import { MktIntentOverviewGroupedComponent } from './templates/marketing/mkt-intent-overview-grouped/mkt-intent-overview-grouped.component';
import { MoComparisonComponent } from './templates/marketing/mo-comparison/mo-comparison.component';
import { MoDefinitionComponent } from './templates/marketing/mo-definition/mo-definition.component';
import { MoIndicatorComponent } from './templates/marketing/mo-indicator/mo-indicator.component';
import { MoPackagingComponent } from './templates/marketing/mo-packaging/mo-packaging.component';
import { OptRestrictMatrixComponent } from './templates/marketing/opt-restrict-matrix/opt-restrict-matrix.component';
import { OptUsageSummaryComponent } from './templates/marketing/opt-usage-summary/opt-usage-summary.component';
import { VdsChangeComponent } from './templates/marketing/vds-change/vds-change.component';
// finace
import { BarsStandEquipComponent } from './templates/finance/bars-stand-equip/bars-stand-equip.component';
import { ComparisonComponent } from './templates/finance/comparison/comparison.component';
import { ModelPricingComponent } from './templates/finance/model-pricing/model-pricing.component';
import { OptionPricingComponent } from './templates/finance/option-pricing/option-pricing.component';
import { OptionPricingGroupedComponent } from './templates/finance/option-pricing-grouped/option-pricing-grouped.component';
import { RatesAndFeesComponent } from './templates/finance/rates-and-fees/rates-and-fees.component';
import { RolloverLogComponent } from './templates/finance/rollover-log/rollover-log.component';
import { RpoByVehicleLineComponent } from './templates/finance/rpo-by-vehicle-line/rpo-by-vehicle-line.component';
import { WndwLblPreviewComponent } from './templates/finance/wndw-lbl-preview/wndw-lbl-preview.component';
import { ModelOverridesComponent } from './templates/finance/model-overrides/model-overrides.component';
// order fulfillment
import { CodeUsageComponent } from './templates/order-fulfillment/code-usage/code-usage.component';
import { OrderFullfillConvComponent } from './templates/order-fulfillment/order-fullfill-conv/order-fullfill-conv.component';
// admin
import { AccessContAuditComponent } from './templates/administration/access-cont-audit/access-cont-audit.component';
import { ChangeHistMiscComponent } from './templates/administration/change-hist-misc/change-hist-misc.component';
import { ChangeHistUserComponent } from './templates/administration/change-hist-user/change-hist-user.component';
// my reports
import { ScheduledReportOutputComponent } from './templates/my-reports/scheduled-report-output/scheduled-report-output.component';
import { BackgroundReportsComponent } from './templates/my-reports/background-reports/background-reports.component';
import { TemplatesComponent } from './templates/my-reports/templates/templates.component';
import { SchedulesComponent } from './templates/my-reports/schedules/schedules.component';
import { Template } from './classes/Template';
// shared
import { VehicleLineFormComponent } from './templates/shared/vehicle-line-form.component';
// modals
import { ScheduleReportComponent } from './modals/schedule-report/schedule-report.component';
import { GenerateReportComponent } from './modals/generate-report/generate-report.component';
import { OrderFulfillment } from './classes/OrderFulfillment';
import { AdminReport } from './classes/AdminReport';
import { FinanceReport } from './classes/FinanceReport';
import { ReportControls } from './classes/ReportControls';
import { Marketing } from './classes/Marketing';
import { ReportsRouteRoutes } from './reports-route.routing';
import { StatusComponent } from './templates/finance/shared/status/status.component';
import { PublishedDateComponent } from './templates/finance/shared/published-date/published-date.component';
import { EffectiveDateComponent } from './templates/finance/shared/effective-date/effective-date.component';
import { Logical } from './classes/Logical';
import { ReportService } from './report-service';

@NgModule({
  imports: [
    CommonModule,
    MatProgressBarModule,
    InputTextModule,
    MultiSelectModule,
    SharedModule,
    CalendarModule,
    SliderModule,
    DropdownModule,
    ListboxModule,
    MatTableModule,
    SelectButtonModule,
    RadioButtonModule,
    ReportsRouteRoutes,
    ToastModule,
    PickListModule,
  ],
  declarations: [
    ReportComponent,
    SidebarComponent,
    NavigationComponent,
    BlkptMoComparisonComponent,
    ChangeHistMoByUserComponent,
    ChangeHistMoComponent,
    DefaultDescDeviationComponent,
    IncludedContentComponent,
    IndicatorComponent,
    MoIndicatorComponent,
    MdlYrChangeGmeComponent,
    MdlYrChangeGmnaComponent,
    MktIntentOverviewComponent,
    MktIntentOverviewGroupedComponent,
    MoComparisonComponent,
    MoDefinitionComponent,
    MoPackagingComponent,
    ModelOverridesComponent,
    OptRestrictMatrixComponent,
    OptUsageSummaryComponent,
    VdsChangeComponent,
    BarsStandEquipComponent,
    ComparisonComponent,
    ModelPricingComponent,
    OptionPricingComponent,
    OptionPricingGroupedComponent,
    RatesAndFeesComponent,
    RolloverLogComponent,
    RpoByVehicleLineComponent,
    WndwLblPreviewComponent,
    CodeUsageComponent,
    OrderFullfillConvComponent,
    AccessContAuditComponent,
    ChangeHistMiscComponent,
    ChangeHistUserComponent,
    ScheduleReportComponent,
    GenerateReportComponent,
    ScheduledReportOutputComponent,
    BackgroundReportsComponent,
    TemplatesComponent,
    SchedulesComponent,
    StatusComponent,
    PublishedDateComponent,
    EffectiveDateComponent,
    VehicleLineFormComponent,
  ],
  entryComponents: [
    BlkptMoComparisonComponent,
    ChangeHistMoByUserComponent,
    ChangeHistMoComponent,
    DefaultDescDeviationComponent,
    IncludedContentComponent,
    IndicatorComponent,
    MoIndicatorComponent,
    MdlYrChangeGmeComponent,
    MdlYrChangeGmnaComponent,
    MktIntentOverviewComponent,
    MktIntentOverviewGroupedComponent,
    MoComparisonComponent,
    MoDefinitionComponent,
    MoPackagingComponent,
    ModelOverridesComponent,
    OptRestrictMatrixComponent,
    OptUsageSummaryComponent,
    VdsChangeComponent,
    BarsStandEquipComponent,
    ComparisonComponent,
    ModelPricingComponent,
    OptionPricingComponent,
    OptionPricingGroupedComponent,
    RatesAndFeesComponent,
    RolloverLogComponent,
    RpoByVehicleLineComponent,
    WndwLblPreviewComponent,
    CodeUsageComponent,
    OrderFullfillConvComponent,
    AccessContAuditComponent,
    ChangeHistMiscComponent,
    ChangeHistUserComponent,
    ScheduleReportComponent,
    GenerateReportComponent,
    ScheduledReportOutputComponent,
    BackgroundReportsComponent,
    TemplatesComponent,
    SchedulesComponent,
    VehicleLineFormComponent,
  ],
  providers: [
    OrderFulfillment,
    AdminReport,
    FinanceReport,
    ReportControls,
    Marketing,
    Template,
    Logical,
    ReportService,
  ],
})
export class ReportModule { }
