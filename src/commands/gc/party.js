const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { LOG_PREFIX, party, isPartyStarting, setPartyStart, givePartyBonus, canStartParty, startParty } = require('../../utils/botutils.js');
const { channels } = require('../../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('party')
		.setDescription("Start or join a party")
        .addSubcommand(subcommand => 
            subcommand
                .setName('start')
                .setDescription('Start a party'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('join')
                .setDescription('Join a party')),
	async execute(interaction) {
        const partyChannel = interaction.guild.channels.cache.get(channels.party);
        if(interaction.options.getSubcommand() === 'start') { 
            if(!canStartParty()) {
                return interaction.reply({ content:`Already had a party today, try again tomorrow`, ephemeral: true});
            } else if(givePartyBonus()) {
                return interaction.reply({ content:`Party already started`, ephemeral: true});
            }      
            setPartyStart(true);
            party.set(interaction.user.id, interaction.user);
            setTimeout(async () => {
                let ats = '';
                party.forEach(member => ats+=`<@${member.id}> `);
                if(party.size > 4) {                    
                    await startParty(partyChannel, ats);
                } else {
                    //console.log('Party unable to start');
                    
                    const canceledEmbed = new EmbedBuilder()
                        .setColor('#D2C6E8')
                        .setDescription(`🙁 Party has been canceled\n\rTry again later`);
                    await partyChannel.send({ content: ats, embeds: [canceledEmbed] });
                    setPartyStart(false);
                    party.clear();
                }
            }, (60000 * 10));

            const startAttemptEmbed = new EmbedBuilder()
                .setColor('#D2C6E8')
                .setDescription(`<@${interaction.user.id}> is trying to start a party!🎉 5 Players are needed to start the party\n\rTo join the party use /party join\n\r*You have 10 minutes to join the party or party will be canceled*`);
            await partyChannel.send({ content: `@everyone`, embeds: [startAttemptEmbed] });

            await interaction.reply({ content:`Starting party in 10 minutes or when 5 members join`, ephemeral: true});

        } else if(interaction.options.getSubcommand() === 'join') {
            if(isPartyStarting()) {
                if(!party.has(interaction.user.id)) {
                    party.set(interaction.user.id, interaction.user);

                    const needed = (party.size > 4) ? 0 : 5-party.size;
                    const joinedEmbed = new EmbedBuilder()
                        .setColor('#D2C6E8')
                        .setDescription(`<@${interaction.user.id}> has joined the party🎉\n\r${needed} more players are needed`);
                    await partyChannel.send({ embeds: [joinedEmbed] });

                    if(party.size > 4) {
                        let ats = '';
                        party.forEach(member => ats+=`<@${member.id}> `);
                        await startParty(partyChannel, ats);
                    }
                    
                    await interaction.reply({ content:`Joining party`, ephemeral: true});
                } else {
                    await interaction.reply({ content:`Already joined the party`, ephemeral: true});
                }                
            } else {
                await interaction.reply({ content:`Unable to join party`, ephemeral: true});
            }            
        }        
	},
};