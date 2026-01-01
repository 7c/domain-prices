# Domain Prices
Aiming to parse domain prices regularly and update. 

## Installation
```
npm i --save @7c/domain-prices
```

## Quick Start
```typescript
import { DomainPricesService } from '@7c/domain-prices'

const service = DomainPricesService.DYNADOT

// Get price for .com
const com = service.getPrice('com')
console.log(com?.register_price) // 10.88

// Find cheap domains under $5
const cheap = service.search({ maxRegisterPrice: 5, privacy: true })

// Calculate 3-year cost
const cost = service.calculateTotalCost('com', 3) // register + 2 renewals

// Fetch latest prices from remote URL
await service.fetchPrices('https://raw.githubusercontent.com/7c/domain-prices/main/dynadot.json')

// Or create a new instance from URL
const remote = await DomainPricesService.fromUrl('https://raw.githubusercontent.com/7c/domain-prices/main/dynadot.json')
```

## API Reference

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `registrar` | `string` | Registrar name |
| `updatedAt` | `number` | Last update timestamp |
| `updatedAtDate` | `Date` | Last update as Date object |
| `count` | `number` | Total number of TLDs |
| `tlds` | `string[]` | Array of all TLD names |

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `getPrice` | `(tld: string) => DomainPrice \| undefined` | Get price info for a TLD |
| `hasTld` | `(tld: string) => boolean` | Check if TLD exists |
| `getAllPrices` | `() => Record<string, DomainPrice>` | Get all prices as record |
| `getAllPricesArray` | `() => DomainPrice[]` | Get all prices as array |
| `search` | `(options: SearchOptions) => DomainPrice[]` | Search TLDs by criteria |
| `getCheapestByRegistration` | `(limit?: number) => DomainPrice[]` | Get cheapest by registration |
| `getCheapestByRenewal` | `(limit?: number) => DomainPrice[]` | Get cheapest by renewal |
| `getUnrestrictedTlds` | `() => DomainPrice[]` | TLDs without restrictions |
| `getRestrictedTlds` | `() => DomainPrice[]` | TLDs with restrictions |
| `getPrivacyEnabledTlds` | `() => DomainPrice[]` | TLDs with privacy support |
| `getIdnEnabledTlds` | `() => DomainPrice[]` | TLDs with IDN support |
| `calculateTotalCost` | `(tld: string, years: number) => number \| undefined` | Calculate N-year total cost |
| `getRawData` | `() => DomainPricesData` | Get raw data object |
| `fetchPrices` | `(url: string) => Promise<void>` | Fetch prices from URL and update data |
| `fromUrl` | `static (url: string) => Promise<DomainPricesService>` | Create instance from URL |

### SearchOptions

| Option | Type | Description |
|--------|------|-------------|
| `maxRegisterPrice` | `number` | Max registration price |
| `maxRenewPrice` | `number` | Max renewal price |
| `maxTransferPrice` | `number` | Max transfer price |
| `privacy` | `boolean` | Filter by privacy support |
| `idn` | `boolean` | Filter by IDN support |
| `hasRestrictions` | `boolean` | Filter by restrictions |
| `usage` | `string` | Filter by usage category (partial match) |

### DomainPrice Interface

```typescript
interface DomainPrice {
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
```
