import { AppSettings, AppSettingsContext, AppSettingsJS } from "./app-settings";
export declare class AppSettingsFixtures {
    static wikiOnlyJS(): AppSettingsJS;
    static wikiTwitterJS(): AppSettingsJS;
    static getContext(): AppSettingsContext;
    static wikiOnly(): AppSettings;
    static wikiOnlyWithExecutor(): AppSettings;
    static wikiTwitter(): AppSettings;
}
