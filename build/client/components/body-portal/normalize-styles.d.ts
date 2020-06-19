import * as React from "react";
export interface StyleDefinition {
    left?: number | string;
    right?: number | string;
    top?: number | string;
    bottom?: number | string;
    disablePointerEvents?: boolean;
    isAboveAll?: boolean;
}
export default function normalizeStyles(source: StyleDefinition): React.CSSProperties;
