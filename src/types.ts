export enum BotCommand {
    PING = 'hello',
    THUMBS_UP = 'thumbsup',
    BALANCE = 'balance',
    GET_TIME = 'time',
    DONATE = 'give',
    ECONOMY = 'moons',
    DAILY = 'daily',
    ROB = 'rob',
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
    CLAIM = 'claim',
    SHOP = 'shop',
    ADD_SHOP_ITEM = 'additem',
}

export enum EmbedColor {
    INFO = 0x1346b5,
    FAILURE = 0xb51346,
    SUCCESS = 0x46b513
}

export interface ShopItem {
    id: number,
    displayName: string,
    displayIcon?: string,
    description: string,
    stock?: number
}

export interface MessageMapping {
    [key: string]: string
}

export interface HandlerMapping {
    [key: string]: Function | Function[]
}
