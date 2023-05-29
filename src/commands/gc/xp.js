const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { LOG_PREFIX, addXP } = require('../../utils/botutils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('xp')
		.setDescription("Add or remove xp of selected user")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand => 
            subcommand
                .setName('add')
                .setDescription('Adds xp to user')
                .addIntegerOption(option => option.setName('xp').setDescription('The xp to add').setRequired(true))
                .addUserOption(option => option.setName('target').setDescription('The user')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Removes xp from user')
                .addIntegerOption(option => option.setName('xp').setDescription('The xp to remove').setRequired(true))
                .addUserOption(option => option.setName('target').setDescription('The user'))),
	async execute(interaction) {
        const target = (interaction.options.getUser('target')) ? interaction.options.getUser('target') : interaction.user;
        const xp = interaction.options.getInteger('xp');
        if(interaction.options.getSubcommand() === 'add') {                            
            await interaction.reply({ content:`Adding ${xp} xp to ${target.username}`, ephemeral: true});
            await addXP(target.id, xp, interaction.guild, true);
            console.log(`${LOG_PREFIX.info} ${interaction.user.tag} gave ${target.tag} ${xp} xp`);
        } else if(interaction.options.getSubcommand() === 'remove') {
            await interaction.reply({ content:`Removing ${xp} xp from ${target.username}`, ephemeral: true});
            await addXP(target.id, xp*-1, interaction.guild, true);
            console.log(`${LOG_PREFIX.info} ${interaction.user.tag} removed ${xp} xp from ${target.tag} `);
        }
	},
};