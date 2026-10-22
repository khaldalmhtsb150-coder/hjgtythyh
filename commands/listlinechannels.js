const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'listlinechannels',
  description: 'List all channels configured for auto-line',
  permissions: PermissionFlagsBits.ManageChannels,
  async execute(message, args) {
    const guildId = message.guild.id;
    
    if (!global.autoLine[guildId]) {
      return message.reply('❌ Auto-line feature is not configured for this server.\n❌ ميزة الخط التلقائي غير مكونة لهذا السيرفر.');
    }

    const config = global.autoLine[guildId];
    
    const embed = new EmbedBuilder()
      .setTitle('⚙️ Auto-Line Configuration | إعدادات الخط التلقائي')
      .setColor(config.enabled ? '#43B581' : '#F04747')
      .addFields(
        { 
          name: '📊 Status | الحالة', 
          value: config.enabled ? '✅ Enabled | مفعل' : '❌ Disabled | معطل', 
          inline: true 
        },
        { 
          name: '🖼️ Image/GIF', 
          value: config.imageUrl || 'Not set | غير محدد', 
          inline: false 
        }
      )
      .setTimestamp();

    if (config.channels.length > 0) {
      const channelList = config.channels
        .map(id => {
          const channel = message.guild.channels.cache.get(id);
          return channel ? `<#${id}>` : `~~Unknown (${id})~~`;
        })
        .join(', ');
      
      embed.addFields({ 
        name: `📝 Channels (${config.channels.length}) | القنوات`, 
        value: channelList, 
        inline: false 
      });
    } else {
      embed.addFields({ 
        name: '📝 Channels | القنوات', 
        value: 'No channels configured | لا توجد قنوات مكونة', 
        inline: false 
      });
    }

    if (config.imageUrl) {
      embed.setImage(config.imageUrl);
    }

    message.reply({ embeds: [embed] });
  }
};
