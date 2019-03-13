import { randomBytes } from 'crypto';
import { format } from 'util';
import { writeFile } from 'fs';
import { Message, Attachment, RichEmbed, TextChannel } from 'discord.js';
import { BotCommand, HandlerMapping, EmbedColor, ShopItem } from './types';
import {
    metaMessages,
    normalMessages,
    tsundereMessages,
    helpMessages,
    STARTING_ECONOMY,
    DAILY_MOON_AMOUNT,
    DAY_IN_MILLIS,
    TSUNDERE_CHANCE,
    THEFT_CHANCE,
    GOTTEM_CHANCE,
    CLEAN_HOUSE_CHANCE,
    THEFT_PENALTY,
    SPARE_CHANGE_LIMIT,
    SPARE_CHANGE_AMOUNT,
    ALLOWED_CHANNELS
} from './constants';

const balances = require('./data/balances.json');
const dailies = require('./data/dailies.json');
const bank = require('./data/bank.json');
const shop = require('./data/shop.json');
const inventories = require('./data/inventories.json');

let remainingMoons = STARTING_ECONOMY;
let spareChangeCounter = SPARE_CHANGE_LIMIT;
let spareChangeAmount: number = null;
let spareChangeMessage: Message = null;
let spareChangeTimeout: NodeJS.Timeout = null;
let spareChangePassword: string = null;
let lastSpareChangeClaim: number = null;

const createEmbed = (embedColor: EmbedColor) => (senderName: string, message: string): RichEmbed => {
    const infoEmbed = new RichEmbed()
        .setTitle(senderName)
        .setColor(embedColor)
        .setDescription(message);

    return infoEmbed;
}

const createInfoEmbed = createEmbed(EmbedColor.INFO);
const createFailureEmbed = createEmbed(EmbedColor.FAILURE);
const createSuccessEmbed = createEmbed(EmbedColor.SUCCESS);

// Utility functions

export const isTsundere = () => Math.random() <= TSUNDERE_CHANCE;
export const createResponse = (key: string): string => isTsundere() ? tsundereMessages[key] : normalMessages[key];

export const invalidCommand = (message: any) => {
    const response = createFailureEmbed(message.member.user.tag, metaMessages.invalidCommand);
    message.channel.send(response);
};

export const pingBack = (message: Message) => {
    const response = createInfoEmbed(message.member.user.tag, createResponse('hello'));
    message.channel.send(response);
};

export const getSenderInfo = (message: Message) => {
    console.log('Member Name: %s', message.member.displayName);
    console.log('Member ID: %s', message.member.id);
};

export const getCurrentTime = (message: Message) => {
    const currentDate = new Date();
    const response = createInfoEmbed(message.member.user.tag, format('It is %s where I am.', currentDate.toLocaleString('en-US')));
    message.channel.send(response);
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
export const saveAllInventories = () => saveJson('inventories', inventories);
export const saveTheBank = () => saveJson('bank', bank);
export const saveTheShop = () => saveJson('shop', shop);

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
    let response = null;

    if (remainingMoons < 0) {
        response = createFailureEmbed(message.member.user.tag, metaMessages.souredEconomy);
        message.channel.send(response);
    } else {
        response = createInfoEmbed(message.member.user.tag, format('There are %s unclaimed :waning_crescent_moon:s left.', remainingMoons));
        message.channel.send(response);
    }
    return;
};

export const ensureBankAndBalances = (message: Message) => {
    if (!balances[message.member.id]) {
        balances[message.member.id] = 0;
        saveAllBalances();
    }

    if (!bank[message.member.id]) {
        bank[message.member.id] = 0;
        saveTheBank();
    }
};

export const getBalance = (message: Message) => {
    const currentWalletBalance = balances[message.member.id];
    const currentBankBalance = bank[message.member.id];

    const response = createInfoEmbed(message.member.user.tag, format(createResponse('balance'), currentWalletBalance || 0, currentBankBalance || 0));
    message.channel.send(response);
};

export const donateMoons = (message: Message, args: any[]) => {
    const currentBalance = balances[message.member.id];
    const donationAmount = Number(args[0]);
    const otherPerson = (args[1] || '').match(/\d+/);

    // Dumb errors
    if (donationAmount !== donationAmount || !otherPerson) {
        const response = createInfoEmbed(message.member.user.tag, helpMessages[BotCommand.DONATE]);
        message.channel.send(response);
        return;
    }

    const otherPersonId = otherPerson.shift();

    // Valid errors
    if (currentBalance <= 0 || currentBalance < donationAmount) {
        const response = createFailureEmbed(message.member.user.tag, createResponse('insufficientFunds'));
        message.channel.send(response);
        return;
    }

    balances[message.member.id] -= donationAmount;
    balances[otherPersonId] = balances[otherPersonId] || 0;
    balances[otherPersonId] += donationAmount;

    const response = createSuccessEmbed(message.member.user.tag, format(createResponse('transferredFunds'), `<@${otherPersonId}>`, donationAmount));
    message.channel.send(response);
    saveAllBalances();
    return;
};

