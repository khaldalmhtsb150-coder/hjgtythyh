const { SlashCommandBuilder, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wheelticket')
    .setDescription('Open a wheel ticket to claim a reward'),

  async executeSlash(interaction, client) {
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    const userInvites = global.invites[guildId]?.[userId];
    const userPoints = userInvites?.points || 0;

    if (userPoints === 0) {
      return interaction.reply({ 
        content: '❌ You don\'t have any points.', 
        ephemeral: true 
      });
    }

    const rewards = global.wheelRewards[guildId];
    if (!rewards || rewards.length === 0) {
      return interaction.reply({ 
        content: '❌ No rewards have been configured yet. Please contact an admin.', 
        ephemeral: true 
      });
    }

    try {
      await interaction.deferReply({ ephemeral: true });

      const thread = await interaction.channel.threads.create({
        name: `🎡 Wheel Ticket - ${interaction.user.username}`,
        type: ChannelType.PrivateThread,
        invitable: false
      });

      await thread.members.add(interaction.user.id);

      await interaction.editReply(`✅ Your private wheel ticket has been created! Check ${thread}`);

      await thread.send(`🎫 **Welcome ${interaction.user}!**\n\n🎡 Spinning the wheel...`);

      await new Promise(resolve => setTimeout(resolve, 2000));

      const randomReward = rewards[Math.floor(Math.random() * rewards.length)];

      global.invites[guildId][userId].points -= 1;
      global.saveInvites();

      await thread.send(`🎉 **Congratulations!** You spent 1 point and won:\n\n🎁 **${randomReward}**\n\n⭐ Remaining points: ${global.invites[guildId][userId].points}`);

      setTimeout(async () => {
        try {
          await thread.send('✅ This ticket will auto-archive in a moment. Thank you for playing!');
          await thread.setArchived(true);
        } catch (error) {
          console.error('Error archiving thread:', error);
        }
      }, 10000);

    } catch (error) {
      console.error('Error creating wheel ticket:', error);
      await interaction.editReply('❌ Failed to create your wheel ticket. Please make sure I have proper permissions to create threads.');
    }
  }
};
