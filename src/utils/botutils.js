// const { Op } = require('sequelize');
const { Users, XPWinner, Votes, Voters } = require('./dbutils.js');
const { Collection, EmbedBuilder } = require('discord.js');
const cron = require('node-cron');
const { botTag, channels, roles, roleNames, xpAmounts } = require('../../config.json');

/* Util constants and fields */
//change this so it uses another identifier?
const LOG_PREFIX = {info:`${botTag}-INFO:`, error:`${botTag}-ERROR:`, warning:`${botTag}-WARNING:`, debug:`${botTag}-DEBUG:`};
const VC_XP_TIME = 300000;
const RANKS = [100, 1000, 4000, 8000, 12000];
const userxp = new Collection();
const xpWinners = new Collection();
const votes = new Collection();
const xpCooldown = new Collection();
const hugCooldown = new Collection();
const boopCooldown = new Collection();
const highFiveCooldown = new Collection();
const flowerCooldown = new Collection();
const fCooldowns = { 'hug':hugCooldown, 'boop':boopCooldown, 'high five':highFiveCooldown, 'flower':flowerCooldown };
const birthdayTasks = new Map();
let intervalIds = {};
let doublePoints = false;

const party = new Collection();
let partyStart = false;
let partyBonus = false;
let partiesStarted = 0;

const initializeDBData = async (guild) => {
    const storedUsers = await Users.findAll();
    storedUsers.forEach(u => userxp.set(u.user_id, u));

    const storedWinners = await XPWinner.findAll();
    if(storedWinners.length > 0) 
        storedWinners.forEach(u => xpWinners.set(u.user_id, u));

    const storedVotes = await Votes.findAll();
    if(storedVotes.length > 0)
        storedVotes.forEach(u => votes.set(u.user_id, u));

    const birthdays = userxp.filter(user => user.birthday != null);
    birthdays.forEach(user => {
        const task = cron.schedule(`0 1 ${user.birthday} ${user.birthmonth} *`, async () => { // 0 0 doesn't work
            await birthdayMessage(user.user_id, guild);
            await addXP(user.user_id, 250, guild, true);
        }, {
            scheduled: true,
            timezone: user.timezone
        });
        birthdayTasks.set(user.user_id, task);
    });
}

const initializeCronJobs = () => {
    cron.schedule('0 0 0 * * *', () => {
        console.log(`${LOG_PREFIX.info} Resetting daily party limit`);
        partiesStarted = 0;
    }, {
        scheduled: true,
        timezone: 'America/Los_Angeles'
    })
}

const initializeWeekly = () => {
    cron.schedule('0 0 * * 0', async () => {
        console.log(`${LOG_PREFIX.info} Resetting weekly xp to 0`);
        
        userxp.sort((userA, userB) => userB.weekly_xp - userA.weekly_xp);
        const topThree = userxp.first(3);
        
        if(xpWinners.size > 0) {
            for(let i=0; i<3; i++) {
                const tuser = topThree.at(i);
                xpWinners.at(i).user_id = tuser.user_id;
                xpWinners.at(i).weekly_xp = tuser.weekly_xp;
                await xpWinners.at(i).save();
            }
        } else {
            for(let i=0; i<3; i++) {
                const user = topThree.at(i);
                const newWinner = await XPWinner.create({ id:i+1, user_id: user.user_id, weekly_xp:user.weekly_xp });
                xpWinners.set(user.user_id, newWinner);
            }
        }

        userxp.forEach(async user => {
            user.weekly_xp = 0;
            await user.save();
        });
    }, {
        scheduled: true,
        timezone: 'America/Los_Angeles'
    });
}

const initializeMonthlyVotes = () => {
    cron.schedule('0 0 1 * *', async () => {
        console.log(`${LOG_PREFIX.info} Counting and resetting monthly votes`);
        userxp.sort((userA, userB) => userB.votes - userA.votes);
        await Votes.destroy({ truncate: true });
        await Voters.destroy({ truncate: true });
        const t3 = userxp.first(3);
        t3.forEach(async user => {
            const votee = await Votes.create({ user_id: user.user_id, votes: user.votes });
            votes.set(votee.user_id, votee);
        });    
        userxp.forEach(async user => {
            if(user.votes > 0) {
                user.votes = 0;
                await user.save();
            }            
        });
    }, {
        scheduled: true,
        timezone: 'America/Los_Angeles'
    });
}

