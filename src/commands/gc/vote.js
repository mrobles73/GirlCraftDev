const { SlashCommandBuilder } = require('discord.js');
const { LOG_PREFIX, voteForMember } = require('../../utils/botutils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vote')
		.setDescription("Vote for member")        
        .addUserOption(option => option.setName('member').setDescription('Member to vote for').setRequired(true)),
	async execute(interaction) {
        const voteRecipient = interaction.options.getUser('member');
        if(interaction.user.id === voteRecipient.id) {
            await interaction.reply({ content:`Sorry but you can't vote for yourself`, ephemeral: true});
        } else {
            let result = await voteForMember(voteRecipient.id, interaction.user.id, interaction);
            await interaction.reply({ content:`${result} ${voteRecipient.username}`, ephemeral: true});
        }           
	},
};