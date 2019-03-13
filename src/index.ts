import Discord from 'discord.js';
import { checkEconomy, messageHandlerMapping, throwSpareChange } from './functions';

const { prefix, token } = require('../config.json');
const client = new Discord.Client();

client.once('ready', () => {
    console.log('Moons remaining: %s', checkEconomy());
    console.log(`Logged in as ${client.user.tag}.`);
});

client.on('message', message => {
    throwSpareChange(message);
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/) || [''];
    const command = args.shift().toLowerCase();

    let commandsToRun = messageHandlerMapping[command];

    if (!commandsToRun) return;

    commandsToRun = Array.isArray(commandsToRun) ? commandsToRun : [commandsToRun];
    commandsToRun.forEach(command => command(message, args));
});

client.login(token);