const giveXP = async (user, type, guild) => {
    //console.log(`${LOG_PREFIX.info} Giving ${user.tag} ${xpAmounts[type]} xp`);
    await addXP(user.id, xpAmounts[type], guild);
}

const addXP = async (id, amount, guild, manual) => {
    if(xpCooldown.has(id) && !manual) {
        //console.log(`${LOG_PREFIX.debug}  ${id} in xp cooldown`);
        return;
    }

    console.log(`${LOG_PREFIX.info}  ${id} getting ${amount} xp`);

    const user = userxp.get(id);

    if(doublePoints && !manual) {
        amount = Number(amount) * 2;
    }

    if(!xpCooldown.has(id)) { //maybe don't add cooldown if it's being manually added
        const timeout = setTimeout(() => {
            //console.log(`${LOG_PREFIX.debug}  ${id} is out of cooldown`);
            xpCooldown.delete(id);
        }, 10000);
        xpCooldown.set(id, { timer: timeout });
    }
    
    if(user) {
        user.user_xp += Number(amount);
        user.weekly_xp += Number(amount);

        //console.log(`${LOG_PREFIX.debug} ${id} Is ranking up: ${user.user_xp >= RANKS[user.user_rank]}`);

        if(user.user_xp >= RANKS[user.user_rank]) {
            //console.log(roles[RANKS[user.user_rank]]);
            const member = guild.members.cache.get(id);
            await member.roles.add(roles[RANKS[user.user_rank]]);
            if(user.user_rank != 0) {
                await member.roles.remove(roles[RANKS[user.user_rank-1]]);
            }            

            const channel = guild.channels.cache.get(channels.ranks);
            const rankUpEmbed = new EmbedBuilder()
                .setColor('#D2C6E8')
                .setDescription(`:lotus: Congratulations! you have now leveled up to **${roleNames[user.user_rank]}**.\n\rOpen a ticket to get your rank changed in game.\n✧･ﾟ: ✧･ﾟ: 　 🌟 　 :･ﾟ✧:･ﾟ✧`);
            await channel.send({ content: `<@${id}>`, embeds: [rankUpEmbed] });
            console.log(`${LOG_PREFIX.info} Added role ${roleNames[user.user_rank]} to ${member.user.tag}`);

            user.user_rank += 1;
        } else if(user.user_rank != 0 && user.user_xp < RANKS[user.user_rank-1]) {
            const member = guild.members.cache.get(id);
            await member.roles.remove(roles[RANKS[user.user_rank-1]]);
            if(user.user_rank != 1) {
                await member.roles.add(roles[RANKS[user.user_rank-2]]);
            }            
            console.log(`${LOG_PREFIX.info} Removed role ${roleNames[user.user_rank-1]} from ${member.user.tag}`); //add previous role
            user.user_rank -= 1;   
        }

        if(user.user_xp >= ((user.user_level+1) * 1000)) {
            user.user_level++;
        } else if(user.user_level != 0 && user.user_xp < (user.user_level*1000)) {
            user.user_level--;
        }

        return user.save();
    }

    const member = guild.members.cache.get(id);
    const newUser = await Users.create({ user_id: id, user_name: member.user.username, user_avatar: member.user.displayAvatarURL({ format: 'png', dynamic: true }), user_xp: amount, weekly_xp: amount });
    userxp.set(id, newUser);
    return newUser;
}

const voteForMember = async (id, voterid, interaction) => {
    const [voter, created] = await Voters.findOrCreate({
        where: { user_id: voterid }
    });

    if(created) {
        await addVote(id);
        voter.votes = 1;
        voter.first_id = id;
        await voter.save();
        return 'Thank you for voting for';       
    } else {
        if(voter.votes === 1 && voter.first_id != id) {
            await addVote(id);
            voter.votes++;
            voter.second_id = id;
            await voter.save();
            return 'Thank you for voting for';    
        } else {
            if(voter.first_id === id || voter.second_id === id)
                return "You are unable to vote for";
            else 
                return "Your voting limit was reached, you are unable to vote for"
        }
    }
}

