//#region imports
import fs from 'fs'
import path from 'path'
//#endregion

export interface DomainPrice {
    tld: string
    usage: string
    register_price: number
    renew_price: number
    transfer_price: number
    restore_price: number
    renew_grace_period: number
    delete_grace_period: number
    currency: string
    privacy: boolean
    idn: boolean
    restrictions: string | false
}

export interface DomainPricesData {
    registrar: string
    updated: number
    prices: Record<string, DomainPrice>
}

export interface SearchOptions {
    maxRegisterPrice?: number
    maxRenewPrice?: number
    maxTransferPrice?: number
    privacy?: boolean
    idn?: boolean
    hasRestrictions?: boolean
    usage?: string
}

export class DomainPricesService {
    private data: DomainPricesData

    static readonly DYNADOT_FILE = path.join(__dirname, '../../data/dynadot.json')
    static readonly DYNADOT = new DomainPricesService(DomainPricesService.DYNADOT_FILE)

    constructor(pricesFile: string = DomainPricesService.DYNADOT_FILE) {
        this.data = this.loadPrices(pricesFile)
    }

    private loadPrices(pricesFile: string): DomainPricesData {
        const content = fs.readFileSync(pricesFile, 'utf8')
        return JSON.parse(content)
    }

    /** Get the registrar name */
    get registrar(): string {
        return this.data.registrar
    }

    /** Get the last update timestamp */
    get updatedAt(): number {
        return this.data.updated
    }

    /** Get the last update as a Date object */
    get updatedAtDate(): Date {
        return new Date(this.data.updated)
    }

    /** Get the total number of TLDs available */
    get count(): number {
        return Object.keys(this.data.prices).length
    }

    /** Get all TLD names */
    get tlds(): string[] {
        return Object.keys(this.data.prices)
    }

    /** Get price info for a specific TLD */
    getPrice(tld: string): DomainPrice | undefined {
        // Normalize: remove leading dot if present
        const normalizedTld = tld.replace(/^\./, '')
        return this.data.prices[normalizedTld]
    }

    /** Get all prices as a record */
    getAllPrices(): Record<string, DomainPrice> {
        return this.data.prices
    }

    /** Get all prices as an array */
    getAllPricesArray(): DomainPrice[] {
        return Object.values(this.data.prices)
    }

    /** Check if a TLD exists */
    hasTld(tld: string): boolean {
        const normalizedTld = tld.replace(/^\./, '')
        return normalizedTld in this.data.prices
    }

    /** Search TLDs by criteria */
    search(options: SearchOptions): DomainPrice[] {
        return this.getAllPricesArray().filter(price => {
            if (options.maxRegisterPrice !== undefined && price.register_price > options.maxRegisterPrice) {
                return false
            }
            if (options.maxRenewPrice !== undefined && price.renew_price > options.maxRenewPrice) {
                return false
            }
            if (options.maxTransferPrice !== undefined && price.transfer_price > options.maxTransferPrice) {
                return false
            }
            if (options.privacy !== undefined && price.privacy !== options.privacy) {
                return false
            }
            if (options.idn !== undefined && price.idn !== options.idn) {
                return false
            }
            if (options.hasRestrictions !== undefined) {
                const hasRestrictions = price.restrictions !== false
                if (hasRestrictions !== options.hasRestrictions) {
                    return false
                }
            }
            if (options.usage !== undefined && !price.usage.toLowerCase().includes(options.usage.toLowerCase())) {
                return false
            }
            return true
        })
    }

    /** Get cheapest TLDs by registration price */
    getCheapestByRegistration(limit: number = 10): DomainPrice[] {
        return this.getAllPricesArray()
            .sort((a, b) => a.register_price - b.register_price)
            .slice(0, limit)
    }

    /** Get cheapest TLDs by renewal price */
    getCheapestByRenewal(limit: number = 10): DomainPrice[] {
        return this.getAllPricesArray()
            .sort((a, b) => a.renew_price - b.renew_price)
            .slice(0, limit)
    }

    
    /** Get TLDs with no restrictions */
    getUnrestrictedTlds(): DomainPrice[] {
        return this.getAllPricesArray().filter(price => price.restrictions === false)
    }

    /** Get TLDs with restrictions */
    getRestrictedTlds(): DomainPrice[] {
        return this.getAllPricesArray().filter(price => price.restrictions !== false)
    }

    /** Get TLDs with privacy support */
    getPrivacyEnabledTlds(): DomainPrice[] {
        return this.getAllPricesArray().filter(price => price.privacy === true)
    }

    /** Get TLDs with IDN support */
    getIdnEnabledTlds(): DomainPrice[] {
        return this.getAllPricesArray().filter(price => price.idn === true)
    }

    /** Calculate total cost for registering and holding a domain for N years */
    calculateTotalCost(tld: string, years: number): number | undefined {
        const price = this.getPrice(tld)
        if (!price) return undefined
        if (years <= 0) return 0
        // First year is registration, subsequent years are renewals
        return price.register_price + (years - 1) * price.renew_price
    }

    /** Get the raw data object */
    getRawData(): DomainPricesData {
        return this.data
    }

    /** Fetch prices from a URL and update the internal data */
    async fetchPrices(url: string): Promise<void> {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Failed to fetch prices: ${response.status} ${response.statusText}`)
        }
        const data: DomainPricesData = await response.json()
        this.data = data
    }

    /** Static method to create a new instance from a URL */
    static async fromUrl(url: string): Promise<DomainPricesService> {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Failed to fetch prices: ${response.status} ${response.statusText}`)
        }
        const data: DomainPricesData = await response.json()
        const service = new DomainPricesService()
        service.data = data
        return service
    }
}
