import { BotCommand, HandlerMapping } from './types';
import { metaMessages, normalMessages, tsundereMessages } from './constants';

export const isTsundere = () => Math.random() >= 0.7;

export const invalidCommand = (message: any) => {
    message.reply(metaMessages.invalidCommand);
};

export const pingBack = (botCommandType: BotCommand) => (message: any) => {
    const response = isTsundere()
        ? tsundereMessages[botCommandType + '.hello']
        : normalMessages[botCommandType + '.hello']

    message.reply(response);
};

export const messageHandlerMapping: HandlerMapping = {
    [BotCommand.PING]: pingBack(BotCommand.PING)
};
