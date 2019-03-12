import { format } from 'util';
import { writeFile } from 'fs';
import { Message, Attachment } from 'discord.js';
import { BotCommand, HandlerMapping } from './types';
import {
    STARTING_ECONOMY,
    metaMessages,
    normalMessages,
    tsundereMessages,
    helpMessages,
    DAILY_MOON_AMOUNT,
    DAY_IN_MILLIS,
    TSUNDERE_CHANCE,
    THEFT_CHANCE,
    GOTTEM_CHANCE,
    CLEAN_HOUSE_CHANCE,
    THEFT_PENALTY
} from './constants';

const balances = require('./data/balances.json');
const dailies = require('./data/dailies.json');
const bank = require('./data/bank.json');
let remainingMoons = STARTING_ECONOMY;

// Utility functions

export const isTsundere = () => Math.random() <= TSUNDERE_CHANCE;
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

export const saveJson = (name: string, data: any) => {
    writeFile(__dirname + `/data/${name}.json`, JSON.stringify(data), 'utf8', error => {
        if (!error) return;
        console.error('[saveJson] There was an error writing the ${name}: ', error);
    });
};

export const saveAllBalances = () => saveJson('balances', balances);
export const saveAllDailies = () => saveJson('dailies', dailies);
export const saveTheBank = () => saveJson('bank', bank);

export const checkEconomy = (): number => {
    const walletMoons = Object.keys(balances)
        .reduce((_walletMoons, memberId) => {
            _walletMoons += balances[memberId];
            return _walletMoons;
        }, 0);

    const bankMoons = Object.keys(bank)
        .reduce((_bankMoons, memberId) => {
            _bankMoons += bank[memberId];
            return _bankMoons;
        }, 0);

    remainingMoons = STARTING_ECONOMY - walletMoons - bankMoons;

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
    const currentWalletBalance = balances[message.member.id];
    const currentBankBalance = bank[message.member.id];

    if (currentWalletBalance == null) {
        balances[message.member.id] = 0;
        saveAllBalances();
    }

    if (currentBankBalance == null) {
        bank[message.member.id] = 0;
        saveTheBank();
    }

    message.reply(format(createResponse('balance'), currentWalletBalance || 0, currentBankBalance || 0));
};

export const donateMoons = (message: Message, args: any[]) => {
    const currentBalance = balances[message.member.id];
    const donationAmount = Number(args[0]);
    const otherPerson = (args[1] || '').match(/\d+/);

    // Dumb errors
    if (donationAmount !== donationAmount || !otherPerson) {
        message.channel.send(helpMessages[BotCommand.DONATE]);
        return;
    }

    const otherPersonId = otherPerson.shift();

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

export const robMoons = (message: Message, args: string[]) => {
    const theftTarget = args[0] || '';
    let otherPersonId = null;

    if (balances[message.member.id] < DAILY_MOON_AMOUNT) {
        message.reply(createResponse('insufficientFunds'));
        return;
    }

    if (!theftTarget) {
        message.channel.send(helpMessages[BotCommand.ROB]);
        return;
    }

    if (theftTarget === 'all') {
        // Rob everyone.
        message.reply(createResponse('attemptTheft'));
        if (Math.random() >= THEFT_CHANCE || Math.random() >= CLEAN_HOUSE_CHANCE) {
            const lostMoons = Math.ceil(THEFT_PENALTY * balances[message.member.id]);
            message.reply(format(createResponse('theftFailed'), lostMoons));
            balances[message.member.id] -= lostMoons
            saveAllBalances();
            return;
        }

        Object.keys(bank).forEach(memberId => {
            const stolenAmount = bank[memberId];
            bank[memberId] -= stolenAmount;
            balances[message.member.id] += stolenAmount;
        });

        saveAllBalances()
        saveTheBank();

        message.reply(createResponse('brokeTheBank'));

        return;

    } else {
        otherPersonId = theftTarget.match(/\d+/).shift();
        if (message.member.id === otherPersonId || balances[otherPersonId] == null || balances[otherPersonId] <= 0) {
            message.reply(createResponse('invalidTarget'));
            return;
        }

        message.reply(createResponse('attemptTheft'));
        if (Math.random() >= THEFT_CHANCE) {
            const lostMoons = Math.ceil(THEFT_PENALTY * balances[message.member.id]);
            message.reply(format(createResponse('theftFailed'), lostMoons));
            balances[message.member.id] -= lostMoons
            saveAllBalances();
            return;
        }

        let stolenAmount = 0;

        if (Math.random() <= GOTTEM_CHANCE) {
            stolenAmount = balances[otherPersonId];
            message.reply(format(createResponse('stoleTheWallet'), `<@${otherPersonId}>`));
        } else {
            stolenAmount = Math.ceil(Math.random() * 0.5 * balances[otherPersonId]);
            message.reply(format(createResponse('theftSucceeded'), stolenAmount, `<@${otherPersonId}>`));
        }

        balances[otherPersonId] -= stolenAmount;
        balances[message.member.id] += stolenAmount;
        saveAllBalances();
    }

    return;
};

export const makeBankTransaction = (transactionMode: BotCommand.DEPOSIT | BotCommand.WITHDRAW) => (message: Message, args: string[]) => {
    const transactionAmount = args[0] === 'all'
        ? balances[message.member.id]
        : Number(args[0]);

    if (transactionAmount !== transactionAmount) {
        message.channel.send(helpMessages[transactionMode]);
        return;
    }

    const fundingSource = transactionMode === BotCommand.DEPOSIT
        ? balances
        : bank;

    if (transactionAmount > fundingSource[message.member.id]) {
        message.reply(createResponse('insufficientFunds'));
        return;
    }

    balances[message.member.id] += transactionMode === BotCommand.DEPOSIT
        ? -transactionAmount
        : transactionAmount;
    bank[message.member.id] += transactionMode === BotCommand.DEPOSIT
        ? transactionAmount
        : -transactionAmount;

    saveAllBalances();
    saveTheBank();

    message.reply(format(createResponse(transactionMode === BotCommand.DEPOSIT ? 'depositComplete' : 'withdrawalComplete'), transactionAmount));
    return;
};

export const makeDeposit = makeBankTransaction(BotCommand.DEPOSIT);
export const makeWithdrawal = makeBankTransaction(BotCommand.WITHDRAW);

// All following functions must conform to the global economy.

export const dailyBonus = (message: Message) => {
    if (remainingMoons <= 0) {
        message.channel.send(metaMessages.notEnoughMoons);
        return;
    }

    if (Date.now() - dailies[message.member.id] < DAY_IN_MILLIS) {
        message.reply(createResponse('tooEarlyForDaily'));
        return;
    }

    const dailyAmount = remainingMoons < DAILY_MOON_AMOUNT
        ? remainingMoons
        : DAILY_MOON_AMOUNT;

    dailies[message.member.id] = Date.now();
    saveAllDailies();

    balances[message.member.id] = balances[message.member.id] || 0;
    balances[message.member.id] += dailyAmount;
    saveAllBalances();
    message.reply(format(createResponse('dailyBonus'), dailyAmount));
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
    [BotCommand.ECONOMY]: getCurrentEconomy,
    [BotCommand.DAILY]: dailyBonus,
    [BotCommand.ROB]: robMoons,
    [BotCommand.DEPOSIT]: makeDeposit,
    [BotCommand.WITHDRAW]: makeWithdrawal
};
