const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { LOG_PREFIX, setBirthday } = require('../../utils/botutils.js');
const { channels, owners } = require('../../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('whitelist')
		.setDescription("Whitelist command")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => option.setName('member').setDescription('Whitelisted member').setRequired(true)),
	async execute(interaction) {
        

        if(interaction.user.id === owners[1]) {        
            const targetMember = interaction.options.getUser('member');   

            const aboutServerChannel = interaction.guild.channels.cache.get(channels.aboutserver);
            const whitelistEmbed = new EmbedBuilder()
                .setColor('#D2C6E8')
                .setDescription(`﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ \nYou have been Whitelisted :lotus: :potted_plant:\n\rIP is in the ${aboutServerChannel} Channel\n﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆`);

            const channel = interaction.guild.channels.cache.get(channels.whitelist);
            await channel.send({ content: `<@${targetMember.id}>`, embeds: [whitelistEmbed] });
            await interaction.reply({ content:`Whitelist message for ${targetMember.username} has been sent`, ephemeral: true});
        } else {
            await interaction.reply({ content:`You can't use this command`, ephemeral: true});
        }


	},
};