const addVote = async (id, interaction) => {
    const user = userxp.get(id);
    if(user) {
        user.votes++;
        await user.save();
        return true;
    }

    const member = interaction.guild.members.cache.get(id);
    const newUser = await Users.create({ user_id: id, user_name: member.user.username, user_avatar: member.user.displayAvatarURL({ format: 'png', dynamic: true }), votes: 1 });
    userxp.set(id, newUser);
    return true;
}

const getUserStats = (id) => {
    userxp.sort((userA, userB) => userB.user_xp - userA.user_xp);
	const uxpdata = userxp.toJSON();
    const userData = userxp.get(id);
    return { user:userData, index:uxpdata.indexOf(userData)+1 };
}

const setDoublePoints = (dpoints) => {
    doublePoints = dpoints;
}

const getBirthdays = async () => {
    return userxp.filter(user => user.birthday != null && user.birthmonth != null);
}

const setBirthday = async (id, day, month, timezone, schedule, guild) => {
    const user = userxp.get(id);

    if(user) {
        user.birthday = day;
        user.birthmonth = month;
        if(timezone) user.timezone = timezone;

        try {
            await user.save();
        } catch (error) {
            console.error(LOG_PREFIX.error, error);
            return false;
        }

        if(birthdayTasks.has(id)) {            
            let oldTask = birthdayTasks.get(id);
            oldTask.stop();
            oldTask = null;
            birthdayTasks.delete(id);
        }

        if(schedule) {
            const task = cron.schedule(`0 1 ${day} ${month} *`, async () => {
                await birthdayMessage(id, guild);
                await addXP(id, 250, guild, true);
            }, {
                scheduled: true,
                timezone: timezone
            });
            birthdayTasks.set(id, task);
        }

        return true;
    }
    // else create user or just don't add birthday
    return false;
    
}

const birthdayMessage = async (id, guild) => {
    const birthdayChannel = guild.channels.cache.get(channels.birthday);
    const member = guild.members.cache.get(id);

    await member.roles.add(roles.birthday);
    const timeoutTime = 60000 * 60 * 24;
    setTimeout(async () => await member.roles.remove(roles.birthday), timeoutTime);

    const birthdayEmbed = new EmbedBuilder()
        .setColor('#D2C6E8')
        .setTitle(`⋆⁺₊ Happy Birthday! ₊⁺⋆`)
        .setDescription(`From your friends at GirlCraft, we wish you a happy and enchanted fairytale birthday.\n\rYou will receive the Birthday role for the day and have 250 XP added!\n\rOpen a ticket to receive your birthday role and birthday quest for prizes in game! 🎁 🥳 🎂\n﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆`);
    
    await birthdayChannel.send({ content: `<@${member.id}>`, embeds: [birthdayEmbed] });
}


const hoursToMinutesFormat = (tMinutes) => {
    const hours = Math.floor(tMinutes / 60);
    const minutes = tMinutes % 60;

    let format = hours===1 ? `${hours} hour` : `${hours} hours`;
    format += (minutes > 0) ? ((minutes === 1) ? ` and ${minutes} minute` : ` and ${minutes} minutes`) : '';
    return format;
}

//voice channel helper methods
const correctVCStatus = (voiceState) => {
    return (voiceState.deaf || voiceState.mute) ? false : true;
} 

const startInterval = (userid, online, guild) => {
    if(!intervalIds[userid]) {
        console.log(`${LOG_PREFIX.debug} Setting user ${userid} interval`);
        intervalIds[userid] = setInterval(() => intervalAddXP(userid, online, guild), VC_XP_TIME);
    }
}

const intervalAddXP = async (id, online, guild) => { 
    console.log(`${LOG_PREFIX.info} Giving user ${id} ${xpAmounts[online ? "vc-point" : "offline-vc-point"]} xp`);
    await addXP(id, xpAmounts[online ? "vc-point" : "offline-vc-point"], guild);
}

