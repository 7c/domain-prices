"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainPricesService = void 0;
//#region imports
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class DomainPricesService {
    constructor(pricesFile = DomainPricesService.DYNADOT_FILE) {
        this.data = this.loadPrices(pricesFile);
    }
    loadPrices(pricesFile) {
        const content = fs_1.default.readFileSync(pricesFile, 'utf8');
        return JSON.parse(content);
    }
    /** Get the registrar name */
    get registrar() {
        return this.data.registrar;
    }
    /** Get the last update timestamp */
    get updatedAt() {
        return this.data.updated;
    }
    /** Get the last update as a Date object */
    get updatedAtDate() {
        return new Date(this.data.updated);
    }
    /** Get the total number of TLDs available */
    get count() {
        return Object.keys(this.data.prices).length;
    }
    /** Get all TLD names */
    get tlds() {
        return Object.keys(this.data.prices);
    }
    /** Get price info for a specific TLD */
    getPrice(tld) {
        // Normalize: remove leading dot if present
        const normalizedTld = tld.replace(/^\./, '');
        return this.data.prices[normalizedTld];
    }
    /** Get all prices as a record */
    getAllPrices() {
        return this.data.prices;
    }
    /** Get all prices as an array */
    getAllPricesArray() {
        return Object.values(this.data.prices);
    }
    /** Check if a TLD exists */
    hasTld(tld) {
        const normalizedTld = tld.replace(/^\./, '');
        return normalizedTld in this.data.prices;
    }
    /** Search TLDs by criteria */
    search(options) {
        return this.getAllPricesArray().filter(price => {
            if (options.maxRegisterPrice !== undefined && price.register_price > options.maxRegisterPrice) {
                return false;
            }
            if (options.maxRenewPrice !== undefined && price.renew_price > options.maxRenewPrice) {
                return false;
            }
            if (options.maxTransferPrice !== undefined && price.transfer_price > options.maxTransferPrice) {
                return false;
            }
            if (options.privacy !== undefined && price.privacy !== options.privacy) {
                return false;
            }
            if (options.idn !== undefined && price.idn !== options.idn) {
                return false;
            }
            if (options.hasRestrictions !== undefined) {
                const hasRestrictions = price.restrictions !== false;
                if (hasRestrictions !== options.hasRestrictions) {
                    return false;
                }
            }
            if (options.usage !== undefined && !price.usage.toLowerCase().includes(options.usage.toLowerCase())) {
                return false;
            }
            return true;
        });
    }
    /** Get cheapest TLDs by registration price */
    getCheapestByRegistration(limit = 10) {
        return this.getAllPricesArray()
            .sort((a, b) => a.register_price - b.register_price)
            .slice(0, limit);
    }
    /** Get cheapest TLDs by renewal price */
    getCheapestByRenewal(limit = 10) {
        return this.getAllPricesArray()
            .sort((a, b) => a.renew_price - b.renew_price)
            .slice(0, limit);
    }
    /** Get TLDs with no restrictions */
    getUnrestrictedTlds() {
        return this.getAllPricesArray().filter(price => price.restrictions === false);
    }
    /** Get TLDs with restrictions */
    getRestrictedTlds() {
        return this.getAllPricesArray().filter(price => price.restrictions !== false);
    }
    /** Get TLDs with privacy support */
    getPrivacyEnabledTlds() {
        return this.getAllPricesArray().filter(price => price.privacy === true);
    }
    /** Get TLDs with IDN support */
    getIdnEnabledTlds() {
        return this.getAllPricesArray().filter(price => price.idn === true);
    }
    /** Calculate total cost for registering and holding a domain for N years */
    calculateTotalCost(tld, years) {
        const price = this.getPrice(tld);
        if (!price)
            return undefined;
        if (years <= 0)
            return 0;
        // First year is registration, subsequent years are renewals
        return price.register_price + (years - 1) * price.renew_price;
    }
    /** Get the raw data object */
    getRawData() {
        return this.data;
    }
    /** Fetch prices from a URL and update the internal data */
    async fetchPrices(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch prices: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        this.data = data;
    }
    /** Static method to create a new instance from a URL */
    static async fromUrl(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch prices: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const service = new DomainPricesService();
        service.data = data;
        return service;
    }
}
exports.DomainPricesService = DomainPricesService;
DomainPricesService.DYNADOT_FILE = path_1.default.join(__dirname, '../../data/dynadot.json');
DomainPricesService.DYNADOT = new DomainPricesService(DomainPricesService.DYNADOT_FILE);
//# sourceMappingURL=DomainPrices.js.map