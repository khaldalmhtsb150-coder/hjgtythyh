module.exports = {
  name: 'setavatar',
  description: 'Change the bot\'s avatar',
  ownerOnly: true,
  async execute(message, args, client) {
    const imageUrl = args[0] || message.attachments.first()?.url;

    if (!imageUrl) {
      return message.reply('❌ Usage: `$setavatar <image_url>` or attach an image');
    }

    try {
      await client.user.setAvatar(imageUrl);
      message.reply('✅ Avatar updated successfully!');
    } catch (error) {
      console.error('Error changing avatar:', error);
      message.reply('❌ Failed to change avatar. Make sure the URL is valid.');
    }
  }
};
