import { RouterModule, Routes } from '@angular/router';
import { ReportComponent } from './report.component';
import { AccessContAuditComponent } from './templates/administration/access-cont-audit/access-cont-audit.component';
import { ChangeHistMiscComponent } from './templates/administration/change-hist-misc/change-hist-misc.component';
import { ChangeHistUserComponent } from './templates/administration/change-hist-user/change-hist-user.component';
import { BarsStandEquipComponent } from './templates/finance/bars-stand-equip/bars-stand-equip.component';
import { ComparisonComponent } from './templates/finance/comparison/comparison.component';
import { ModelOverridesComponent } from './templates/finance/model-overrides/model-overrides.component';
import { ModelPricingComponent } from './templates/finance/model-pricing/model-pricing.component';
import { OptionPricingGroupedComponent } from './templates/finance/option-pricing-grouped/option-pricing-grouped.component';
import { OptionPricingComponent } from './templates/finance/option-pricing/option-pricing.component';
import { RatesAndFeesComponent } from './templates/finance/rates-and-fees/rates-and-fees.component';
import { RolloverLogComponent } from './templates/finance/rollover-log/rollover-log.component';
import { RpoByVehicleLineComponent } from './templates/finance/rpo-by-vehicle-line/rpo-by-vehicle-line.component';
import { WndwLblPreviewComponent } from './templates/finance/wndw-lbl-preview/wndw-lbl-preview.component';
import { BlkptMoComparisonComponent } from './templates/marketing/blkpt-mo-comparison/blkpt-mo-comparison.component';
import { ChangeHistMoByUserComponent } from './templates/marketing/change-hist-mo-by-user/change-hist-mo-by-user.component';
import { ChangeHistMoComponent } from './templates/marketing/change-hist-mo/change-hist-mo.component';
import { IncludedContentComponent } from './templates/marketing/included-content/included-content.component';
import { IndicatorComponent } from './templates/marketing/indicator/indicator.component';
import { MdlYrChangeGmnaComponent } from './templates/marketing/mdl-yr-change-gmna/mdl-yr-change-gmna.component';
import { MktIntentOverviewGroupedComponent } from './templates/marketing/mkt-intent-overview-grouped/mkt-intent-overview-grouped.component';
import { MktIntentOverviewComponent } from './templates/marketing/mkt-intent-overview/mkt-intent-overview.component';
import { MoComparisonComponent } from './templates/marketing/mo-comparison/mo-comparison.component';
import { MoDefinitionComponent } from './templates/marketing/mo-definition/mo-definition.component';
import { MoIndicatorComponent } from './templates/marketing/mo-indicator/mo-indicator.component';
import { MoPackagingComponent } from './templates/marketing/mo-packaging/mo-packaging.component';
import { OptUsageSummaryComponent } from './templates/marketing/opt-usage-summary/opt-usage-summary.component';
import { VdsChangeComponent } from './templates/marketing/vds-change/vds-change.component';
import { BackgroundReportsComponent } from './templates/my-reports/background-reports/background-reports.component';
import { ScheduledReportOutputComponent } from './templates/my-reports/scheduled-report-output/scheduled-report-output.component';
import { SchedulesComponent } from './templates/my-reports/schedules/schedules.component';
import { TemplatesComponent } from './templates/my-reports/templates/templates.component';
import { CodeUsageComponent } from './templates/order-fulfillment/code-usage/code-usage.component';
import { OrderFullfillConvComponent } from './templates/order-fulfillment/order-fullfill-conv/order-fullfill-conv.component';
import { DefaultDescDeviationComponent } from './templates/marketing/default-desc-deviation/default-desc-deviation.component';

