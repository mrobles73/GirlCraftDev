const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { LOG_PREFIX, setBirthday } = require('../../utils/botutils.js');
const moment = require('moment-timezone');
const cron = require('node-cron');
const { channels } = require('../../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('birthday')
		.setDescription("Set or remove your birthday")
        .addSubcommand(subcommand => 
            subcommand
                .setName('set')
                .setDescription('Set your birthday')
                .addIntegerOption(option => option.setName('day').setDescription('Day (1-31)').setRequired(true).setMaxValue(31).setMinValue(1))
                .addIntegerOption(option => option.setName('month').setDescription('Month (1-12)').setRequired(true).setMaxValue(12).setMinValue(1))
                .addStringOption(option => option.setName('timezone').setDescription('Time zone, default: America/Los_Angeles')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Removes your birthday')),
	async execute(interaction) {
        const targetUser = interaction.user;
        
        if(interaction.options.getSubcommand() === 'set') {               
            const day = interaction.options.getInteger('day');
            const month = interaction.options.getInteger('month');
            const timezone = interaction.options.getString('timezone') ?? 'America/Los_Angeles';

            const thirty = new Set([4, 6, 9, 11]);
            if((thirty.has(month) && day > 30) || (month === 2 && day > 29)) {
                return interaction.reply({ content:`Day and month combination of ${day}/${month} is not valid`, ephemeral: true});
            }
            if(!moment.tz.names().includes(timezone)) {
                return interaction.reply({ content:`Time zone of ${timezone} is not valid, format/default: America/Los_Angeles`, ephemeral: true});
            }

            const birthdayChannel = interaction.guild.channels.cache.get(channels.birthday);
            const result = await setBirthday(targetUser.id, day, month, timezone, true, birthdayChannel);
            if(result) {
                return interaction.reply({ content:`Setting birthday of ${targetUser.username} to ${day}/${month}`, ephemeral: true});
            } else {
                return interaction.reply({ content:`Unable to set your birthday, please try again or contact an admin`, ephemeral: true});
            }  
        } else if(interaction.options.getSubcommand() === 'remove') {

            await setBirthday(targetUser.id, null, null);
            await interaction.reply({ content:`Removing your birthday, your username is ${targetUser.username}`, ephemeral: true});

        } 
	},
};