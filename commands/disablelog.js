const { PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'disablelog',
  description: 'تعطيل نوع سجل معين - Disable a specific log type',
  permissions: PermissionFlagsBits.Administrator,
  async execute(message, args, client) {
    const guildId = message.guild.id;
    const config = global.logsConfig[guildId];

    if (!config || Object.keys(config).length === 0) {
      return message.reply('❌ لا توجد سجلات معينة لتعطيلها.\n❌ No logs configured to disable.');
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('disable_log_select')
      .setPlaceholder('📋 اختر نوع السجل لتعطيله - Select log type to disable')
      .addOptions([
        {
          label: '👥 Member Join/Leave',
          value: 'member_join_leave',
          emoji: '👥'
        },
        {
          label: '✏️ Message Edit/Delete',
          value: 'message_edit_delete',
          emoji: '✏️'
        },
        {
          label: '🎭 Role Changes',
          value: 'role_changes',
          emoji: '🎭'
        },
        {
          label: '📁 Channel Changes',
          value: 'channel_changes',
          emoji: '📁'
        },
        {
          label: '🔨 Ban/Unban/Kick',
          value: 'moderation_actions',
          emoji: '🔨'
        },
        {
          label: '🎙️ Voice State Changes',
          value: 'voice_changes',
          emoji: '🎙️'
        },
        {
          label: '🏷️ Nickname Changes',
          value: 'nickname_changes',
          emoji: '🏷️'
        },
        {
          label: '⚙️ Server Updates',
          value: 'server_updates',
          emoji: '⚙️'
        },
        {
          label: '❌ Disable All Logs',
          value: 'all_logs',
          emoji: '❌'
        }
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = new EmbedBuilder()
      .setTitle('🚫 تعطيل السجلات - Disable Logs')
      .setDescription('اختر نوع السجل الذي تريد تعطيله:\n\nSelect the log type you want to disable:')
      .setColor('#ED4245')
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
        global.logsConfig[guildId] = {};
      } else {
        delete global.logsConfig[guildId][selectedType];
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
        all_logs: '❌ All Logs'
      };

      const successEmbed = new EmbedBuilder()
        .setTitle('✅ تم تعطيل السجل - Log Disabled')
        .setDescription(`**نوع السجل | Log Type:** ${typeNames[selectedType]}\n\n${selectedType === 'all_logs' ? 'تم تعطيل جميع السجلات.\nAll logs have been disabled.' : 'لن يتم تسجيل هذا النوع من الأحداث بعد الآن.\nThis event type will no longer be logged.'}`)
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
