const { ChannelType } = require('discord.js');

module.exports = {
  name: 'wheelticket',
  description: 'فتح تذكرة عجلة للحصول على مكافأة',
  async execute(message, args, client) {
    const guildId = message.guild.id;
    const userId = message.author.id;

    if (!global.wheelConfig[guildId]?.enabled) {
      return message.reply('❌ نظام العجلة غير مفعل في هذا السيرفر.\n💡 المشرف يمكنه تفعيله باستخدام `$wheel on`');
    }

    const userInvites = global.invites[guildId]?.[userId];
    const userPoints = userInvites?.points || 0;

    if (userPoints === 0) {
      return message.reply('❌ ليس لديك أي نقاط.');
    }

    const rewards = global.wheelRewards[guildId];
    if (!rewards || rewards.length === 0) {
      return message.reply('❌ لم يتم إعداد أي مكافآت بعد. الرجاء التواصل مع المشرف.');
    }

    try {
      const thread = await message.channel.threads.create({
        name: `🎡 تذكرة العجلة - ${message.author.username}`,
        type: ChannelType.PrivateThread,
        invitable: false
      });

      await thread.members.add(message.author.id);

      await message.reply(`✅ تم إنشاء تذكرة العجلة الخاصة بك! تحقق من ${thread}`);

      await thread.send(`🎫 **أهلاً ${message.author}!**\n\n🎡 جاري تدوير العجلة...`);

      await new Promise(resolve => setTimeout(resolve, 2000));

      const randomReward = rewards[Math.floor(Math.random() * rewards.length)];

      global.invites[guildId][userId].points -= 1;
      global.saveInvites();

      await thread.send(`🎉 **مبروك!** أنفقت نقطة واحدة وربحت:\n\n🎁 **${randomReward}**\n\n⭐ النقاط المتبقية: ${global.invites[guildId][userId].points}`);

      setTimeout(async () => {
        try {
          await thread.send('✅ سيتم أرشفة هذه التذكرة قريباً. شكراً للعب!');
          await thread.setArchived(true);
        } catch (error) {
          console.error('Error archiving thread:', error);
        }
      }, 10000);

    } catch (error) {
      console.error('Error creating wheel ticket:', error);
      message.reply('❌ فشل إنشاء تذكرة العجلة. الرجاء التأكد من أن لدي صلاحيات إنشاء المواضيع.');
    }
  }
};