const REPORTS = 'Report';
const routes: Routes = [
  {
    path: '',
    component: ReportComponent,
    data: {
      breadCrumbs: [REPORTS],
    },
    children: [
      {
        path: '',
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'model-overrides/:templateName',
        component: ModelOverridesComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'model-overrides',
        component: ModelOverridesComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'market-offer-packaging-report/:templateName',
        component: MoPackagingComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'market-offer-packaging-report',
        component: MoPackagingComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'indicator-report/:templateName',
        component: IndicatorComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'indicator-report',
        component: IndicatorComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'market-offer-indicator-report/:templateName',
        component: MoIndicatorComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'market-offer-indicator-report',
        component: MoIndicatorComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'vds-change-report/:templateName',
        component: VdsChangeComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'vds-change-report',
        component: VdsChangeComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'option-usage-summary-report/:templateName',
        component: OptUsageSummaryComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'option-usage-summary-report',
        component: OptUsageSummaryComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'model-year-change-report-gmna/:templateName',
        component: MdlYrChangeGmnaComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'model-year-change-report-gmna',
        component: MdlYrChangeGmnaComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'blockpoint-market-offer-comparison-report/:templateName',
        component: BlkptMoComparisonComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'blockpoint-market-offer-comparison-report',
        component: BlkptMoComparisonComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'change-history-market-offer/:templateName',
        component: ChangeHistMoComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'change-history-market-offer',
        component: ChangeHistMoComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'change-history-market-offer-by-user/:templateName',
        component: ChangeHistMoByUserComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'change-history-market-offer-by-user',
        component: ChangeHistMoByUserComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'default-description-deviation-report',
        component: DefaultDescDeviationComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'default-description-deviation-report/:templateName',
        component: DefaultDescDeviationComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'market-offer-definition-report/:templateName',
        component: MoDefinitionComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'market-offer-definition-report',
        component: MoDefinitionComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'market-offer-comparison-report/:templateName',
        component: MoComparisonComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'market-offer-comparison-report',
        component: MoComparisonComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'included-content-report/:templateName',
        component: IncludedContentComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'included-content-report',
        component: IncludedContentComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'marketing-intent-overview-report/:templateName',
        component: MktIntentOverviewComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'marketing-intent-overview-report',
        component: MktIntentOverviewComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'marketing-intent-overview-grouped-report/:templateName',
        component: MktIntentOverviewGroupedComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'marketing-intent-overview-grouped-report',
        component: MktIntentOverviewGroupedComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'window-label-preview/:templateName',
        component: WndwLblPreviewComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'window-label-preview',
        component: WndwLblPreviewComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'rpo-by-vehicle-line/:templateName',
        component: RpoByVehicleLineComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'rpo-by-vehicle-line',
        component: RpoByVehicleLineComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'rates-and-fees/:templateName',
        component: RatesAndFeesComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'rates-and-fees',
        component: RatesAndFeesComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'model-pricing/:templateName',
        component: ModelPricingComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'model-pricing',
        component: ModelPricingComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'option-pricing/:templateName',
        component: OptionPricingComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'option-pricing',
        component: OptionPricingComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'option-pricing-grouped/:templateName',
        component: OptionPricingGroupedComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'option-pricing-grouped',
        component: OptionPricingGroupedComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'bars-standard-equipment/:templateName',
        component: BarsStandEquipComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'bars-standard-equipment',
        component: BarsStandEquipComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'comparison-report/:templateName',
        component: ComparisonComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'comparison-report',
        component: ComparisonComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'rollover-log/:templateName',
        component: RolloverLogComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'rollover-log',
        component: RolloverLogComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'code-usage-report/:templateName',
        component: CodeUsageComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'code-usage-report',
        component: CodeUsageComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'order-fulfillment-conversion-report/:templateName',
        component: OrderFullfillConvComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'order-fulfillment-conversion-report',
        component: OrderFullfillConvComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'access-control-audit-report/:templateName',
        component: AccessContAuditComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'access-control-audit-report',
        component: AccessContAuditComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'change-history-miscellaneous/:templateName',
        component: ChangeHistMiscComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'change-history-miscellaneous',
        component: ChangeHistMiscComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'change-history-user/:templateName',
        component: ChangeHistUserComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'change-history-user',
        component: ChangeHistUserComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'scheduled-report-output/:downloadReportId',
        component: ScheduledReportOutputComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'scheduled-report-output',
        component: ScheduledReportOutputComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'background-reports',
        component: BackgroundReportsComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'background-reports/:downloadReportId',
        component: BackgroundReportsComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'templates',
        component: TemplatesComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
      {
        path: 'schedules',
        component: SchedulesComponent,
        data: {
          breadCrumbs: [REPORTS],
        },
      },
    ],
  },
];

export const ReportsRouteRoutes = RouterModule.forChild(routes);
