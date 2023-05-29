const { Events, EmbedBuilder } = require('discord.js');
const BotUtils = require('../utils/botutils.js');
const { devGuildId, channels, roles } = require('../../config.json');


const ready = {
    name: Events.ClientReady,
	once: true,
	async execute(client) {
        await BotUtils.initializeDBData(client.guilds.cache.get(devGuildId));
        BotUtils.initializeCronJobs();
        BotUtils.initializeWeekly();
        BotUtils.initializeMonthlyVotes();
		console.log(`${BotUtils.LOG_PREFIX.info} Logged in as ${client.user.tag}`);
	},
};

const interactionCreate = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if(!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
        if(!command) {
            console.error(`${BotUtils.LOG_PREFIX.error} No command matching ${interaction.commandName} was found`);
            return;
        }
        
        try {
            //checks here for channel and user?
            if((interaction.commandName === 'rank' || interaction.commandName === 'leaderboard') && (interaction.channel.id != channels.ranks)) {
                return interaction.reply({ content:'Please use this command in the ranks channel', ephemeral: true});
            }

            if(!interaction.user.bot) {
                let online = (interaction.member.presence) ? interaction.member.presence.status==='online' : false;
                await BotUtils.giveXP(interaction.user, online ? 'command' : 'offline-command', interaction.guild);
            }  
            await command.execute(interaction);                      
        } catch (error) {
            console.error(`${BotUtils.LOG_PREFIX.error} Error executing ${interaction.commandName}`);
            console.error(BotUtils.LOG_PREFIX.error, error);
            if(interaction.replied || interaction.deferred) {
                await interaction.followUp({content: 'There was an error while executing this command!', ephemeral: true });            
            } else {
                await interaction.reply({ content: 'There was an error while execution this command!', ephemeral: true});
            }
        }
    }
}

const messageCreate = {
    name: Events.MessageCreate,
    async execute(message) {
        if(message.author.bot) return;

        //console.log(message.type);
        // if((message.type > 7 && message.type < 12) || message.type === 19) {

        //     const channel = message.guild.channels.cache.get(channels.welcome);

        //     const boostEmbed = new EmbedBuilder()
        //         .setColor('#e9d0e8')
        //         .setDescription(`⋆⁺₊ Thank you for boosting the server! ₊⁺⋆
                
        //         ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆
        //         **Huge thank you from the GirlCraft Team!**
                
        //         **Rewards**
        //         🥀 250 XP
        //         🥀 @Booster Role
        //         ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆`);
            
        //     await message.member.roles.add(roles.booster);
        //     await BotUtils.addXP(message.author.id, 250, message.guild, true);
        //     await channel.send({ content: `<@${message.author.id}>`, embeds: [boostEmbed] });

        // }

        // if(message.channelId === channels.party && message.attachments.size > 0) {
        //     if(message.attachments.every(BotUtils.isAtchGif)) {
        //         console.log('message contains a gif');
        //     }

        //     console.log('message has attachment');
        // }

        if(message.channelId === channels.party && BotUtils.givePartyBonus() && BotUtils.party.has(message.author.id)) {
            if(BotUtils.emotes(message.content)) {
                //console.log(BotUtils.emotes(message.content.size));
                await BotUtils.addXP(message.author.id, 5, message.guild, true);
            }
        }
        
        let online = (message.member.presence) ? message.member.presence.status==='online' : false;
        await BotUtils.giveXP(message.author, online ? 'message' : 'offline-message', message.guild);
    }
}

const messageReactionAdd = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        if(reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error(`${BotUtils.LOG_PREFIX.error} Reaction to a message that might have been removed`);
                return; //?
            }
        }
        
        const member = reaction.message.guild.members.cache.get(user.id);
        let online = (member.presence) ? member.presence.status==='online' : false;
        await BotUtils.giveXP(user, online ? 'reaction' : 'offline-reaction', reaction.message.guild);
    }
}

