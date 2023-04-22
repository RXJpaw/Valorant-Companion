declare module ValorantStoreStorefront {
    export interface FeaturedBundleBundleItemsItem {
        ItemTypeID: string
        ItemID: string
        Amount: number
    }
    export interface FeaturedBundleBundleItems {
        Item: FeaturedBundleBundleItemsItem
        BasePrice: number
        CurrencyID: string
        DiscountPercent: number
        DiscountedPrice: number
        IsPromoItem: boolean
    }
    export interface FeaturedBundleBundle {
        ID: string
        DataAssetID: string
        CurrencyID: string
        Items: FeaturedBundleBundleItems[]
        ItemOffers?: any
        TotalBaseCost?: any
        TotalDiscountedCost?: any
        TotalDiscountPercent: number
        DurationRemainingInSeconds: number
        WholesaleOnly: boolean
    }
    export interface FeaturedBundleBundlesItemsItem {
        ItemTypeID: string
        ItemID: string
        Amount: number
    }
    export interface FeaturedBundleBundlesItems {
        Item: FeaturedBundleBundlesItemsItem
        BasePrice: number
        CurrencyID: string
        DiscountPercent: number
        DiscountedPrice: number
        IsPromoItem: boolean
    }
    export interface FeaturedBundleBundlesItemOffersOfferCost {
        '85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741': number
    }
    export interface FeaturedBundleBundlesItemOffersOfferRewards {
        ItemTypeID: string
        ItemID: string
        Quantity: number
    }
    export interface FeaturedBundleBundlesItemOffersOffer {
        OfferID: string
        IsDirectPurchase: boolean
        StartDate: string
        Cost: FeaturedBundleBundlesItemOffersOfferCost
        Rewards: FeaturedBundleBundlesItemOffersOfferRewards[]
    }
    export interface FeaturedBundleBundlesItemOffersDiscountedCost {
        '85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741': number
    }
    export interface FeaturedBundleBundlesItemOffers {
        BundleItemOfferID: string
        Offer: FeaturedBundleBundlesItemOffersOffer
        DiscountPercent: number
        DiscountedCost: FeaturedBundleBundlesItemOffersDiscountedCost
    }
    export interface FeaturedBundleBundlesTotalBaseCost {
        '85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741': number
    }
    export interface FeaturedBundleBundlesTotalDiscountedCost {
        '85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741': number
    }
    export interface FeaturedBundleBundles {
        ID: string
        DataAssetID: string
        CurrencyID: string
        Items: FeaturedBundleBundlesItems[]
        ItemOffers: FeaturedBundleBundlesItemOffers[]
        TotalBaseCost: FeaturedBundleBundlesTotalBaseCost
        TotalDiscountedCost: FeaturedBundleBundlesTotalDiscountedCost
        TotalDiscountPercent: number
        DurationRemainingInSeconds: number
        WholesaleOnly: boolean
    }
    export interface FeaturedBundle {
        Bundle: FeaturedBundleBundle
        Bundles: FeaturedBundleBundles[]
        BundleRemainingDurationInSeconds: number
    }
    export interface SkinsPanelLayoutSingleItemStoreOffersCost {
        '85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741': number
    }
    export interface SkinsPanelLayoutSingleItemStoreOffersRewards {
        ItemTypeID: string
        ItemID: string
        Quantity: number
    }
    export interface SkinsPanelLayoutSingleItemStoreOffers {
        OfferID: string
        IsDirectPurchase: boolean
        StartDate: string
        Cost: SkinsPanelLayoutSingleItemStoreOffersCost
        Rewards: SkinsPanelLayoutSingleItemStoreOffersRewards[]
    }
    export interface SkinsPanelLayout {
        SingleItemOffers: string[]
        SingleItemStoreOffers: SkinsPanelLayoutSingleItemStoreOffers[]
        SingleItemOffersRemainingDurationInSeconds: number
    }
    export interface UpgradeCurrencyStoreUpgradeCurrencyOffersOfferCost {
        '85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741': number
    }
    export interface UpgradeCurrencyStoreUpgradeCurrencyOffersOfferRewards {
        ItemTypeID: string
        ItemID: string
        Quantity: number
    }
    export interface UpgradeCurrencyStoreUpgradeCurrencyOffersOffer {
        OfferID: string
        IsDirectPurchase: boolean
        StartDate: string
        Cost: UpgradeCurrencyStoreUpgradeCurrencyOffersOfferCost
        Rewards: UpgradeCurrencyStoreUpgradeCurrencyOffersOfferRewards[]
    }
    export interface UpgradeCurrencyStoreUpgradeCurrencyOffers {
        OfferID: string
        StorefrontItemID: string
        Offer: UpgradeCurrencyStoreUpgradeCurrencyOffersOffer
    }
    export interface UpgradeCurrencyStore {
        UpgradeCurrencyOffers: UpgradeCurrencyStoreUpgradeCurrencyOffers[]
    }
    export interface BonusStoreBonusStoreOffersOfferCost {
        '85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741': number
    }
    export interface BonusStoreBonusStoreOffersOfferRewards {
        ItemTypeID: string
        ItemID: string
        Quantity: number
    }
    export interface BonusStoreBonusStoreOffersOffer {
        OfferID: string
        IsDirectPurchase: boolean
        StartDate: string
        Cost: BonusStoreBonusStoreOffersOfferCost
        Rewards: BonusStoreBonusStoreOffersOfferRewards[]
    }
    export interface BonusStoreBonusStoreOffersDiscountCosts {
        '85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741': number
    }
    export interface BonusStoreBonusStoreOffers {
        BonusOfferID: string
        Offer: BonusStoreBonusStoreOffersOffer
        DiscountPercent: number
        DiscountCosts: BonusStoreBonusStoreOffersDiscountCosts
        IsSeen: boolean
    }
    export interface BonusStore {
        BonusStoreOffers: BonusStoreBonusStoreOffers[]
        BonusStoreRemainingDurationInSeconds: number
    }
}

interface ValorantStoreStorefront {
    FeaturedBundle: ValorantStoreStorefront.FeaturedBundle
    SkinsPanelLayout: ValorantStoreStorefront.SkinsPanelLayout
    UpgradeCurrencyStore: ValorantStoreStorefront.UpgradeCurrencyStore
    BonusStore?: ValorantStoreStorefront.BonusStore | undefined
}
