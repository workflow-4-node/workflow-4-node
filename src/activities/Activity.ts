export interface Activity {
    readonly instanceId: string;
    readonly id: string;
    readonly nonSerializedProperties: Set<string>;
    readonly promotedProperties?: readonly string[];
    [key: string]: unknown;
}
