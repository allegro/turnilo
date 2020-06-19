import { Fn } from "../../../common/utils/general/general";
import { TileHeaderIcon } from "../tile-header/tile-header";
interface PinboardIconsProps {
    onClose: Fn;
    onSearchClick: Fn;
    showSearch: boolean;
}
export declare function pinboardIcons(props: PinboardIconsProps): TileHeaderIcon[];
export {};
