export enum BotCommand {
    PING = 'hello'
}

export interface HandlerMapping {
    [key: string]: Function
}
