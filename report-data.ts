import { IReportGrouping } from './interfaces/reports.interfaces';

const TIMESTAMP = '07/18/2018 4:13 PM';

export const REPORTS: IReportGrouping[] = [
  {
    id: 1,
    name: 'Marketing',
    reports: [
      {id: 1, name: 'Market Offer Packaging Report', modified: TIMESTAMP},
      {id: 2, name: 'Indicator Report', modified: TIMESTAMP},
      {id: 3, name: 'VDS Change Report', modified: TIMESTAMP},
      {id: 4, name: 'Option Usage Summary Report', modified: TIMESTAMP},
      {id: 5, name: 'Model Year Change Report GMNA', modified: TIMESTAMP},
      {id: 6, name: 'Option Restriction Matrix Report', modified: TIMESTAMP},
      {id: 7, name: 'Model Year Change Report GME', modified: TIMESTAMP},
      {id: 8, name: 'Blockpoint Market Offer Comparison Report', modified: TIMESTAMP},
      {id: 9, name: 'Change History Market Offer by User', modified: TIMESTAMP},
      {id: 10, name: 'Default Description Deviation Report', modified: TIMESTAMP},
      {id: 11, name: 'Change History Market Offer', modified: TIMESTAMP},
      {id: 12, name: 'Market Offer Definition Report', modified: TIMESTAMP},
      {id: 13, name: 'Market Offer Comparison Report', modified: TIMESTAMP},
      {id: 14, name: 'Included Content Report', modified: TIMESTAMP},
      {id: 15, name: 'Marketing Intent Overview Report', modified: TIMESTAMP},
    ],
  },
  {
    id: 2,
    name: 'Finance',
    reports: [
      {id: 1, name: 'Window Label Preview', modified: TIMESTAMP},
      {id: 2, name: 'RPO by Vehicle Line', modified: TIMESTAMP},
      {id: 3, name: 'Model Overrides', modified: TIMESTAMP},
      {id: 4, name: 'Rates and Fees', modified: TIMESTAMP},
      {id: 5, name: 'Model Pricing', modified: TIMESTAMP},
      {id: 6, name: 'Option Pricing', modified: TIMESTAMP},
      {id: 7, name: 'BARS Standard Equipment', modified: TIMESTAMP},
      {id: 8, name: 'Comparison Report', modified: TIMESTAMP},
      {id: 9, name: 'Rollover Log', modified: TIMESTAMP},
    ],
  },
  {
    id: 3,
    name: 'Order Fulfillment',
    reports: [
      {id: 1, name: 'Code Usage Report', modified: TIMESTAMP},
      {id: 2, name: 'Order Fulfillment Conversion Report', modified: TIMESTAMP},
    ],
  },
  {
    id: 4,
    name: 'Admin',
    reports: [
      {id: 1, name: 'Access Control Audit Report', modified: TIMESTAMP},
      {id: 2, name: 'Change History Miscellaneous', modified: TIMESTAMP},
      {id: 3, name: 'Change History User', modified: TIMESTAMP},
    ],
  },
];

export const MYREPORTS: any = [];
