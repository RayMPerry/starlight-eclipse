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
    WITHDRAW = 'withdraw'
}

export interface MessageMapping {
    [key: string]: string
}

export interface HandlerMapping {
    [key: string]: Function | Function[]
}
