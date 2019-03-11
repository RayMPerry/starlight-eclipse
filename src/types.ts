export enum BotCommand {
    PING = 'hello',
    THUMBS_UP = 'thumbsup',
    BALANCE = 'balance'
}

export interface HandlerMapping {
    [key: string]: Function | Function[]
}
