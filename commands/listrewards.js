module.exports = {
  name: 'listrewards',
  description: 'عرض جميع مكافآت العجلة',
  async execute(message, args, client) {
    const rewards = global.wheelRewards[message.guild.id];

    if (!rewards || rewards.length === 0) {
      return message.reply('📭 لا توجد مكافآت للعجلة حتى الآن.\nاستخدم `$addreward <المكافأة>` لإضافة مكافآت.');
    }

    const list = rewards.map((reward, index) => `${index + 1}. ${reward}`).join('\n');
    
    message.reply(`🎁 **مكافآت العجلة**\n\n${list}\n\nالإجمالي: ${rewards.length} مكافأة`);
  }
};
