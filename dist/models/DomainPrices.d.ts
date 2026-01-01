export interface DomainPrice {
    tld: string;
    usage: string;
    register_price: number;
    renew_price: number;
    transfer_price: number;
    restore_price: number;
    renew_grace_period: number;
    delete_grace_period: number;
    currency: string;
    privacy: boolean;
    idn: boolean;
    restrictions: string | false;
}
export interface DomainPricesData {
    registrar: string;
    updated: number;
    prices: Record<string, DomainPrice>;
}
export interface SearchOptions {
    maxRegisterPrice?: number;
    maxRenewPrice?: number;
    maxTransferPrice?: number;
    privacy?: boolean;
    idn?: boolean;
    hasRestrictions?: boolean;
    usage?: string;
}
export declare class DomainPricesService {
    private data;
    static readonly DYNADOT_FILE: string;
    static readonly DYNADOT: DomainPricesService;
    constructor(pricesFile?: string);
    private loadPrices;
    /** Get the registrar name */
    get registrar(): string;
    /** Get the last update timestamp */
    get updatedAt(): number;
    /** Get the last update as a Date object */
    get updatedAtDate(): Date;
    /** Get the total number of TLDs available */
    get count(): number;
    /** Get all TLD names */
    get tlds(): string[];
    /** Get price info for a specific TLD */
    getPrice(tld: string): DomainPrice | undefined;
    /** Get all prices as a record */
    getAllPrices(): Record<string, DomainPrice>;
    /** Get all prices as an array */
    getAllPricesArray(): DomainPrice[];
    /** Check if a TLD exists */
    hasTld(tld: string): boolean;
    /** Search TLDs by criteria */
    search(options: SearchOptions): DomainPrice[];
    /** Get cheapest TLDs by registration price */
    getCheapestByRegistration(limit?: number): DomainPrice[];
    /** Get cheapest TLDs by renewal price */
    getCheapestByRenewal(limit?: number): DomainPrice[];
    /** Get TLDs with no restrictions */
    getUnrestrictedTlds(): DomainPrice[];
    /** Get TLDs with restrictions */
    getRestrictedTlds(): DomainPrice[];
    /** Get TLDs with privacy support */
    getPrivacyEnabledTlds(): DomainPrice[];
    /** Get TLDs with IDN support */
    getIdnEnabledTlds(): DomainPrice[];
    /** Calculate total cost for registering and holding a domain for N years */
    calculateTotalCost(tld: string, years: number): number | undefined;
    /** Get the raw data object */
    getRawData(): DomainPricesData;
    /** Fetch prices from a URL and update the internal data */
    fetchPrices(url: string): Promise<void>;
    /** Static method to create a new instance from a URL */
    static fromUrl(url: string): Promise<DomainPricesService>;
}
//# sourceMappingURL=DomainPrices.d.ts.map