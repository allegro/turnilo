import { Datum } from "plywood";
interface Position {
    row: number | null;
    column: number | null;
}
export default function datumByPosition(dataset: Datum[], position: Position): [Datum, Datum];
export {};
