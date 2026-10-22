module.exports = {
  name: 'setbanner',
  description: 'تغيير بنر البوت',
  ownerOnly: true,
  async execute(message, args, client) {
    const banner = args[0] || message.attachments.first()?.url;

    if (!banner) {
      return message.reply('❌ الاستخدام: `$setbanner <image_url>` أو أرفق صورة مع الأمر.');
    }

    try {
      await client.user.setBanner(banner);
      return message.reply('✅ تم تغيير بنر البوت بنجاح.');
    } catch (error) {
      console.error('Error changing bot banner:', error);
      return message.reply('❌ تعذر تغيير البنر. تأكد أن الرابط لصورة صالحة وأن Discord يقبلها.');
    }
  }
};
