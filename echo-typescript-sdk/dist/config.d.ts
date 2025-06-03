export interface EchoConfig {
    baseUrl: string;
    apiKey?: string;
}
export declare const defaultConfig: EchoConfig;
export declare function getConfig(overrides?: Partial<EchoConfig>): EchoConfig;
//# sourceMappingURL=config.d.ts.map