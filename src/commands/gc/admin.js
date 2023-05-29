const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { LOG_PREFIX, getUserStats, getBirthdays, setBirthday } = require('../../utils/botutils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('admin')
		.setDescription("Admin commands")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('birthdayremove')
                .setDescription("Removes selected member's birthday")
                .addUserOption(option => option.setName('member').setDescription('Member to remove it from').setRequired(true)))
        .addSubcommand(subcommand => 
            subcommand
                .setName('birthdaylist')
                .setDescription('List members that have added their birthday'))
        .addSubcommand(subcommand => 
            subcommand
                .setName('rank')
                .setDescription("Check a member's rank")
                .addUserOption(option => option.setName('member').setDescription('Member to check rank').setRequired(true))),
	async execute(interaction) {

        if(interaction.options.getSubcommand() === 'birthdayremove') {
            const targetMember = interaction.options.getUser('member');
            await setBirthday(targetMember.id, null, null);
            await interaction.reply({ content:`Removing birthday from user ${targetMember.username}`, ephemeral: true});
        } else if(interaction.options.getSubcommand() === 'birthdaylist') {
            const users = await getBirthdays();
            //console.log(users);
            let lines = ``;
            users.forEach(user => {
                lines += `${user.user_name}\n`
            });
            const birthdaysEmbed = new EmbedBuilder()
                .setColor('D2C6E8')
                .setTitle('Birthdays List')
                .setDescription(lines);
            
            await interaction.reply({ embeds: [birthdaysEmbed], ephemeral: true});

        } else if(interaction.options.getSubcommand() === 'rank') {
            const targetMember = interaction.options.getUser('member');
            const userStats = getUserStats(targetMember.id);
            const rankEmbed = new EmbedBuilder()
                .setColor('#770737')
                .setTitle(targetMember.username)
                .setDescription(`Rank #${userStats.index}\nLevel ${userStats.user.user_level}\n${userStats.user.user_xp} XP`);

            await interaction.reply({ embeds: [rankEmbed], ephemeral: true});
        }

	},
};