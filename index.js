require('dotenv').config();
const { Client, GatewayIntentBits, Collection, PermissionFlagsBits, EmbedBuilder, Events, REST, Routes, AttachmentBuilder, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const { getPrimaryEmbedColor } = require('./utils/primaryEmbedColor');
const {
  recordInviteJoin,
  markInviteeLeft,
  markUnknownInviteJoin,
  formatArabicDays
} = require('./utils/inviteTracking');

const OWNER_ID = "1392792427051614249"; // Replace with your Discord user ID
const OWNER_IDS = new Set([OWNER_ID, "1229657759717523487"]);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

const PREFIX = '$';
client.commands = new Collection();
client.slashCommands = new Collection();

const dataPath = path.join(__dirname, 'data');
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath);
}

const adminsPath = path.join(dataPath, 'admins.json');
const blacklistPath = path.join(dataPath, 'blacklist.json');
const giveawaysPath = path.join(dataPath, 'giveaways.json');
const greetingsPath = path.join(dataPath, 'greetings.json');
const disabledCommandsPath = path.join(dataPath, 'disabledCommands.json');
const invitesPath = path.join(dataPath, 'invites.json');
const wheelRewardsPath = path.join(dataPath, 'wheelRewards.json');
const wheelConfigPath = path.join(dataPath, 'wheelConfig.json');
const inviteConfigPath = path.join(dataPath, 'inviteConfig.json');
const autoLinePath = path.join(dataPath, 'autoLine.json');
const feedbackPath = path.join(dataPath, 'feedback.json');
const markaGivConfigPath = path.join(dataPath, 'markaGivConfig.json');
const jailPath = path.join(dataPath, 'jail.json');
const jailConfigPath = path.join(dataPath, 'jailConfig.json');
const welcomePath = path.join(dataPath, 'welcome.json');
const logsConfigPath = path.join(dataPath, 'logsConfig.json');
const customRepliesPath = path.join(dataPath, 'customReplies.json');
const botSettingsPath = path.join(dataPath, 'botSettings.json');

function loadData(filePath, defaultData) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
    return defaultData;
  }
}

