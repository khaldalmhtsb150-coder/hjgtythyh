const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listfeedback')
    .setDescription('List all feedback system configuration')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async executeSlash(interaction, client) {
    const guildId = interaction.guild.id;
    
    if (!global.feedback[guildId]) {
      return interaction.reply({ 
        content: '❌ Feedback system is not configured for this server.\n❌ نظام التعليقات غير مكون لهذا السيرفر.', 
        ephemeral: true 
      });
    }

    const config = global.feedback[guildId];
    
    const embed = new EmbedBuilder()
      .setTitle('💬 Feedback System Configuration | إعدادات نظام التعليقات')
      .setColor(config.enabled ? '#43B581' : '#F04747')
      .addFields(
        { 
          name: '📊 Status | الحالة', 
          value: config.enabled ? '✅ Enabled | مفعل' : '❌ Disabled | معطل', 
          inline: true 
        }
      )
      .setTimestamp();

    if (config.emojis.length > 0) {
      const emojiList = config.emojis.join(' ');
      embed.addFields({ 
        name: `😊 Reaction Emojis (${config.emojis.length}) | الرموز التعبيرية`, 
        value: emojiList, 
        inline: false 
      });
    } else {
      embed.addFields({ 
        name: '😊 Reaction Emojis | الرموز التعبيرية', 
        value: 'No emojis set | لم يتم تعيين رموز تعبيرية', 
        inline: false 
      });
    }

    if (config.channels.length > 0) {
      const channelList = config.channels
        .map(id => {
          const channel = interaction.guild.channels.cache.get(id);
          return channel ? `<#${id}>` : `~~Unknown (${id})~~`;
        })
        .join(', ');
      
      embed.addFields({ 
        name: `📝 Feedback Channels (${config.channels.length}) | قنوات التعليقات`, 
        value: channelList, 
        inline: false 
      });
    } else {
      embed.addFields({ 
        name: '📝 Feedback Channels | قنوات التعليقات', 
        value: 'No channels configured | لا توجد قنوات مكونة', 
        inline: false 
      });
    }

    await interaction.reply({ embeds: [embed] });
  }
};
