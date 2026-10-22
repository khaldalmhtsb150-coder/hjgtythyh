module.exports = {
  name: 'addadmin',
  description: 'إضافة مستخدم إلى قائمة المشرفين',
  ownerOnly: true,
  async execute(message, args, client) {
    const userId = args[0];

    if (!userId) {
      return message.reply('❌ الاستخدام: `$addadmin <user_id>`');
    }

    if (global.admins.includes(userId)) {
      return message.reply('❌ هذا المستخدم مشرف بالفعل.');
    }

    global.admins.push(userId);
    global.saveAdmins();

    message.reply(`✅ تمت إضافة <@${userId}> إلى قائمة المشرفين.`);
  }
};
