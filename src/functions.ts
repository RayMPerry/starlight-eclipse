import { BotCommand, HandlerMapping } from './types';

export const isTsundere = () => Math.random() >= 0.7;

export const pingBack = (message: any) => {
    const response = isTsundere()
        ? '...Hello, I guess.'
        : 'Hello!';

    message.reply(response);
};

export const messageHandlerMapping: HandlerMapping = {
    [BotCommand.PING]: pingBack
};
