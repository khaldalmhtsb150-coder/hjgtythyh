module.exports = {
  name: 'removeadmin',
  description: 'إزالة مستخدم من قائمة المشرفين',
  ownerOnly: true,
  async execute(message, args, client) {
    const userId = args[0];

    if (!userId) {
      return message.reply('❌ الاستخدام: `$removeadmin <user_id>`');
    }

    const index = global.admins.indexOf(userId);
    if (index === -1) {
      return message.reply('❌ هذا المستخدم ليس مشرفاً.');
    }

    global.admins.splice(index, 1);
    global.saveAdmins();

    message.reply(`✅ تمت إزالة <@${userId}> من قائمة المشرفين.`);
  }
};
