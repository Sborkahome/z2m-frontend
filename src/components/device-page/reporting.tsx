import React, { Component } from "react";
import { Device, Cluster, Endpoint, Attribute } from "../../types";

import actions, { ReportingApi } from "../../actions/actions";
import { connect } from "unistore/react";
import { GlobalState, Group } from "../../store";
import ReportingRow from "./reporting-row";


interface PropsFromStore {
    devices: Record<string, Device>;
    groups: Group[];
}
interface ReportingProps {
    device: Device;
}

export interface NiceReportingingRule {
    id?: number;
    isNew?: number;
    endpoint: Endpoint;

    cluster: Cluster;
    attribute: Attribute;
    minimum_report_interval: number;
    maximum_report_interval: number;
    reportable_change: number;
}
const convertBidningsIntoNiceStructure = (device: Device): NiceReportingingRule[] => {
    const reportings: NiceReportingingRule[] = [];
    Object.entries(device.endpoints).forEach(([endpoint, description]) => {
        description.configured_reportings
            .forEach(reportingRule => {
                reportings.push({
                    ...reportingRule,
                    endpoint
                } as NiceReportingingRule)
            });
    });
    return reportings;
}
type ReportingState = {
    reportingRules: NiceReportingingRule[];
}

const rule2key = (rule: NiceReportingingRule): string => `${rule.isNew}${rule.endpoint}${rule.cluster}-${rule.attribute}`;

export class Reporting extends Component<ReportingProps & PropsFromStore & ReportingApi, ReportingState> {
    state: ReportingState = {
        reportingRules: []
    }
    static getDerivedStateFromProps(props: Readonly<ReportingProps & PropsFromStore>): Partial<ReportingState> {
        const { device } = props;
        // const endpoints = getEndpoints(device);
        const reportingRules = convertBidningsIntoNiceStructure(device);


        reportingRules.push({ isNew: Date.now(), reportable_change: 0, minimum_report_interval: 60, maximum_report_interval: 3600 } as NiceReportingingRule);
        return {
            reportingRules
        };
    }

    onApply = (rule: NiceReportingingRule) => {
        const { configureReport, device } = this.props;

        const { cluster, endpoint, attribute, minimum_report_interval, maximum_report_interval, reportable_change } = rule;
        configureReport(`${device.friendly_name}/${endpoint}`, {

            cluster, attribute, minimum_report_interval, maximum_report_interval, reportable_change
        });
    }
    render() {
        const { device } = this.props;
        const { reportingRules } = this.state;

        return (
            <div className="container-fluid">
                {
                    reportingRules.map((rule) =>
                        <ReportingRow
                            key={rule2key(rule)}
                            rule={rule}
                            device={device}
                            onApply={this.onApply}
                        />)
                }

            </div>
        );
    }
}

const mappedProps = ["devices", "groups"];
const ConnectedReportingPage = connect<ReportingProps, {}, GlobalState, PropsFromStore & ReportingApi>(mappedProps, actions)(Reporting);
export default ConnectedReportingPage
