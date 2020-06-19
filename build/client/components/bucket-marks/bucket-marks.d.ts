import { PlywoodValue } from "plywood";
import * as React from "react";
import { Stage } from "../../../common/models/stage/stage";
import "./bucket-marks.scss";
export interface BucketMarksProps {
    stage: Stage;
    ticks: PlywoodValue[];
    scale: any;
}
export interface BucketMarksState {
}
export declare class BucketMarks extends React.Component<BucketMarksProps, BucketMarksState> {
    render(): JSX.Element;
}
