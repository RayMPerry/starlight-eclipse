import Discord from 'discord.js';
import { checkEconomy, messageHandlerMapping, throwSpareChange, createNewClaimPassword, speakAs } from './functions';
import { commandAliases } from './constants';
import { BotCommand } from './types';

const { prefix, token } = require('../config.json');
const client = new Discord.Client();

client.once('ready', () => {
    createNewClaimPassword(6);

    console.log('Moons remaining: %s', checkEconomy());
    console.log(`Logged in as ${client.user.tag}.`);
});

client.on('message', message => {
    throwSpareChange(message);
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/) || [''];
    const command = args.shift().toLowerCase();

    if (command === BotCommand.SPEAK_AS) return speakAs(client, message, args);

    let commandsToRun = messageHandlerMapping[commandAliases[command] || command];

    commandsToRun = Array.isArray(commandsToRun) ? commandsToRun : [commandsToRun];
    if (!commandsToRun.every(commandToRun => typeof commandToRun === 'function')) return;

    commandsToRun.forEach(command => {
        if (!command) return;
        command(message, args);
    });
});

client.login(token);

