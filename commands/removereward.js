const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'removereward',
  description: 'حذف مكافأة من العجلة',
  permissions: PermissionFlagsBits.ManageGuild,
  async execute(message, args, client) {
    const index = parseInt(args[0]) - 1;

    if (!global.wheelRewards[message.guild.id] || global.wheelRewards[message.guild.id].length === 0) {
      return message.reply('❌ لا توجد مكافآت مُعدة. استخدم `$addreward` لإضافة مكافآت.');
    }

    if (isNaN(index) || index < 0 || index >= global.wheelRewards[message.guild.id].length) {
      return message.reply(`❌ رقم غير صحيح. استخدم \`$listrewards\` لعرض جميع المكافآت.`);
    }

    const removed = global.wheelRewards[message.guild.id].splice(index, 1)[0];
    global.saveWheelRewards();

    message.reply(`✅ تم حذف المكافأة: **${removed}**`);
  }
};
