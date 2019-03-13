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
}

export enum EmbedColor {
    INFO = 0x1346b5,
    FAILURE = 0xb51346,
    SUCCESS = 0x46b513
}

export interface MessageMapping {
    [key: string]: string
}

export interface HandlerMapping {
    [key: string]: Function | Function[]
}
