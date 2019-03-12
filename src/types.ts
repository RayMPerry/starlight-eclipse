export enum BotCommand {
    PING = 'hello',
    THUMBS_UP = 'thumbsup',
    BALANCE = 'balance',
    GET_TIME = 'time',
    DONATE = 'give',
    ECONOMY = 'moons'
}

export interface MessageMapping {
    [key: string]: string
}

export interface HandlerMapping {
    [key: string]: Function | Function[]
}
