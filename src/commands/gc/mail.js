const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { channels } = require('../../../config.json');
const { LOG_PREFIX, addXP } = require('../../utils/botutils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mail')
		.setDescription("Send mail")
		.addUserOption(option => option.setName('member').setDescription('Member to send mail to').setRequired(true))
        .addStringOption(option => option.setName('server').setDescription('Where mail was sent').setRequired(true).addChoices({ name: 'Lobby', value: 'Lobby' }, { name: 'Survival', value: 'Survival server' }))
        .addBooleanOption(option => option.setName('anonymous').setDescription('Whether or not recipient sees your name')),
	async execute(interaction) {
        const mailChannel = interaction.guild.channels.cache.get(channels.mail);
        const member = interaction.options.getUser('member');
        const server = interaction.options.getString('server');
        const anonymous = interaction.options.getBoolean('anonymous') ?? false;
        const sender = anonymous ? 'Anonymous' : interaction.user.username;

        console.log(member + " " + server + " " + anonymous);

        const thanks = new ButtonBuilder()
            .setCustomId('thanks')
            .setLabel('Send thanks 💐')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder()
            .addComponents(thanks);

        const mailEmbed = new EmbedBuilder()
            .setColor('#D2C6E8')
            .setDescription(`You have received mail! 💌\nCheck your mailbox in the ${server}\n\rSender: ${sender}`)

        const response = await mailChannel.send({ content: `${member}`, embeds: [mailEmbed], components:[row]});
        await interaction.reply({ content:`Mail sent`, ephemeral: true});

        //console.log(response);

        const collectorFilter = i => i.user.id === member.id;
        try {
            const thanksConfirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 * 10});
            if(thanksConfirmation.customId === 'thanks') {                
                await interaction.editReply({ content: `<@${interaction.user.id}> Thank you for sending mail, You have received 20 Xp points!`});
                await thanksConfirmation.reply({ content: `Thank you sent`, ephemeral: true });
                await addXP(interaction.user.id, 20, interaction.guild, true);
            }
        } catch (e) {
            console.log('Not sending thank you message');
        }
	},
};