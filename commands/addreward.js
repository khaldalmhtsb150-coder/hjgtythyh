const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'addreward',
  description: 'إضافة مكافأة للعجلة',
  permissions: PermissionFlagsBits.ManageGuild,
  async execute(message, args, client) {
    const reward = args.join(' ');

    if (!reward) {
      return message.reply('❌ الرجاء إدخال المكافأة.\nالاستخدام: `$addreward <وصف المكافأة>`');
    }

    if (!global.wheelRewards[message.guild.id]) {
      global.wheelRewards[message.guild.id] = [];
    }

    global.wheelRewards[message.guild.id].push(reward);
    global.saveWheelRewards();

    message.reply(`✅ تمت إضافة المكافأة: **${reward}**\nإجمالي المكافآت: ${global.wheelRewards[message.guild.id].length}`);
  }
};
