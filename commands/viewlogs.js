const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getPrimaryEmbedColor } = require('../utils/primaryEmbedColor');

module.exports = {
  name: 'viewlogs',
  description: 'عرض إعدادات السجلات - View log settings',
  permissions: PermissionFlagsBits.Administrator,
  async execute(message, args, client) {
    const guildId = message.guild.id;
    const config = global.logsConfig[guildId] || {};

    const typeNames = {
      member_join_leave: '👥 Member Join/Leave',
      message_edit_delete: '✏️ Message Edit/Delete',
      role_changes: '🎭 Role Changes',
      channel_changes: '📁 Channel Changes',
      moderation_actions: '🔨 Ban/Unban/Kick',
      voice_changes: '🎙️ Voice State Changes',
      nickname_changes: '🏷️ Nickname Changes',
      server_updates: '⚙️ Server Updates'
    };

    const embed = new EmbedBuilder()
      .setTitle('📋 إعدادات السجلات - Log Settings')
      .setColor(getPrimaryEmbedColor())
      .setTimestamp();

    let description = '**القنوات المعينة | Configured Channels:**\n\n';
    let hasLogs = false;

    for (const [type, name] of Object.entries(typeNames)) {
      const channelId = config[type];
      if (channelId) {
        const channel = message.guild.channels.cache.get(channelId);
        description += `${name}\n➜ ${channel || '❌ Channel not found'}\n\n`;
        hasLogs = true;
      }
    }

    if (!hasLogs) {
      description += '❌ لم يتم تعيين أي قنوات سجلات بعد.\n❌ No log channels configured yet.\n\nاستخدم `$setlog #channel` لتعيين قنوات السجلات.\nUse `$setlog #channel` to configure log channels.';
    }

    embed.setDescription(description);
    await message.reply({ embeds: [embed] });
  }
};
