import { format } from 'util';
import { writeFile } from 'fs';
import { Message, Attachment } from 'discord.js';
import { BotCommand, HandlerMapping } from './types';
import { metaMessages, normalMessages, tsundereMessages } from './constants';

const balances = require('./data/balances.json');

// Utility functions

export const isTsundere = () => Math.random() >= 0.7;

export const invalidCommand = (message: any) => {
    message.reply(metaMessages.invalidCommand);
};

export const pingBack = (message: Message) => {
    const response = isTsundere()
        ? tsundereMessages['hello']
        : normalMessages['hello']

    message.reply(response);
};

export const getSenderInfo = (message: Message) => {
    console.log('Member Name: %s', message.member.displayName);
    console.log('Member ID: %s', message.member.id);
};

// Currency functions

export const getBalance = (message: Message) => {
    const response = isTsundere()
        ? tsundereMessages['balance']
        : normalMessages['balance'];

    const balance = balances[message.member.id];

    if (balance == null) {
        balances[message.member.id] = 0;
        writeFile(__dirname + '/data/balances.json', JSON.stringify(balances), 'utf8', error => {
            console.error('[getBalance] There was an error writing the balances: ', error);
        });
    }

    message.reply(format(response, balance || 0));
};

// Silly functions

export const thumbsUp = (message: Message) => {
    const attachment = new Attachment(__dirname + '/assets/thumbs_up.gif');
    message.channel.send(attachment);
};

export const messageHandlerMapping: HandlerMapping = {
    [BotCommand.PING]: pingBack,
    [BotCommand.THUMBS_UP]: thumbsUp,
    [BotCommand.BALANCE]: getBalance
};
