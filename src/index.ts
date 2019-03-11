import Discord from 'discord.js';
import { BotCommand } from './types';
import { messageHandlerMapping } from './functions';

const { prefix, token } = require('../config.json');
const client = new Discord.Client();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}.`);
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(' ') || [''];
    const command = args.shift().toLowerCase();

    messageHandlerMapping[command](message, args);
});

client.login(token);

