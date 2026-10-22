const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'testwelcome',
  description: 'Test the welcome message configuration',
  permissions: PermissionFlagsBits.ManageGuild,
  async execute(message, args) {
    const guildId = message.guild.id;
    
    const welcomeConfig = global.welcome[guildId];
    
    if (!welcomeConfig || !welcomeConfig.channelId) {
      return message.reply('❌ Welcome system is not configured yet.\n❌ نظام الترحيب غير مكون بعد.\n\nUse `$setwelcomechannel` to get started.\nاستخدم `$setwelcomechannel` للبدء.');
    }

    const channel = message.guild.channels.cache.get(welcomeConfig.channelId);
    if (!channel) {
      return message.reply('❌ Welcome channel not found. Please reconfigure.\n❌ لم يتم العثور على قناة الترحيب. الرجاء إعادة التكوين.');
    }

    try {
      if (welcomeConfig.imageUrl) {
        const { createCanvas, loadImage } = require('canvas');
        const { AttachmentBuilder } = require('discord.js');
        
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

        const avatar = await loadImage(message.author.displayAvatarURL({ extension: 'png', size: 512 }));
        ctx.drawImage(avatar, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);

        ctx.restore();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
        ctx.stroke();

        const imageBuffer = canvas.toBuffer('image/png');
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome-test.png' });
        
        await channel.send({ 
          content: `🧪 **Welcome Test** | Testing for ${message.author}`,
          files: [attachment] 
        });
      }

      if (welcomeConfig.message) {
        const testMessage = welcomeConfig.message
          .replace(/{user}/g, `<@${message.author.id}>`)
          .replace(/{username}/g, message.author.username)
          .replace(/{server}/g, message.guild.name)
          .replace(/{membercount}/g, message.guild.memberCount.toString())
          .replace(/{inviter}/g, 'Test Inviter');
        
        await channel.send(testMessage);
      }

      message.reply(`✅ Test welcome message sent to ${channel}!\n✅ تم إرسال رسالة ترحيب تجريبية إلى ${channel}!`);
    } catch (error) {
      console.error('Error testing welcome:', error);
      message.reply(`❌ Error testing welcome message: ${error.message}\n❌ خطأ في اختبار رسالة الترحيب: ${error.message}`);
    }
  }
};
