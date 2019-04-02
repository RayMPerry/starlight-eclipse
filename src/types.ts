export enum BotCommand {
    PING = 'hello',
    THUMBS_UP = 'thumbsup',
    BALANCE = 'balance',
    GET_TIME = 'time',
    DONATE = 'give',
    ECONOMY = 'roses',
    DAILY = 'daily',
    ROB = 'rob',
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
    CLAIM = 'claim',
    SHOP = 'shop',
    ADD_SHOP_ITEM = 'additem',
    BUY_SHOP_ITEM = 'buyitem',
    SPEAK_AS = 'speak',
    CURSE = 'curse',
    UNCURSE = 'uncurse'
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
    stock?: number,
    cost: number,
    color?: string,
    roleId?: string
}

export interface MessageMapping {
    [key: string]: string
}

export interface HandlerMapping {
    [key: string]: Function | Function[]
}
