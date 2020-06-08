export interface INotification {
   attributes: {
    isarchived: string;
    subGroupNames: Array<string>;
    totalRecords: number;
    unreadCount: number;
  };
  records: Array<any>;
  subGroupNames: string[];
}