const voiceStateUpdate = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        if(newState.member.user.bot) return;

        if(newState.channel && !oldState.channel) { //user connects to channel
            console.log(`${BotUtils.LOG_PREFIX.debug} ${newState.member.user.tag} connected to ${newState.channel.name}.`);
            let usersInChannel = newState.channel.members.size;
            const [bots, users] = newState.channel.members.partition(member => member.user.bot);
            if(users.size === 2) {
                users.forEach(member => {
                    if(BotUtils.correctVCStatus(member.voice)){
                        let online = (member.presence) ? member.presence.status==='online' : false;
                        BotUtils.startInterval(member.user.id, online, newState.guild);
                    }                         
                })
            } else if(users.size > 2 && BotUtils.correctVCStatus(newState)) {
                let online = (newState.member.presence) ? newState.member.presence.status==='online' : false;
                BotUtils.startInterval(newState.member.user.id, online, newState.guild);
            }
        } else if(oldState.channel && !newState.channel) { //user disconnects from channel
            console.log(`${BotUtils.LOG_PREFIX.debug} ${oldState.member.user.tag} disconnected from ${oldState.channel.name}.`);
            BotUtils.clearVCInterval(oldState.member.user.id);
            const [bots, users] = oldState.channel.members.partition(member => member.user.bot);
            if(users.size === 1) {
                BotUtils.clearVCInterval(users.first().user.id);
            }

        } else if(newState.channel) { //mute or deafen event
            if(!BotUtils.correctVCStatus(newState)) {
                BotUtils.clearVCInterval(newState.member.user.id);
            } else {
                const [bots, users] = newState.channel.members.partition(member => member.user.bot);
                if(users.size > 1 && BotUtils.correctVCStatus(newState)) {
                    const online = (newState.member.presence) ? newState.member.presence.status==='online' : false;
                    BotUtils.startInterval(newState.member.user.id, online, newState.guild);
                }
            }
        }
        
    }
}

const presenceUpdate = {
    name: Events.PresenceUpdate,
    async execute(oldPresence, newPresence) {
        const member = newPresence.member;
        if(member.voice.channel) {
            const [bots, users] = member.voice.channel.members.partition(member => member.user.bot);
            if(users.size > 1 && BotUtils.correctVCStatus(member.voice)){
                const online = newPresence.status === 'online' || false;
                BotUtils.clearVCInterval(member.user.id);
                BotUtils.startInterval(member.user.id, online, member.voice.guild);
            } else if(!BotUtils.correctVCStatus(member.voice) || users.size < 2) {
                BotUtils.clearVCInterval(member.user.id);
            }
        }        
    }
}

const guildMemberAdd = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const guildChannels = member.guild.channels;
        const welcomeChannel = guildChannels.cache.get(channels.welcome);

        const rulebook = guildChannels.cache.get(channels.rulebook);
        const aboutChannel = guildChannels.cache.get(channels.about);
        const applyChannel = guildChannels.cache.get(channels.apply);

        const welcomeEmbed = new EmbedBuilder()
            .setColor('#e9d0e8')
            .setTitle(`⋆⁺₊ **Welcome to GirlCraft!** ₊⁺⋆`)
			.setAuthor({ name: `﹒${member.user.tag} ﹒` })
            .setDescription(`﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆
            
            🌟 ﹒ ${rulebook} please read the rules before chatting!
            🌟 ﹒ ${aboutChannel} learn more about what GirlCraft is about!
            🌟 ﹒ ${applyChannel} apply to get verified and access the rest of the server.
            
            ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆`)
            .setThumbnail(member.user.displayAvatarURL({ format: 'png', dynamic: true }))
            .setFooter({ text: `You're member ${member.guild.memberCount}!` });

        welcomeChannel.send({ content: `Hey <@${member.user.id}>!`, embeds: [welcomeEmbed] });

    }
}

const guildMemberUpdate = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
        const oldStatus = oldMember.premiumSince;
        const newStatus = newMember.premiumSince;

        if(!oldStatus && newStatus) {
            console.log(`${newMember.user.tag} has boosted the server!`);
        }

        if(oldStatus && !newStatus) { //if twice in a row?
            //await newMember.roles.remove(roles.booster);
            console.log(`${newMember.user.tag} has unboosted the server`);
        }
    }
}

const events = [
    ready,
    interactionCreate,
    messageCreate,
    messageReactionAdd,
    voiceStateUpdate,
    presenceUpdate,
    guildMemberAdd,
    guildMemberUpdate
];

module.exports = {
    events
}