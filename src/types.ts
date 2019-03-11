export enum BotCommand {
    PING = 'hello',
    THUMBS_UP = 'thumbsup',
    BALANCE = 'balance',
    GET_TIME = 'time'
}

export interface HandlerMapping {
    [key: string]: Function | Function[]
}