const clearVCInterval = (intervalId) => {
    if(intervalIds[intervalId]) {
        //console.log(`${LOG_PREFIX.debug} Clearing user ${intervalId} interval`);
        clearInterval(intervalIds[intervalId]);
        delete intervalIds[intervalId];
    }    
}

const funCommandHandler = async (recipient, action, interaction, description) => {
    const cooldownCollection = fCooldowns[action.name];

    if(action.name != 'smile' && cooldownCollection.has(interaction.user.id)) {
        const cooldownTime = (action.name === 'high five') ? 'minute' : 'hour';
        await interaction.reply({ content:`This command has a cooldown of 1 ${cooldownTime}`, ephemeral: true});
    } else if(interaction.user.id === recipient.id) {
        if(action.name === 'flower') action.name = 'send a ' + action.name + ' to';
        await interaction.reply({ content:`Sorry but you can't ${action.name} yourself`, ephemeral: true});
    } else {

        const desc = description ?? `﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆\n${interaction.user} has sent you a ${action.name} ${action.emoji}\n﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆`;

        const actionEmbed = new EmbedBuilder()
                .setColor('#D2C6E8')
                .setDescription(desc);

        const channel = interaction.guild.channels.cache.get(channels.commands);
        await channel.send({ content: `<@${recipient.id}>`, embeds: [actionEmbed] });
        await interaction.reply({ content:`Sent a ${action.name} to ${recipient.username}`, ephemeral: true});

        if(action.name != 'smile') {
            const time = (action.name === 'high five') ? 60000 : 3600000;
            const timeout = setTimeout(() => cooldownCollection.delete(interaction.user.id), time);
            cooldownCollection.set(interaction.user.id, { timer:timeout });
        }
    }
}

const isPartyStarting = () => {
    return partyStart;
}

const setPartyStart = (started) => {
    partyStart = started;
}

const givePartyBonus = () => {
    return partyBonus;
}

const setPartyBonus = (bonus) => {
    partyBonus = bonus;
}

const canStartParty = () => {
    return partiesStarted < 1;
}

const startParty = async (partyChannel, atList) => {
    if(partyBonus) return; //party already started
    //console.log('Starting party');
    partyBonus = true;
    partyStart = false;
    setTimeout(async () => {
        await stopParty(partyChannel);                        
    }, (60000 * 10));

    const startEmbed = new EmbedBuilder()
        .setColor('#D2C6E8')
        .setDescription(`* .｡ﾟ+..｡　**Party Has Started!**　ﾟ+..｡*ﾟ+\n\r🎊 This party will last 10 minutes\n:piñata: Send Gifs or Emojis to earn bonus points\n\r* .｡ﾟ+..｡　🥳 Let's Party!　ﾟ+..｡*ﾟ+`);
    await partyChannel.send({ content: atList, embeds: [startEmbed] });
}

const stopParty = async (partyChannel) => {
    partyStart = false;
    partyBonus = false;
    partiesStarted++;
    party.clear();
    const endEmbed = new EmbedBuilder()
        .setColor('#D2C6E8')
        .setDescription('Woop police have arrived for being too noisy. Party is over!');
    await partyChannel.send({ embeds: [endEmbed] });
}

const isAtchGif = (attachment) => {
    let url = attachment.url;
    console.log(url);
    return url.indexOf("gif", url.length-3) !== 1;
}

const emotes = (str) => {
    return str.match(/<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu);
}


module.exports = {
    LOG_PREFIX,
    doublePoints,
    userxp,
    xpWinners,
    votes,
    party,
    initializeDBData,
    initializeCronJobs,
    initializeWeekly,
    initializeMonthlyVotes,
    giveXP,
    addXP,
    voteForMember,
    setDoublePoints,
    getBirthdays,
    setBirthday,    
    getUserStats,    
    hoursToMinutesFormat,
    correctVCStatus,
    startInterval,
    clearVCInterval,
    funCommandHandler,
    isPartyStarting,
    setPartyStart,
    givePartyBonus,
    setPartyBonus,
    canStartParty,
    startParty,
    stopParty,
    isAtchGif,
    emotes
}
