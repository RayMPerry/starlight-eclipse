import { BotCommand, MessageMapping } from './types';

export const STARTING_ECONOMY = 1000000;

export const metaMessages: MessageMapping = {
    invalidCommand: 'Sorry, I don\'t understand that.',
    souredEconomy: '**THE ECONOMY HAS SOURED.**'
};

export const normalMessages: MessageMapping = {
    hello: 'Hello!',
    balance: 'You have %s :waning_crescent_moon:.',
    insufficientFunds: 'Oops! You do not have enough :waning_crescent_moon:.',
    transferredFunds: 'Successfully given %s %s :waning_crescent_moon:!'
};

export const tsundereMessages: MessageMapping = {
    hello: '...Hello, I guess.',
    balance: 'Tch. You probably have %s :waning_crescent_moon:.',
    insufficientFunds: 'You don\'t even have enough :waning_crescent_moon:. Geez.',
    transferredFunds: '...Whatever. %s got their %s :waning_crescent_moon:.'
}

export const helpMessages: MessageMapping = {
    [BotCommand.DONATE]: `\`${BotCommand.DONATE} <amount to give> <person to give>\``
}
