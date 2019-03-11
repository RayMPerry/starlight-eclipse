import { BotCommand } from './types';

export const metaMessages = {
    invalidCommand: "Sorry, I don't understand that."
};

export const normalMessages = {
    [BotCommand.PING + '.hello']: 'Hello!'
};

export const tsundereMessages = {
    [BotCommand.PING + '.hello']: '...Hello, I guess.'
}
