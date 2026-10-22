const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('testwelcome')
    .setDescription('Test the welcome message configuration')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  
  async execute(interaction) {
    const guildId = interaction.guild.id;
    
    const welcomeConfig = global.welcome[guildId];
    
    if (!welcomeConfig || !welcomeConfig.channelId) {
      return await interaction.reply({
        content: '❌ Welcome system is not configured yet.\n❌ نظام الترحيب غير مكون بعد.\n\nUse `/setwelcomechannel` to get started.',
        ephemeral: true
      });
    }

    const channel = interaction.guild.channels.cache.get(welcomeConfig.channelId);
    if (!channel) {
      return await interaction.reply({
        content: '❌ Welcome channel not found. Please reconfigure.\n❌ لم يتم العثور على قناة الترحيب. الرجاء إعادة التكوين.',
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      if (welcomeConfig.imageUrl) {
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

        const avatar = await loadImage(interaction.user.displayAvatarURL({ extension: 'png', size: 512 }));
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
          content: `🧪 **Welcome Test** | Testing for ${interaction.user}`,
          files: [attachment] 
        });
      }

      if (welcomeConfig.message) {
        const testMessage = welcomeConfig.message
          .replace(/{user}/g, `<@${interaction.user.id}>`)
          .replace(/{username}/g, interaction.user.username)
          .replace(/{server}/g, interaction.guild.name)
          .replace(/{membercount}/g, interaction.guild.memberCount.toString())
          .replace(/{inviter}/g, 'Test Inviter');
        
        await channel.send(testMessage);
      }

      await interaction.editReply({
        content: `✅ Test welcome message sent to ${channel}!\n✅ تم إرسال رسالة ترحيب تجريبية إلى ${channel}!`
      });
    } catch (error) {
      console.error('Error testing welcome:', error);
      await interaction.editReply({
        content: `❌ Error testing welcome message: ${error.message}\n❌ خطأ في اختبار رسالة الترحيب: ${error.message}`
      });
    }
  }
};
