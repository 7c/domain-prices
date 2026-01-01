import { DomainPricesService, DomainPrice } from './DomainPrices'

describe('DomainPricesService', () => {
    let service: DomainPricesService

    beforeAll(() => {
        service = DomainPricesService.DYNADOT
    })

    describe('properties', () => {
        it('should return registrar name', () => {
            expect(service.registrar).toBe('dynadot')
        })

        it('should return updatedAt as a number', () => {
            expect(typeof service.updatedAt).toBe('number')
            expect(service.updatedAt).toBeGreaterThan(0)
        })

        it('should return updatedAtDate as a Date object', () => {
            expect(service.updatedAtDate).toBeInstanceOf(Date)
            expect(service.updatedAtDate.getTime()).toBe(service.updatedAt)
        })

        it('should return count of TLDs', () => {
            expect(service.count).toBeGreaterThan(0)
        })

        it('should return array of TLD names', () => {
            expect(Array.isArray(service.tlds)).toBe(true)
            expect(service.tlds.length).toBe(service.count)
            expect(service.tlds).toContain('com')
        })
    })

    describe('getPrice', () => {
        it('should return price for a valid TLD', () => {
            const price = service.getPrice('com')
            expect(price).toBeDefined()
            expect(price?.tld).toBe('com')
            expect(price?.currency).toBe('USD')
        })

        it('should handle TLD with leading dot', () => {
            const price = service.getPrice('.com')
            expect(price).toBeDefined()
            expect(price?.tld).toBe('com')
        })

        it('should return undefined for invalid TLD', () => {
            const price = service.getPrice('invalidtld12345')
            expect(price).toBeUndefined()
        })

        it('should have correct price structure', () => {
            const price = service.getPrice('com')!
            expect(typeof price.register_price).toBe('number')
            expect(typeof price.renew_price).toBe('number')
            expect(typeof price.transfer_price).toBe('number')
            expect(typeof price.restore_price).toBe('number')
            expect(typeof price.renew_grace_period).toBe('number')
            expect(typeof price.delete_grace_period).toBe('number')
            expect(typeof price.privacy).toBe('boolean')
            expect(typeof price.idn).toBe('boolean')
        })
    })

    describe('hasTld', () => {
        it('should return true for existing TLD', () => {
            expect(service.hasTld('com')).toBe(true)
            expect(service.hasTld('org')).toBe(true)
        })

        it('should return true for TLD with leading dot', () => {
            expect(service.hasTld('.com')).toBe(true)
        })

        it('should return false for non-existing TLD', () => {
            expect(service.hasTld('invalidtld12345')).toBe(false)
        })
    })

    describe('getAllPrices', () => {
        it('should return all prices as a record', () => {
            const prices = service.getAllPrices()
            expect(typeof prices).toBe('object')
            expect(prices['com']).toBeDefined()
        })
    })

    describe('getAllPricesArray', () => {
        it('should return all prices as an array', () => {
            const prices = service.getAllPricesArray()
            expect(Array.isArray(prices)).toBe(true)
            expect(prices.length).toBe(service.count)
        })
    })

    describe('search', () => {
        it('should filter by maxRegisterPrice', () => {
            const results = service.search({ maxRegisterPrice: 5 })
            expect(results.length).toBeGreaterThan(0)
            results.forEach(price => {
                expect(price.register_price).toBeLessThanOrEqual(5)
            })
        })

        it('should filter by maxRenewPrice', () => {
            const results = service.search({ maxRenewPrice: 10 })
            results.forEach(price => {
                expect(price.renew_price).toBeLessThanOrEqual(10)
            })
        })

        it('should filter by privacy', () => {
            const withPrivacy = service.search({ privacy: true })
            withPrivacy.forEach(price => {
                expect(price.privacy).toBe(true)
            })

            const withoutPrivacy = service.search({ privacy: false })
            withoutPrivacy.forEach(price => {
                expect(price.privacy).toBe(false)
            })
        })

        it('should filter by idn', () => {
            const withIdn = service.search({ idn: true })
            withIdn.forEach(price => {
                expect(price.idn).toBe(true)
            })
        })

        it('should filter by hasRestrictions', () => {
            const restricted = service.search({ hasRestrictions: true })
            restricted.forEach(price => {
                expect(price.restrictions).not.toBe(false)
            })

            const unrestricted = service.search({ hasRestrictions: false })
            unrestricted.forEach(price => {
                expect(price.restrictions).toBe(false)
            })
        })

        it('should filter by usage', () => {
            const results = service.search({ usage: 'General' })
            results.forEach(price => {
                expect(price.usage.toLowerCase()).toContain('general')
            })
        })

        it('should combine multiple filters', () => {
            const results = service.search({
                maxRegisterPrice: 20,
                privacy: true,
                hasRestrictions: false
            })
            results.forEach(price => {
                expect(price.register_price).toBeLessThanOrEqual(20)
                expect(price.privacy).toBe(true)
                expect(price.restrictions).toBe(false)
            })
        })
    })

    describe('getCheapestByRegistration', () => {
        it('should return TLDs sorted by registration price', () => {
            const cheapest = service.getCheapestByRegistration(5)
            expect(cheapest.length).toBe(5)
            for (let i = 1; i < cheapest.length; i++) {
                expect(cheapest[i].register_price).toBeGreaterThanOrEqual(cheapest[i - 1].register_price)
            }
        })

        it('should use default limit of 10', () => {
            const cheapest = service.getCheapestByRegistration()
            expect(cheapest.length).toBe(10)
        })
    })

    describe('getCheapestByRenewal', () => {
        it('should return TLDs sorted by renewal price', () => {
            const cheapest = service.getCheapestByRenewal(5)
            expect(cheapest.length).toBe(5)
            for (let i = 1; i < cheapest.length; i++) {
                expect(cheapest[i].renew_price).toBeGreaterThanOrEqual(cheapest[i - 1].renew_price)
            }
        })
    })

    


    describe('getUnrestrictedTlds', () => {
        it('should return only TLDs without restrictions', () => {
            const unrestricted = service.getUnrestrictedTlds()
            unrestricted.forEach(price => {
                expect(price.restrictions).toBe(false)
            })
        })
    })

    describe('getRestrictedTlds', () => {
        it('should return only TLDs with restrictions', () => {
            const restricted = service.getRestrictedTlds()
            restricted.forEach(price => {
                expect(price.restrictions).not.toBe(false)
                expect(typeof price.restrictions).toBe('string')
            })
        })
    })

    describe('getPrivacyEnabledTlds', () => {
        it('should return only TLDs with privacy support', () => {
            const privacyEnabled = service.getPrivacyEnabledTlds()
            privacyEnabled.forEach(price => {
                expect(price.privacy).toBe(true)
            })
        })
    })

    describe('getIdnEnabledTlds', () => {
        it('should return only TLDs with IDN support', () => {
            const idnEnabled = service.getIdnEnabledTlds()
            idnEnabled.forEach(price => {
                expect(price.idn).toBe(true)
            })
        })
    })

    describe('calculateTotalCost', () => {
        it('should calculate total cost for multiple years', () => {
            const comPrice = service.getPrice('com')!
            const totalCost = service.calculateTotalCost('com', 3)
            const expected = comPrice.register_price + 2 * comPrice.renew_price
            expect(totalCost).toBe(expected)
        })

        it('should return just registration price for 1 year', () => {
            const comPrice = service.getPrice('com')!
            const totalCost = service.calculateTotalCost('com', 1)
            expect(totalCost).toBe(comPrice.register_price)
        })

        it('should return 0 for 0 or negative years', () => {
            expect(service.calculateTotalCost('com', 0)).toBe(0)
            expect(service.calculateTotalCost('com', -1)).toBe(0)
        })

        it('should return undefined for invalid TLD', () => {
            expect(service.calculateTotalCost('invalidtld12345', 3)).toBeUndefined()
        })
    })

    describe('getRawData', () => {
        it('should return the raw data object', () => {
            const rawData = service.getRawData()
            expect(rawData).toBeDefined()
            expect(rawData.registrar).toBe('dynadot')
            expect(typeof rawData.updated).toBe('number')
            expect(typeof rawData.prices).toBe('object')
        })
    })

    describe('fetchPrices', () => {
        const REMOTE_URL = 'https://raw.githubusercontent.com/7c/domain-prices/refs/heads/main/data/dynadot.json'

        it('should fetch prices from URL and update internal data', async () => {
            const testService = new DomainPricesService()
            const initialCount = testService.count

            await testService.fetchPrices(REMOTE_URL)

            expect(testService.registrar).toBe('dynadot')
            expect(testService.count).toBeGreaterThan(0)
            expect(testService.hasTld('com')).toBe(true)
        }, 10000)

        it('should throw error for non-existent URL', async () => {
            const testService = new DomainPricesService()
            // Use a GitHub raw URL that will return 404
            await expect(testService.fetchPrices('https://raw.githubusercontent.com/7c/domain-prices/refs/heads/main/non-existent-file.json'))
                .rejects.toThrow()
        }, 10000)
    })

    describe('fromUrl', () => {
        const REMOTE_URL = 'https://raw.githubusercontent.com/7c/domain-prices/refs/heads/main/data/dynadot.json'

        it('should create a new instance from URL', async () => {
            const remoteService = await DomainPricesService.fromUrl(REMOTE_URL)

            expect(remoteService).toBeInstanceOf(DomainPricesService)
            expect(remoteService.registrar).toBe('dynadot')
            expect(remoteService.count).toBeGreaterThan(0)
        }, 10000)

        it('should have working methods after creation from URL', async () => {
            const remoteService = await DomainPricesService.fromUrl(REMOTE_URL)

            const comPrice = remoteService.getPrice('com')
            expect(comPrice).toBeDefined()
            expect(comPrice?.tld).toBe('com')
            expect(comPrice?.currency).toBe('USD')
            expect(typeof comPrice?.register_price).toBe('number')

            const cheapest = remoteService.getCheapestByRegistration(5)
            expect(cheapest.length).toBe(5)
        }, 10000)

        it('should throw error for non-existent URL', async () => {
            // Use a GitHub raw URL that will return 404
            await expect(DomainPricesService.fromUrl('https://raw.githubusercontent.com/7c/domain-prices/refs/heads/main/non-existent-file.json'))
                .rejects.toThrow()
        }, 10000)
    })
})