function saveData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error saving ${filePath}:`, error);
  }
}

global.admins = loadData(adminsPath, []);
global.blacklist = loadData(blacklistPath, { users: [], servers: [] });
global.giveaways = loadData(giveawaysPath, []);
global.greetings = loadData(greetingsPath, {});
global.disabledCommands = loadData(disabledCommandsPath, {});
global.invites = loadData(invitesPath, {});
global.wheelRewards = loadData(wheelRewardsPath, {});
global.wheelConfig = loadData(wheelConfigPath, {});
global.inviteConfig = loadData(inviteConfigPath, {});
global.autoLine = loadData(autoLinePath, {});
global.feedback = loadData(feedbackPath, {});
global.markaGivConfig = loadData(markaGivConfigPath, {});
global.jail = loadData(jailPath, {});
global.jailConfig = loadData(jailConfigPath, {});
global.welcome = loadData(welcomePath, {});
global.logsConfig = loadData(logsConfigPath, {});
global.customReplies = loadData(customRepliesPath, {});
global.botSettings = loadData(botSettingsPath, { primaryColor: '#6A3FF2' });

global.saveAdmins = () => saveData(adminsPath, global.admins);
global.saveBlacklist = () => saveData(blacklistPath, global.blacklist);
global.saveGiveaways = () => saveData(giveawaysPath, global.giveaways);
global.saveGreetings = () => saveData(greetingsPath, global.greetings);
global.saveDisabledCommands = () => saveData(disabledCommandsPath, global.disabledCommands);
global.saveInvites = () => saveData(invitesPath, global.invites);
global.saveWheelRewards = () => saveData(wheelRewardsPath, global.wheelRewards);
global.saveWheelConfig = () => saveData(wheelConfigPath, global.wheelConfig);
global.saveInviteConfig = () => saveData(inviteConfigPath, global.inviteConfig);
global.saveAutoLine = () => saveData(autoLinePath, global.autoLine);
global.saveFeedback = () => saveData(feedbackPath, global.feedback);
global.saveMarkaGivConfig = () => saveData(markaGivConfigPath, global.markaGivConfig);
global.saveJail = () => saveData(jailPath, global.jail);
global.saveJailConfig = () => saveData(jailConfigPath, global.jailConfig);
global.saveWelcome = () => saveData(welcomePath, global.welcome);
global.saveLogsConfig = () => saveData(logsConfigPath, global.logsConfig);
global.saveCustomReplies = () => saveData(customRepliesPath, global.customReplies);
global.saveBotSettings = () => saveData(botSettingsPath, global.botSettings);

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
  if (command.aliases) {
    command.aliases.forEach(alias => {
      client.commands.set(alias, command);
    });
  }
  if (command.data) {
    client.slashCommands.set(command.data.name, command);
  }
}

const slashCommandsPath = path.join(__dirname, 'slash-commands');
if (fs.existsSync(slashCommandsPath)) {
  const slashCommandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));
  for (const file of slashCommandFiles) {
    const command = require(`./slash-commands/${file}`);
    client.slashCommands.set(command.data.name, command);
  }
}

function isOwner(userId) {
  return OWNER_IDS.has(userId);
}

function isAdmin(userId) {
  return global.admins.includes(userId);
}

function isBlacklisted(userId, guildId) {
  return global.blacklist.users.includes(userId) || global.blacklist.servers.includes(guildId);
}

function isCommandDisabled(guildId, commandName) {
  if (!guildId) return false;
  return global.disabledCommands[guildId]?.includes(commandName) || false;
}

function hasPermissionToUseBot(member, guildId) {
  if (isOwner(member.user.id)) return true;
  
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  
  if (member.roles.cache.some(role => role.name.toLowerCase() === 'streeter')) return true;
  
  const markaGivEnabled = global.markaGivConfig[guildId]?.enabled || false;
  if (markaGivEnabled && member.roles.cache.some(role => role.name.toLowerCase() === 'marka giv')) {
    return true;
  }
  
  return false;
}

global.isOwner = isOwner;
global.isAdmin = isAdmin;
global.isCommandDisabled = isCommandDisabled;
global.hasPermissionToUseBot = hasPermissionToUseBot;
global.OWNER_ID = OWNER_ID;
global.OWNER_IDS = [...OWNER_IDS];

async function generateWelcomeImage(member, welcomeConfig) {
  try {
    const canvas = createCanvas(1024, 500);
    const ctx = canvas.getContext('2d');

    const background = await loadImage(welcomeConfig.imageUrl);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const avatarX = welcomeConfig.avatarX ?? 512;
    const avatarY = welcomeConfig.avatarY ?? 250;
    const avatarRadius = welcomeConfig.avatarRadius ?? 100;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 512 }));
    ctx.drawImage(avatar, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);

    ctx.restore();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
    ctx.stroke();

    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error('Error generating welcome image:', error);
    return null;
  }
}

const inviteCache = new Map();
const invitePermissionWarnings = new Set();

function logInviteFetchError(guild, error) {
  if (error.code === 50013) {
    if (!invitePermissionWarnings.has(guild.id)) {
      console.warn(`Missing Manage Server permission in ${guild.name}; inviter attribution will be unavailable.`);
      invitePermissionWarnings.add(guild.id);
    }
    return;
  }

  console.error(`Unable to fetch invites for ${guild.name}:`, error);
}

async function detectUsedInvite(guild) {
  try {
    const newInvites = await guild.invites.fetch();
    const hasPreviousSnapshot = inviteCache.has(guild.id);
    const previousInvites = inviteCache.get(guild.id) || new Map();
    let usedInvite = null;

    if (hasPreviousSnapshot) {
      for (const invite of newInvites.values()) {
        const previousUses = previousInvites.get(invite.code) || 0;
        if ((invite.uses || 0) > previousUses) {
          usedInvite = invite;
          break;
        }
      }
    }

    inviteCache.set(guild.id, new Map(
      newInvites.map(invite => [invite.code, invite.uses || 0])
    ));
    return usedInvite;
  } catch (error) {
    logInviteFetchError(guild, error);
    return null;
  }
}

client.once(Events.ClientReady, async () => {
  console.log(`✅ ${client.user.tag} is online and ready!`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers`);
  console.log(`👤 Owner IDs: ${[...OWNER_IDS].join(', ')}`);
  client.user.setActivity('$help | Marka Bot', { type: ActivityType.Streaming, url: 'https://www.twitch.tv/markabot' });

  const commands = [];
  for (const command of client.slashCommands.values()) {
    if (command.data) {
      commands.push(command.data.toJSON());
    }
  }

  if (commands.length > 0) {
    try {
      const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
      console.log(`🔄 Registering ${commands.length} slash commands...`);
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands }
      );
      console.log('✅ Slash commands registered successfully!');
    } catch (error) {
      console.error('❌ Error registering slash commands:', error);
    }
  }

  await Promise.all([...client.guilds.cache.values()].map(async (guild) => {
    try {
      const invites = await guild.invites.fetch();
      inviteCache.set(guild.id, new Map(invites.map(inv => [inv.code, inv.uses])));
    } catch (error) {
      logInviteFetchError(guild, error);
    }
  }));
  console.log('✅ Invite cache initialized!');
});