export const robMoons = (message: Message, args: string[]) => {
    const theftTarget = args[0] || '';
    let otherPersonId = null;

    if (balances[message.member.id] < DAILY_MOON_AMOUNT) {
        const response = createFailureEmbed(message.member.user.tag, createResponse('insufficientFunds'));
        message.channel.send(response);
        return;
    }

    if (!theftTarget) {
        const response = createInfoEmbed(message.member.user.tag, helpMessages[BotCommand.ROB]);
        message.channel.send(response);
        return;
    }

    if (theftTarget === 'all') {
        // Rob everyone.
        // message.reply(createResponse('attemptTheft'));
        if (Math.random() >= THEFT_CHANCE || Math.random() >= CLEAN_HOUSE_CHANCE) {
            const lostMoons = Math.ceil(THEFT_PENALTY * balances[message.member.id]);
            message.channel.send(createFailureEmbed(message.member.user.tag, format(createResponse('theftFailed'), lostMoons)));
            balances[message.member.id] -= lostMoons;
            remainingMoons += lostMoons;
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

        message.channel.send(createSuccessEmbed(message.member.user.tag, createResponse('brokeTheBank')));

        return;

    } else {
        otherPersonId = theftTarget.match(/\d+/).shift();
        if (message.member.id === otherPersonId || balances[otherPersonId] == null || balances[otherPersonId] <= 0) {
            message.channel.send(createInfoEmbed(message.member.user.tag, createResponse('invalidTarget')));
            return;
        }

        if (Math.random() >= THEFT_CHANCE) {
            const lostMoons = Math.ceil(THEFT_PENALTY * balances[message.member.id]);
            message.channel.send(createFailureEmbed(message.member.user.tag, format(createResponse('theftFailed'), lostMoons)));
            balances[message.member.id] -= lostMoons;
            remainingMoons += lostMoons;
            saveAllBalances();
            return;
        }

        let stolenAmount = 0;

        if (Math.random() <= GOTTEM_CHANCE) {
            stolenAmount = balances[otherPersonId];
            message.channel.send(createSuccessEmbed(message.member.user.tag, format(createResponse('stoleTheWallet'), `<@${otherPersonId}>`)));
        } else {
            stolenAmount = Math.ceil(Math.random() * 0.5 * balances[otherPersonId]);
            message.channel.send(createSuccessEmbed(message.member.user.tag, format(createResponse('theftSucceeded'), stolenAmount, `<@${otherPersonId}>`)));
        }

        balances[otherPersonId] -= stolenAmount;
        balances[message.member.id] += stolenAmount;
        saveAllBalances();
    }

    return;
};

export const makeBankTransaction = (transactionMode: BotCommand.DEPOSIT | BotCommand.WITHDRAW) => (message: Message, args: string[]) => {
    const fundingSource = transactionMode === BotCommand.DEPOSIT
        ? balances
        : bank;

    const transactionAmount = args[0] === 'all'
        ? fundingSource[message.member.id]
        : Number(args[0]);

    if (transactionAmount !== transactionAmount) {
        const response = createInfoEmbed(message.member.user.tag, helpMessages[transactionMode]);
        message.channel.send(response);
        return;
    }

    if (transactionAmount > fundingSource[message.member.id]) {
        const response = createFailureEmbed(message.member.user.tag, createResponse('insufficientFunds'));
        message.channel.send(response);
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

    const response = createSuccessEmbed(message.member.user.tag, format(createResponse(transactionMode === BotCommand.DEPOSIT ? 'depositComplete' : 'withdrawalComplete'), transactionAmount));
    message.channel.send(response);
    return;
};

export const makeDeposit = makeBankTransaction(BotCommand.DEPOSIT);
export const makeWithdrawal = makeBankTransaction(BotCommand.WITHDRAW);

export const displayShopItems = (message: Message) => {
    const response = createInfoEmbed('Starlight Shop', 'Here are the items you can buy: ');
    shop.slice(0, 20).forEach((shopItem: ShopItem) => {
        const itemListing = `[**${shopItem.id}**] ${shopItem.description} *(${shopItem.cost} :waning_crescent_moon:)*`;
        response.addField(shopItem.displayName, itemListing);
    });

    if (!shop.length) response.addField('Thin Air', `It's all around you! (Free!)`);
    message.channel.send(response);
};

export const addItemToShop = (message: Message, args: string[]) => {
    if (args.length < 2) return;

    const shopItem: ShopItem = {
        id: shop.length + 1,
        displayName: args[0],
        description: args.slice(1).join(' '),
        stock: 1,
        cost: 100
    };

    // Modify displayIcon and stock here.

    shop.push(shopItem);
    saveTheShop();

    const response = createSuccessEmbed(message.member.user.tag, format(metaMessages.addedNewItem, args[0]));
    message.channel.send(response);
};

// All following functions must conform to the global economy.

export const dailyBonus = (message: Message) => {
    if (remainingMoons <= 0) {
        message.channel.send(createInfoEmbed(message.member.user.tag, metaMessages.notEnoughMoons));
        return;
    }

    if (Date.now() - dailies[message.member.id] < DAY_IN_MILLIS) {
        const response = createFailureEmbed(message.member.user.tag, createResponse('tooEarlyForDaily'));
        message.channel.send(response);
        return;
    }

    const dailyAmount = remainingMoons < DAILY_MOON_AMOUNT
        ? remainingMoons
        : DAILY_MOON_AMOUNT;

    dailies[message.member.id] = Date.now();
    saveAllDailies();

    balances[message.member.id] = balances[message.member.id] || 0;
    balances[message.member.id] += dailyAmount;
    remainingMoons -= dailyAmount;
    saveAllBalances();
    message.channel.send(createSuccessEmbed(message.member.user.tag, format(createResponse('dailyBonus'), dailyAmount)));
};

export const createNewClaimPassword = (length: number): string => {
    const newPassword = randomBytes((Math.ceil(length * 3) / 4))
        .toString('base64')
        .slice(0, length)
        .replace(/\+|\//g, '0');

    spareChangePassword = newPassword;

    return newPassword;
};

export const throwSpareChange = (message: Message) => {
    const currentChannelName = (message.channel as TextChannel).name;
    if (remainingMoons < SPARE_CHANGE_AMOUNT || !ALLOWED_CHANNELS.includes(currentChannelName) || spareChangeMessage) return;
    spareChangeCounter -= 1;
    if (spareChangeCounter > 0 || spareChangeTimeout != null) return;

    spareChangeAmount = Math.ceil(Math.random() * SPARE_CHANGE_AMOUNT);

    const setSpareChangeMessage = (message: Message) => {
        const response = createInfoEmbed('Free moons!', format(metaMessages.spareChange, spareChangePassword, spareChangeAmount))
            .setImage('https://thumbs.gfycat.com/YawningPersonalEasteuropeanshepherd-max-1mb.gif');

        message.channel.send(response)
            .then(message => {
                if (Array.isArray(message)) return;
                spareChangeMessage = message;
            });
    };

    clearTimeout(spareChangeTimeout);
    spareChangeTimeout = setTimeout(setSpareChangeMessage.bind(null, message), 5000);
}

export const claimSpareChange = (message: Message, args: string[]) => {
    if (!args.length || args[0] !== spareChangePassword) return;
    if (spareChangeMessage) {
        const response = createSuccessEmbed(message.member.user.tag, format(metaMessages.claimedChange, spareChangeAmount));
        spareChangeMessage.edit(response);
        spareChangeCounter = SPARE_CHANGE_LIMIT;
        spareChangeTimeout = null;
        spareChangeMessage = null;
        createNewClaimPassword(6);
        lastSpareChangeClaim = Date.now();

        remainingMoons -= spareChangeAmount;
        balances[message.member.id] += spareChangeAmount;
        spareChangeAmount = null;

        saveAllBalances();
    } else if (Date.now() - lastSpareChangeClaim < 60000) {
        const response = createFailureEmbed(message.member.user.tag, metaMessages.alreadyClaimedChange);
        message.channel.send(response);
    }

    return;
}

// Silly functions

export const thumbsUp = (message: Message) => {
    const attachment = new Attachment(__dirname + '/assets/thumbs_up.gif');
    message.channel.send(attachment);
};

// Exported mappings

export const messageHandlerMapping: HandlerMapping = {
    [BotCommand.PING]: pingBack,
    [BotCommand.GET_TIME]: getCurrentTime,
    [BotCommand.THUMBS_UP]: thumbsUp,
    [BotCommand.BALANCE]: [ensureBankAndBalances, getBalance],
    [BotCommand.DONATE]: [ensureBankAndBalances, donateMoons],
    [BotCommand.ECONOMY]: getCurrentEconomy,
    [BotCommand.DAILY]: [ensureBankAndBalances, dailyBonus],
    [BotCommand.ROB]: [ensureBankAndBalances, robMoons],
    [BotCommand.DEPOSIT]: [ensureBankAndBalances, makeDeposit],
    [BotCommand.WITHDRAW]: [ensureBankAndBalances, makeWithdrawal],
    [BotCommand.CLAIM]: [ensureBankAndBalances, claimSpareChange],
    [BotCommand.SHOP]: displayShopItems,
    [BotCommand.ADD_SHOP_ITEM]: addItemToShop
};

