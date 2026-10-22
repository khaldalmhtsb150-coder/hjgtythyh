module.exports = {
  name: 'setname',
  description: 'تغيير اسم البوت',
  ownerOnly: true,
  async execute(message, args, client) {
    const newName = args.join(' ');

    if (!newName) {
      return message.reply('❌ الاستخدام: `$setname <الاسم_الجديد>`');
    }

    if (newName.length < 2 || newName.length > 32) {
      return message.reply('❌ الاسم يجب أن يكون بين 2 و 32 حرف.');
    }

    try {
      const oldName = client.user.username;
      await client.user.setUsername(newName);
      message.reply(`✅ تم تغيير الاسم من **${oldName}** إلى **${newName}**`);
    } catch (error) {
      console.error('Error changing username:', error);
      message.reply('❌ فشل تغيير الاسم. يمكنك فقط تغييره مرتين في الساعة.');
    }
  }
};