client.on(Events.InviteCreate, async (invite) => {
  const guildInvites = inviteCache.get(invite.guild.id);
  if (!guildInvites) return;
  guildInvites.set(invite.code, invite.uses || 0);
  inviteCache.set(invite.guild.id, guildInvites);
});

client.on(Events.InviteDelete, async (invite) => {
  const guildInvites = inviteCache.get(invite.guild.id);
  if (guildInvites) {
    guildInvites.delete(invite.code);
  }
});

client.on('guildMemberAdd', async (member) => {
  const guildId = member.guild.id;
  const joinedAt = member.joinedTimestamp || Date.now();
  const usedInvite = await detectUsedInvite(member.guild);
  const inviter = usedInvite?.inviter || null;
  const accountAgeDays = Math.floor((Date.now() - member.user.createdTimestamp) / (24 * 60 * 60 * 1000));
  const isOldEnough = Date.now() - member.user.createdTimestamp >= 60 * 24 * 60 * 60 * 1000;

  if (inviter) {
    recordInviteJoin(global.invites, guildId, inviter.id, member, joinedAt, isOldEnough);
    global.saveInvites();
  } else if (markUnknownInviteJoin(
    global.invites,
    guildId,
    member.id,
    joinedAt,
    member.user.createdTimestamp
  )) {
    // Keep prior tracked join records accurate when the member returns through an unknown invite.
    global.saveInvites();
  }
  
  const memberJoinLogChannelId = global.logsConfig[guildId]?.member_join_leave;
  if (memberJoinLogChannelId) {
    const memberJoinLogChannel = member.guild.channels.cache.get(memberJoinLogChannelId);
    if (memberJoinLogChannel) {
      try {
        const embed = new EmbedBuilder()
          .setTitle('👋 Member Joined')
          .setColor('#57F287')
          .setThumbnail(member.user.displayAvatarURL())
          .addFields(
            { name: '👤 User', value: `${member.user.tag}`, inline: true },
            { name: '🆔 User ID', value: `${member.id}`, inline: true },
            { name: '📅 Account Age', value: `${accountAgeDays} days`, inline: true },
            { name: '📊 Member Count', value: `${member.guild.memberCount}`, inline: true }
          )
          .setTimestamp();
        
        await memberJoinLogChannel.send({ embeds: [embed] });
      } catch (error) {
        console.error('Error logging member join:', error);
      }
    }
  }
  
  const welcomeConfig = global.welcome[guildId];
  if (welcomeConfig && welcomeConfig.enabled && welcomeConfig.channelId) {
    try {
      const channel = member.guild.channels.cache.get(welcomeConfig.channelId);
      if (channel) {
        if (welcomeConfig.imageUrl) {
          const imageBuffer = await generateWelcomeImage(member, welcomeConfig);
          if (imageBuffer) {
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome.png' });
            await channel.send({ files: [attachment] });
          }
        }

        if (welcomeConfig.message) {
          const memberCount = member.guild.memberCount;
          const inviterMention = inviter ? `<@${inviter.id}>` : 'غير معروف';

          const message = welcomeConfig.message
            .replace(/{user}/g, `<@${member.id}>`)
            .replace(/{username}/g, member.user.username)
            .replace(/{server}/g, member.guild.name)
            .replace(/{membercount}/g, memberCount.toString())
            .replace(/{inviter}/g, inviterMention);
          
          await channel.send(message);
        }
      }
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  }

  const greetConfig = global.greetings[guildId];
  if (greetConfig && greetConfig.enabled && greetConfig.channelId && greetConfig.message) {
    try {
      const channel = member.guild.channels.cache.get(greetConfig.channelId);
      if (channel) {
        const message = greetConfig.message
          .replace('{user}', `<@${member.id}>`)
          .replace('{username}', member.user.username)
          .replace('{server}', member.guild.name);
        
        const sentMessage = await channel.send(message);
        
        if (greetConfig.duration && greetConfig.duration > 0) {
          setTimeout(() => {
            sentMessage.delete().catch(console.error);
          }, greetConfig.duration * 1000);
        }
      }
    } catch (error) {
      console.error('Error sending greeting:', error);
    }
  }

  const inviteConfig = global.inviteConfig[guildId];
  const inviteLogChannel = inviteConfig?.logChannelId
    ? member.guild.channels.cache.get(inviteConfig.logChannelId)
    : null;
  if (inviteLogChannel?.isTextBased()) {
    const inviterText = inviter ? `<@${inviter.id}>` : 'غير معروف (رابط غير منسوب)';
    const content = [
      `🎉 دخل العضو <@${member.id}> السيرفر`,
      `🤝 الداعي: ${inviterText}`,
      `🗓️ عمر الحساب: ${formatArabicDays(accountAgeDays)}`
    ].join('\n');

    await inviteLogChannel.send({
      content,
      allowedMentions: { users: [member.id, ...(inviter ? [inviter.id] : [])], parse: [] }
    }).catch(error => console.error('Error sending invite join log:', error));
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  if (message.guild) {
    const guildId = message.guild.id;
    
    const feedbackConfig = global.feedback[guildId];
    if (feedbackConfig && feedbackConfig.enabled && feedbackConfig.channels.includes(message.channel.id)) {
      if (!message.content.startsWith(PREFIX)) {
        try {
          const messageContent = message.content || '*No text content*';
          
          const feedbackEmbed = new EmbedBuilder()
            .setAuthor({ 
              name: message.author.username, 
              iconURL: message.author.displayAvatarURL() 
            })
            .setDescription(messageContent)
            .setColor(getPrimaryEmbedColor())
            .setTimestamp();
          
          if (message.attachments.size > 0) {
            const firstAttachment = message.attachments.first();
            if (firstAttachment.contentType?.startsWith('image/')) {
              feedbackEmbed.setImage(firstAttachment.url);
            }
          }
          
          await message.delete();
          
          const feedbackMessage = await message.channel.send({ embeds: [feedbackEmbed] });
          
          for (const emoji of feedbackConfig.emojis) {
            try {
              await feedbackMessage.react(emoji);
            } catch (error) {
              console.error(`Error adding reaction ${emoji}:`, error);
            }
          }
          
          return;
        } catch (error) {
          console.error('Error handling feedback message:', error);
        }
      }
    }
    
    const autoLineConfig = global.autoLine[guildId];
    
    if (autoLineConfig && autoLineConfig.enabled && autoLineConfig.imageUrl && autoLineConfig.channels.includes(message.channel.id)) {
      try {
        await message.channel.send(autoLineConfig.imageUrl);
      } catch (error) {
        console.error('Error sending auto-line:', error);
      }
    }

    const customRepliesConfig = global.customReplies[guildId];
    
    if (customRepliesConfig && customRepliesConfig.enabled && customRepliesConfig.replies.length > 0) {
      const messageContent = message.content.toLowerCase();
      const matchedReply = customRepliesConfig.replies.find(r => 
        messageContent.includes(r.trigger.toLowerCase())
      );
      
      if (matchedReply) {
        try {
          await message.reply(matchedReply.response);
        } catch (error) {
          console.error('Error sending custom reply:', error);
        }
      }
    }
  }
  
  if (!message.content.startsWith(PREFIX)) return;
  
  if (isBlacklisted(message.author.id, message.guild?.id)) {
    return;
  }

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  if (message.guild && commandName !== 'wheelticket' && !hasPermissionToUseBot(message.member, message.guild.id)) {
    const markaGivEnabled = global.markaGivConfig[message.guild.id]?.enabled || false;
    if (markaGivEnabled) {
      return message.reply('❌ You need **Administrator**, **Streeter**, or **marka giv** role to use this bot.\n❌ تحتاج إلى صلاحية **مسؤول** أو رتبة **Streeter** أو **marka giv** لاستخدام البوت.');
    } else {
      return message.reply('❌ You need **Administrator** or **Streeter** role to use this bot.\n❌ تحتاج إلى صلاحية **مسؤول** أو رتبة **Streeter** لاستخدام البوت.');
    }
  }

  if (isCommandDisabled(message.guild?.id, commandName)) {
    return message.reply('❌ تم تعطيل هذا الأمر في هذا السيرفر.');
  }

  if (command.ownerOnly && !isOwner(message.author.id)) {
    return message.reply('❌ هذا الأمر مخصص لمالك البوت فقط.');
  }

  if (command.adminOnly && !isOwner(message.author.id) && !isAdmin(message.author.id)) {
    return message.reply('❌ هذا الأمر يتطلب صلاحيات مشرف.');
  }

  if (command.permissions) {
    if (!message.member.permissions.has(command.permissions)) {
      return message.reply(`❌ تحتاج صلاحية **${command.permissions}** لاستخدام هذا الأمر.`);
    }
  }

  if (command.botPermissions) {
    if (!message.guild.members.me.permissions.has(command.botPermissions)) {
      return message.reply(`❌ أحتاج صلاحية **${command.botPermissions}** لتنفيذ هذا الأمر.`);
    }
  }

  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error(`Error executing ${commandName}:`, error);
    message.reply('❌ حدث خطأ أثناء تنفيذ هذا الأمر.').catch(console.error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (isBlacklisted(interaction.user.id, interaction.guild?.id)) {
    return interaction.reply({ content: '❌ أنت محظور من استخدام هذا البوت.', ephemeral: true });
  }

  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;

  if (interaction.guild && interaction.commandName !== 'wheelticket' && !hasPermissionToUseBot(interaction.member, interaction.guild.id)) {
    const markaGivEnabled = global.markaGivConfig[interaction.guild.id]?.enabled || false;
    if (markaGivEnabled) {
      return interaction.reply({ content: '❌ You need **Administrator**, **Streeter**, or **marka giv** role to use this bot.\n❌ تحتاج إلى صلاحية **مسؤول** أو رتبة **Streeter** أو **marka giv** لاستخدام البوت.', ephemeral: true });
    } else {
      return interaction.reply({ content: '❌ You need **Administrator** or **Streeter** role to use this bot.\n❌ تحتاج إلى صلاحية **مسؤول** أو رتبة **Streeter** لاستخدام البوت.', ephemeral: true });
    }
  }

  if (isCommandDisabled(interaction.guild?.id, interaction.commandName)) {
    return interaction.reply({ content: '❌ تم تعطيل هذا الأمر في هذا السيرفر.', ephemeral: true });
  }

  if (command.ownerOnly && !isOwner(interaction.user.id)) {
    return interaction.reply({ content: '❌ هذا الأمر مخصص لمالك البوت فقط.', ephemeral: true });
  }

  if (command.adminOnly && !isOwner(interaction.user.id) && !isAdmin(interaction.user.id)) {
    return interaction.reply({ content: '❌ هذا الأمر يتطلب صلاحيات مشرف.', ephemeral: true });
  }

  try {
    await command.executeSlash(interaction, client);
  } catch (error) {
    console.error(`Error executing slash command ${interaction.commandName}:`, error);
    const errorMessage = { content: '❌ حدث خطأ أثناء تنفيذ هذا الأمر.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

client.on('guildMemberRemove', async (member) => {
  const guildId = member.guild.id;
  const departedAt = Date.now();
  const trackedInvite = markInviteeLeft(
    global.invites,
    guildId,
    member.id,
    departedAt,
    member.user.createdTimestamp,
    member.joinedTimestamp
  );
  if (trackedInvite.records.length > 0) global.saveInvites();

  const inviteLogChannelId = global.inviteConfig[guildId]?.logChannelId;
  const inviteLogChannel = inviteLogChannelId
    ? member.guild.channels.cache.get(inviteLogChannelId)
    : null;
  if (inviteLogChannel?.isTextBased()) {
    const inviterText = trackedInvite.inviterId
      ? `<@${trackedInvite.inviterId}>`
      : 'غير معروف';
    const joinedAt = member.joinedTimestamp || trackedInvite.record?.joinedAt || trackedInvite.record?.timestamp;
    const membershipDays = joinedAt
      ? Math.max(0, Math.floor((departedAt - joinedAt) / (24 * 60 * 60 * 1000)))
      : null;
    const accountAgeDays = Math.floor((departedAt - member.user.createdTimestamp) / (24 * 60 * 60 * 1000));
    const content = [
      `🚪 غادر العضو <@${member.id}> السيرفر`,
      `🤝 الداعي: ${inviterText}`,
      `⏳ مدة بقائه: ${membershipDays === null ? 'غير متوفرة' : formatArabicDays(membershipDays)}`,
      `🗓️ عمر الحساب: ${formatArabicDays(accountAgeDays)}`
    ].join('\n');

    await inviteLogChannel.send({
      content,
      allowedMentions: {
        users: [member.id, ...(trackedInvite.inviterId ? [trackedInvite.inviterId] : [])],
        parse: []
      }
    }).catch(error => console.error('Error sending invite leave log:', error));
  }

  const logChannelId = global.logsConfig[guildId]?.member_join_leave;
  
  if (!logChannelId) return;
  
  const logChannel = member.guild.channels.cache.get(logChannelId);
  if (!logChannel) return;
  
  try {
    const embed = new EmbedBuilder()
      .setTitle('👋 Member Left')
      .setColor('#ED4245')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: '👤 User', value: `${member.user.tag}`, inline: true },
        { name: '🆔 User ID', value: `${member.id}`, inline: true },
        { name: '📅 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true }
      )
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error logging member leave:', error);
  }
});

client.on('messageDelete', async (message) => {
  if (message.author?.bot) return;
  if (!message.guild) return;
  
  const guildId = message.guild.id;
  const logChannelId = global.logsConfig[guildId]?.message_edit_delete;
  
  if (!logChannelId) return;
  
  const logChannel = message.guild.channels.cache.get(logChannelId);
  if (!logChannel) return;
  
  try {
    const embed = new EmbedBuilder()
      .setTitle('🗑️ Message Deleted')
      .setColor('#ED4245')
      .addFields(
        { name: '👤 Author', value: message.author ? `${message.author.tag}` : 'Unknown', inline: true },
        { name: '📍 Channel', value: `${message.channel}`, inline: true },
        { name: '📝 Content', value: message.content ? (message.content.length > 1024 ? message.content.substring(0, 1021) + '...' : message.content) : '*No text content*', inline: false }
      )
      .setTimestamp();
    
    if (message.attachments.size > 0) {
      embed.addFields({ name: '📎 Attachments', value: `${message.attachments.size} attachment(s)`, inline: false });
    }
    
    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error logging message delete:', error);
  }
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
  if (newMessage.author?.bot) return;
  if (!newMessage.guild) return;
  if (oldMessage.content === newMessage.content) return;
  
  const guildId = newMessage.guild.id;
  const logChannelId = global.logsConfig[guildId]?.message_edit_delete;
  
  if (!logChannelId) return;
  
  const logChannel = newMessage.guild.channels.cache.get(logChannelId);
  if (!logChannel) return;
  
  try {
    const embed = new EmbedBuilder()
      .setTitle('✏️ Message Edited')
      .setColor('#FEE75C')
      .addFields(
        { name: '👤 Author', value: `${newMessage.author.tag}`, inline: true },
        { name: '📍 Channel', value: `${newMessage.channel}`, inline: true },
        { name: '📝 Before', value: oldMessage.content ? (oldMessage.content.length > 1024 ? oldMessage.content.substring(0, 1021) + '...' : oldMessage.content) : '*No text content*', inline: false },
        { name: '📝 After', value: newMessage.content ? (newMessage.content.length > 1024 ? newMessage.content.substring(0, 1021) + '...' : newMessage.content) : '*No text content*', inline: false },
        { name: '🔗 Jump to Message', value: `[Click here](${newMessage.url})`, inline: false }
      )
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error logging message edit:', error);
  }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const guildId = newMember.guild.id;
  
  const rolesAdded = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
  const rolesRemoved = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
  
  if (rolesAdded.size > 0 || rolesRemoved.size > 0) {
    const logChannelId = global.logsConfig[guildId]?.role_changes;
    
    if (!logChannelId) return;
    
    const logChannel = newMember.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;
    
    try {
      const embed = new EmbedBuilder()
        .setTitle('🎭 Member Roles Updated')
        .setColor(getPrimaryEmbedColor())
        .setThumbnail(newMember.user.displayAvatarURL())
        .addFields(
          { name: '👤 Member', value: `${newMember.user.tag}`, inline: true },
          { name: '🆔 User ID', value: `${newMember.id}`, inline: true }
        )
        .setTimestamp();
      
      if (rolesAdded.size > 0) {
        embed.addFields({ name: '✅ Roles Added', value: rolesAdded.map(role => `${role}`).join(', '), inline: false });
      }
      
      if (rolesRemoved.size > 0) {
        embed.addFields({ name: '❌ Roles Removed', value: rolesRemoved.map(role => `${role}`).join(', '), inline: false });
      }
      
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error logging role changes:', error);
    }
  }
  
  if (oldMember.nickname !== newMember.nickname) {
    const logChannelId = global.logsConfig[guildId]?.nickname_changes;
    
    if (!logChannelId) return;
    
    const logChannel = newMember.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;
    
    try {
      const embed = new EmbedBuilder()
        .setTitle('🏷️ Nickname Changed')
        .setColor('#FEE75C')
        .setThumbnail(newMember.user.displayAvatarURL())
        .addFields(
          { name: '👤 Member', value: `${newMember.user.tag}`, inline: true },
          { name: '🆔 User ID', value: `${newMember.id}`, inline: true },
          { name: '📝 Before', value: oldMember.nickname || '*No nickname*', inline: false },
          { name: '📝 After', value: newMember.nickname || '*No nickname*', inline: false }
        )
        .setTimestamp();
      
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error logging nickname change:', error);
    }
  }
});

client.on('channelCreate', async (channel) => {
  if (!channel.guild) return;
  
  const guildId = channel.guild.id;
  const logChannelId = global.logsConfig[guildId]?.channel_changes;
  
  if (!logChannelId) return;
  
  const logChannel = channel.guild.channels.cache.get(logChannelId);
  if (!logChannel) return;
  
  try {
    const embed = new EmbedBuilder()
      .setTitle('📁 Channel Created')
      .setColor('#57F287')
      .addFields(
        { name: '📍 Channel', value: `${channel}`, inline: true },
        { name: '🔖 Name', value: channel.name, inline: true },
        { name: '📂 Type', value: channel.type.toString(), inline: true }
      )
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error logging channel create:', error);
  }
});

client.on('channelDelete', async (channel) => {
  if (!channel.guild) return;
  
  const guildId = channel.guild.id;
  const logChannelId = global.logsConfig[guildId]?.channel_changes;
  
  if (!logChannelId) return;
  
  const logChannel = channel.guild.channels.cache.get(logChannelId);
  if (!logChannel) return;
  
  try {
    const embed = new EmbedBuilder()
      .setTitle('📁 Channel Deleted')
      .setColor('#ED4245')
      .addFields(
        { name: '🔖 Name', value: channel.name, inline: true },
        { name: '📂 Type', value: channel.type.toString(), inline: true }
      )
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error logging channel delete:', error);
  }
});

client.on('channelUpdate', async (oldChannel, newChannel) => {
  if (!newChannel.guild) return;
  
  const guildId = newChannel.guild.id;
  const logChannelId = global.logsConfig[guildId]?.channel_changes;
  
  if (!logChannelId) return;
  
  const logChannel = newChannel.guild.channels.cache.get(logChannelId);
  if (!logChannel) return;
  
  try {
    const changes = [];
    
    if (oldChannel.name !== newChannel.name) {
      changes.push({ name: '🔖 Name Changed', value: `${oldChannel.name} → ${newChannel.name}`, inline: false });
    }
    
    if (oldChannel.topic !== newChannel.topic) {
      changes.push({ name: '📝 Topic Changed', value: `Before: ${oldChannel.topic || '*None*'}\nAfter: ${newChannel.topic || '*None*'}`, inline: false });
    }
    
    if (changes.length === 0) return;
    
    const embed = new EmbedBuilder()
      .setTitle('📁 Channel Updated')
      .setColor('#FEE75C')
      .addFields(
        { name: '📍 Channel', value: `${newChannel}`, inline: true },
        ...changes
      )
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error logging channel update:', error);
  }
});

client.on('guildBanAdd', async (ban) => {
  const guildId = ban.guild.id;
  const logChannelId = global.logsConfig[guildId]?.moderation_actions;
  
  if (!logChannelId) return;
  
  const logChannel = ban.guild.channels.cache.get(logChannelId);
  if (!logChannel) return;
  
  try {
    const embed = new EmbedBuilder()
      .setTitle('🔨 Member Banned')
      .setColor('#ED4245')
      .setThumbnail(ban.user.displayAvatarURL())
      .addFields(
        { name: '👤 User', value: `${ban.user.tag}`, inline: true },
        { name: '🆔 User ID', value: `${ban.user.id}`, inline: true },
        { name: '📝 Reason', value: ban.reason || '*No reason provided*', inline: false }
      )
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error logging ban:', error);
  }
});

client.on('guildBanRemove', async (ban) => {
  const guildId = ban.guild.id;
  const logChannelId = global.logsConfig[guildId]?.moderation_actions;
  
  if (!logChannelId) return;
  
  const logChannel = ban.guild.channels.cache.get(logChannelId);
  if (!logChannel) return;
  
  try {
    const embed = new EmbedBuilder()
      .setTitle('🔓 Member Unbanned')
      .setColor('#57F287')
      .setThumbnail(ban.user.displayAvatarURL())
      .addFields(
        { name: '👤 User', value: `${ban.user.tag}`, inline: true },
        { name: '🆔 User ID', value: `${ban.user.id}`, inline: true }
      )
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error logging unban:', error);
  }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  const guildId = newState.guild.id;
  const logChannelId = global.logsConfig[guildId]?.voice_changes;
  
  if (!logChannelId) return;
  
  const logChannel = newState.guild.channels.cache.get(logChannelId);
  if (!logChannel) return;
  
  try {
    if (!oldState.channel && newState.channel) {
      const embed = new EmbedBuilder()
        .setTitle('🎙️ Voice Channel Joined')
        .setColor('#57F287')
        .setThumbnail(newState.member.user.displayAvatarURL())
        .addFields(
          { name: '👤 Member', value: `${newState.member.user.tag}`, inline: true },
          { name: '📍 Channel', value: `${newState.channel}`, inline: true }
        )
        .setTimestamp();
      
      await logChannel.send({ embeds: [embed] });
    } else if (oldState.channel && !newState.channel) {
      const embed = new EmbedBuilder()
        .setTitle('🎙️ Voice Channel Left')
        .setColor('#ED4245')
        .setThumbnail(newState.member.user.displayAvatarURL())
        .addFields(
          { name: '👤 Member', value: `${newState.member.user.tag}`, inline: true },
          { name: '📍 Channel', value: `${oldState.channel}`, inline: true }
        )
        .setTimestamp();
      
      await logChannel.send({ embeds: [embed] });
    } else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
      const embed = new EmbedBuilder()
        .setTitle('🎙️ Voice Channel Moved')
        .setColor('#FEE75C')
        .setThumbnail(newState.member.user.displayAvatarURL())
        .addFields(
          { name: '👤 Member', value: `${newState.member.user.tag}`, inline: true },
          { name: '📍 From', value: `${oldState.channel}`, inline: true },
          { name: '📍 To', value: `${newState.channel}`, inline: true }
        )
        .setTimestamp();
      
      await logChannel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Error logging voice state update:', error);
  }
});

client.on('guildUpdate', async (oldGuild, newGuild) => {
  const guildId = newGuild.id;
  const logChannelId = global.logsConfig[guildId]?.server_updates;
  
  if (!logChannelId) return;
  
  const logChannel = newGuild.channels.cache.get(logChannelId);
  if (!logChannel) return;
  
  try {
    const changes = [];
    
    if (oldGuild.name !== newGuild.name) {
      changes.push({ name: '🏷️ Server Name', value: `${oldGuild.name} → ${newGuild.name}`, inline: false });
    }
    
    if (oldGuild.iconURL() !== newGuild.iconURL()) {
      changes.push({ name: '🖼️ Server Icon', value: 'Server icon changed', inline: false });
    }
    
    if (oldGuild.verificationLevel !== newGuild.verificationLevel) {
      changes.push({ name: '🔐 Verification Level', value: `${oldGuild.verificationLevel} → ${newGuild.verificationLevel}`, inline: false });
    }
    
    if (changes.length === 0) return;
    
    const embed = new EmbedBuilder()
      .setTitle('⚙️ Server Updated')
      .setColor(getPrimaryEmbedColor())
      .addFields(...changes)
      .setTimestamp();
    
    if (newGuild.iconURL()) {
      embed.setThumbnail(newGuild.iconURL());
    }
    
    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error logging server update:', error);
  }
});

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/stats', (req, res) => {
  if (!client.user) {
    return res.json({ error: 'Bot not ready' });
  }
  
  const uptime = process.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  
  res.json({
    botName: client.user.tag,
    botAvatar: client.user.displayAvatarURL(),
    serverCount: client.guilds.cache.size,
    userCount: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
    uptime: `${days}d ${hours}h ${minutes}m`,
    commandCount: client.commands.size,
    ping: client.ws.ping
  });
});

app.get('/api/servers', (req, res) => {
  if (!client.user) {
    return res.json({ error: 'Bot not ready' });
  }
  
  const servers = client.guilds.cache.map(guild => ({
    id: guild.id,
    name: guild.name,
    memberCount: guild.memberCount,
    icon: guild.iconURL() || 'https://cdn.discordapp.com/embed/avatars/0.png'
  }));
  
  res.json(servers);
});

app.get('/api/giveaways', (req, res) => {
  const activeGiveaways = global.giveaways
    .filter(g => !g.ended)
    .map(g => ({
      prize: g.prize,
      winnersCount: g.winnersCount,
      endTime: g.endTime,
      guildId: g.guildId,
      channelId: g.channelId
    }));
  
  res.json(activeGiveaways);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Bot internal API running on port ${PORT}`);
});

client.login(process.env.DISCORD_TOKEN).catch(error => {
  console.error('❌ Failed to login:', error);
  process.exit(1);
});
