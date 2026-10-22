const { PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { getPrimaryEmbedColor } = require('../utils/primaryEmbedColor');

module.exports = {
  name: 'setlog',
  description: 'تعيين قنوات السجلات - Set log channels',
  permissions: PermissionFlagsBits.Administrator,
  async execute(message, args, client) {
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

    if (!channel) {
      return message.reply('❌ الاستخدام: `$setlog #القناة`\n❌ Usage: `$setlog #channel`\n\nسيتم عرض قائمة لاختيار نوع السجل.\nA menu will appear to select the log type.');
    }

    const guildId = message.guild.id;
    
    if (!global.logsConfig[guildId]) {
      global.logsConfig[guildId] = {};
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('log_type_select')
      .setPlaceholder('📋 اختر نوع السجل - Select log type')
      .addOptions([
        {
          label: '👥 Member Join/Leave',
          description: 'Log when members join or leave',
          value: 'member_join_leave',
          emoji: '👥'
        },
        {
          label: '✏️ Message Edit/Delete',
          description: 'Log message edits and deletions',
          value: 'message_edit_delete',
          emoji: '✏️'
        },
        {
          label: '🎭 Role Changes',
          description: 'Log role additions and removals',
          value: 'role_changes',
          emoji: '🎭'
        },
        {
          label: '📁 Channel Changes',
          description: 'Log channel creation, deletion, and updates',
          value: 'channel_changes',
          emoji: '📁'
        },
        {
          label: '🔨 Ban/Unban/Kick',
          description: 'Log bans, unbans, and kicks',
          value: 'moderation_actions',
          emoji: '🔨'
        },
        {
          label: '🎙️ Voice State Changes',
          description: 'Log voice channel join/leave/move',
          value: 'voice_changes',
          emoji: '🎙️'
        },
        {
          label: '🏷️ Nickname Changes',
          description: 'Log nickname changes',
          value: 'nickname_changes',
          emoji: '🏷️'
        },
        {
          label: '⚙️ Server Updates',
          description: 'Log server settings changes',
          value: 'server_updates',
          emoji: '⚙️'
        },
        {
          label: '📝 All Logs',
          description: 'Set this channel for all log types',
          value: 'all_logs',
          emoji: '📝'
        }
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = new EmbedBuilder()
      .setTitle('📋 تعيين قناة السجلات - Set Log Channel')
      .setDescription(`القناة المختارة: ${channel}\n\nاختر نوع السجل من القائمة أدناه:\n\nSelected channel: ${channel}\n\nSelect the log type from the menu below:`)
      .setColor(getPrimaryEmbedColor())
      .setTimestamp();

    const reply = await message.reply({ embeds: [embed], components: [row] });

    const collector = reply.createMessageComponentCollector({
      filter: i => i.user.id === message.author.id,
      time: 60000,
      max: 1
    });

    collector.on('collect', async interaction => {
      const selectedType = interaction.values[0];
      
      if (selectedType === 'all_logs') {
        const logTypes = [
          'member_join_leave',
          'message_edit_delete',
          'role_changes',
          'channel_changes',
          'moderation_actions',
          'voice_changes',
          'nickname_changes',
          'server_updates'
        ];
        
        logTypes.forEach(type => {
          global.logsConfig[guildId][type] = channel.id;
        });
      } else {
        global.logsConfig[guildId][selectedType] = channel.id;
      }
      
      global.saveLogsConfig();

      const typeNames = {
        member_join_leave: '👥 Member Join/Leave',
        message_edit_delete: '✏️ Message Edit/Delete',
        role_changes: '🎭 Role Changes',
        channel_changes: '📁 Channel Changes',
        moderation_actions: '🔨 Ban/Unban/Kick',
        voice_changes: '🎙️ Voice State Changes',
        nickname_changes: '🏷️ Nickname Changes',
        server_updates: '⚙️ Server Updates',
        all_logs: '📝 All Logs'
      };

      const successEmbed = new EmbedBuilder()
        .setTitle('✅ تم تعيين قناة السجل - Log Channel Set')
        .setDescription(`**نوع السجل | Log Type:** ${typeNames[selectedType]}\n**القناة | Channel:** ${channel}`)
        .setColor('#57F287')
        .setTimestamp();

      await interaction.update({ embeds: [successEmbed], components: [] });
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        reply.edit({ components: [] }).catch(() => {});
      }
    });
  }
};
