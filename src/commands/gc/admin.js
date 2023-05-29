const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { LOG_PREFIX, setBirthday } = require('../../utils/botutils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('admin')
		.setDescription("Admin commands")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('birthdayremove')
                .setDescription("Removes selected member's birthday")
                .addUserOption(option => option.setName('member').setDescription('Member to remove it from').setRequired(true))),
	async execute(interaction) {

        if(interaction.options.getSubcommand() === 'birthdayremove') { //error checks?
            const targetMember = interaction.options.getUser('member');
            await setBirthday(targetMember.id, null, null);
            await interaction.reply({ content:`Removing birthday from user ${targetMember.username}`, ephemeral: true});
        }

	},
};