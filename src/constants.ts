import { BotCommand, MessageMapping } from './types';

export const DAY_IN_MILLIS = 1000 * 60 * 60 * 24;

export const TSUNDERE_CHANCE = 0.3;
export const STARTING_ECONOMY = 1000000;
export const DAILY_MOON_AMOUNT = 100;
export const THEFT_CHANCE = 0.6;
export const GOTTEM_CHANCE = 0.45;
export const CLEAN_HOUSE_CHANCE = 0.1;
export const THEFT_PENALTY = 0.15;
export const SPARE_CHANGE_LIMIT = 50;
export const SPARE_CHANGE_AMOUNT = 35;

// Allowed channels for spare change
export const ALLOWED_CHANNELS = [
    'space-lounge'
];

export const metaMessages: MessageMapping = {
    invalidCommand: 'Sorry, I don\'t understand that.',
    notEnoughMoons: 'There are no more moons to claim.',
    souredEconomy: '**THE ECONOMY HAS SOURED.**',
    spareChange: `Type \`>c​l​a​i​m %s\` to get %s free :waning_crescent_moon:.`,
    claimedChange: `You have claimed %s :waning_crescent_moon:.`,
    alreadyClaimedChange: 'Sorry! Already claimed!',
    expiredChange: 'No-one claimed these moons!',
    shopListing: 'Here are all the items you can buy!',
    addedNewItem: 'Successfully created new shop item: %s',
    alreadyHaveItem: 'Sorry! You already have this role!',
    boughtNewItem: 'You bought %s!'
};

export const normalMessages: MessageMapping = {
    hello: 'Hello!',
    balance: 'You have %s :waning_crescent_moon: and %s in the bank.',
    insufficientFunds: 'Oops! You do not have enough :waning_crescent_moon:.',
    transferredFunds: 'Successfully given %s %s :waning_crescent_moon:!',
    tooEarlyForDaily: 'You\'ve already claimed your daily bonus!',
    dailyBonus: 'Here\'s your %s :waning_crescent_moon:!',
    invalidTarget: 'Hmm. I don\'t see any easy marks.',
    attemptTheft: 'May Lady Luck smile upon you.',
    theftFailed: 'You got caught and got %s :waning_crescent_moon: confiscated.',
    theftSucceeded: 'A clean getaway! You stole %s :waning_crescent_moon: from %s!',
    stoleTheWallet: 'You took all of %s\'s :waning_crescent_moon:!',
    brokeTheBank: 'You took **EVERYONE\'s** :waning_crescent_moon: in the bank!',
    depositComplete: 'Successfully deposited %s :waning_crescent_moon:.',
    withdrawalComplete: 'Successfully withdrew %s :waning_crescent_moon:.'
};

export const tsundereMessages: MessageMapping = {
    hello: '...Hello, I guess.',
    balance: 'Tch. You probably have %s :waning_crescent_moon: and %s in the bank.',
    insufficientFunds: 'You don\'t even have enough :waning_crescent_moon:. Geez.',
    transferredFunds: '...Whatever. %s got their %s :waning_crescent_moon:.',
    tooEarlyForDaily: '... \*scoffs\*',
    dailyBonus: 'Here. %s :waning_crescent_moon:. Now, go away.',
    invalidTarget: 'Hmm. I don\'t see any easy marks...',
    attemptTheft: 'May Lady Luck smile upon you.',
    theftFailed: 'You got caught, you dummy! You lost %s :waning_crescent_moon:.',
    theftSucceeded: 'A clean getaway! You stole %s :waning_crescent_moon: from %s!',
    stoleTheWallet: 'You took all of %s\'s :waning_crescent_moon:!',
    brokeTheBank: 'You took **EVERYONE\'s** :waning_crescent_moon: in the bank!',
    depositComplete: 'Successfully deposited %s :waning_crescent_moon:.',
    withdrawalComplete: 'Successfully withdrew %s :waning_crescent_moon:.'
};

export const helpMessages: MessageMapping = {
    [BotCommand.ROB]: `\`${BotCommand.ROB} <person to rob | 'all'>\``,
    [BotCommand.DONATE]: `\`${BotCommand.DONATE} <amount to give> <person to give>\``,
    [BotCommand.DEPOSIT]: `\`${BotCommand.DEPOSIT} <amount to deposit>\``,
    [BotCommand.WITHDRAW]: `\`${BotCommand.WITHDRAW} <amount to withdraw>\``
};

export const commandAliases: MessageMapping = {
    bal: BotCommand.BALANCE,
    with: BotCommand.WITHDRAW,
    dep: BotCommand.DEPOSIT,
    add: BotCommand.ADD_SHOP_ITEM,
    buy: BotCommand.BUY_SHOP_ITEM
};
