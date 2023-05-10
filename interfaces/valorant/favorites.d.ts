declare module ValorantFavorites {
    export interface FavoritedContent {
        FavoriteID: string
        ItemID: string
    }
}

interface ValorantFavorites {
    Subject: string
    FavoritedContent: { [ItemID: string]: ValorantFavorites.FavoritedContent }
}
