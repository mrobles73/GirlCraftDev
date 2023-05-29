const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { LOG_PREFIX, votes } = require('../../utils/botutils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('topmotm')
		.setDescription("Display last month vote results")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
        if(votes.size === 0) {
            await interaction.reply({ content:`There are no votes for previous month`, ephemeral: true});   
        } else {
            let userNameValues = "";
		    let voteValues = "";
            votes.sort((userA, userB) => userB.votes - userA.votes);
            let t3 = votes.first(3);
            t3.forEach((user, index) => {
                const member = interaction.guild.members.cache.get(user.user_id);
                userNameValues += `**${index+1}.** ${member.user.username}\n`;
                voteValues += `${user.votes}\n`;
            });

            const topVotesEmbed = new EmbedBuilder()
                .setColor('#D2C6E8')
                .setTitle('Most Votes')
                .addFields(
                    { name: 'Top 3', value: userNameValues, inline: true },
                    { name: 'Votes', value: voteValues, inline: true},
                );
            await interaction.reply({ embeds:[topVotesEmbed], ephemeral: true});
        }          
	},
};