export interface IReportGrouping {
    id: number;
    name: string;
    reports: IReport[];
}

interface IReport {
    id: number;
    name: string;
    modified: string;
}
