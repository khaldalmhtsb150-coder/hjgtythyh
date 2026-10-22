const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'listreplies',
  description: 'List all custom auto-reply triggers',
  async execute(message, args, client) {
    const guildId = message.guild.id;
    
    if (!global.customReplies[guildId]) {
      return message.reply('❌ No custom replies configured for this server.\n❌ لا توجد ردود تلقائية مكونة لهذا السيرفر.');
    }

    const config = global.customReplies[guildId];
    
    const embed = new EmbedBuilder()
      .setTitle('⚙️ Custom Auto-Replies | الردود التلقائية')
      .setColor(config.enabled ? '#43B581' : '#F04747')
      .addFields(
        { 
          name: '📊 Status | الحالة', 
          value: config.enabled ? '✅ Enabled | مفعل' : '❌ Disabled | معطل', 
          inline: true 
        },
        { 
          name: '📝 Total Replies | إجمالي الردود', 
          value: config.replies.length.toString(), 
          inline: true 
        }
      )
      .setTimestamp();

    if (config.replies.length > 0) {
      const replyList = config.replies
        .map((r, index) => `**${index + 1}.** Trigger: \`${r.trigger}\`\nResponse: ${r.response}`)
        .join('\n\n');
      
      if (replyList.length > 1024) {
        const shortened = config.replies
          .map((r, index) => `**${index + 1}.** \`${r.trigger}\``)
          .join('\n');
        embed.addFields({ 
          name: '📋 Triggers | الكلمات المفتاحية', 
          value: shortened, 
          inline: false 
        });
      } else {
        embed.setDescription(replyList);
      }
    } else {
      embed.setDescription('No custom replies configured.\nلا توجد ردود تلقائية مكونة.');
    }

    message.reply({ embeds: [embed] });
  }
};
