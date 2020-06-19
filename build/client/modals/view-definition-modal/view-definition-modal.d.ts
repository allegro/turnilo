import * as React from "react";
import { Essence } from "../../../common/models/essence/essence";
import { Fn } from "../../../common/utils/general/general";
import "./view-definition-modal.scss";
export interface ViewDefinitionModalProps {
    onClose: Fn;
    essence: Essence;
}
export declare const ViewDefinitionModal: React.SFC<ViewDefinitionModalProps>;
