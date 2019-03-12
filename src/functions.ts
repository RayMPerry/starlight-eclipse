import { format } from 'util';
import { writeFile } from 'fs';
import { Message, Attachment } from 'discord.js';
import { BotCommand, HandlerMapping } from './types';
import {
    STARTING_ECONOMY,
    metaMessages,
    normalMessages,
    tsundereMessages,
    helpMessages
} from './constants';

const balances = require('./data/balances.json');
let remainingMoons = STARTING_ECONOMY;

// Utility functions

export const isTsundere = () => Math.random() >= 0.7;
export const createResponse = (key: string): string => isTsundere() ? tsundereMessages[key] : normalMessages[key];

export const invalidCommand = (message: any) => {
    message.reply(metaMessages.invalidCommand);
};

export const pingBack = (message: Message) => {
    message.reply(createResponse('hello'));
};

export const getSenderInfo = (message: Message) => {
    console.log('Member Name: %s', message.member.displayName);
    console.log('Member ID: %s', message.member.id);
};

export const getCurrentTime = (message: Message) => {
    const currentDate = new Date();
    message.channel.send(format('It is %s where I am.', currentDate.toLocaleString('en-US')));
};

// Currency functions

export const saveAllBalances = () => {
    writeFile(__dirname + '/data/balances.json', JSON.stringify(balances), 'utf8', error => {
        if (!error) return;
        console.error('[getBalance] There was an error writing the balances: ', error);
    });
};

export const checkEconomy = (): number => {
    remainingMoons = Object.keys(balances)
        .reduce((_remainingMoons, memberId) => {
            _remainingMoons -= balances[memberId];
            return _remainingMoons;
        }, STARTING_ECONOMY);

    return remainingMoons;
};

export const getCurrentEconomy = (message: Message) => {
    if (remainingMoons < 0) {
        message.channel.send(metaMessages.souredEconomy);
    } else {
        message.channel.send(format('There are %s unclaimed :waning_crescent_moon:s left.', remainingMoons));
    }
    return;
};

export const getBalance = (message: Message) => {
    const currentBalance = balances[message.member.id];

    if (currentBalance == null) {
        balances[message.member.id] = 0;
        saveAllBalances();
    }

    message.reply(format(createResponse('balance'), currentBalance || 0));
};

export const donateMoons = (message: Message, args: any[]) => {
    const currentBalance = balances[message.member.id];
    const donationAmount = Number(args[0]);
    const otherPersonId = (args[1] || '').match(/\d+/);

    // Dumb errors
    if (donationAmount !== donationAmount || !otherPersonId) {
        message.channel.send(helpMessages[BotCommand.DONATE]);
        return;
    }

    // Valid errors
    if (currentBalance <= 0 || currentBalance < donationAmount) {
        message.reply(createResponse('insufficientFunds'));
        return;
    }

    balances[message.member.id] -= donationAmount;
    balances[otherPersonId] = balances[otherPersonId] || 0;
    balances[otherPersonId] += donationAmount;

    message.channel.send(format(createResponse('transferredFunds'), `<@${otherPersonId}>`, donationAmount));
    saveAllBalances();
    return;
};

// Silly functions

export const thumbsUp = (message: Message) => {
    const attachment = new Attachment(__dirname + '/assets/thumbs_up.gif');
    message.channel.send(attachment);
};

// Exported mapping

export const messageHandlerMapping: HandlerMapping = {
    [BotCommand.PING]: pingBack,
    [BotCommand.GET_TIME]: getCurrentTime,
    [BotCommand.THUMBS_UP]: thumbsUp,
    [BotCommand.BALANCE]: getBalance,
    [BotCommand.DONATE]: donateMoons,
    [BotCommand.ECONOMY]: getCurrentEconomy
};
