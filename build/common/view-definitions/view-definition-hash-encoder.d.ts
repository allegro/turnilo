export interface ViewDefinitionHashEncoder<VD> {
    encodeUrlHash(definition: VD): string;
    decodeUrlHash(urlHash: string, visualization: string): VD;
}
