const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { getPrimaryEmbedColor } = require('../utils/primaryEmbedColor');

const categories = {
  botManagement: {
    label: '🤖 Bot Management : إدارة البوت',
    description: 'أوامر التحكم في البوت (للمالك فقط)',
    commands: [
      { name: '$servers', description: 'عرض قائمة السيرفرات التي بها البوت' },
      { name: '$leave <server_id>', description: 'مغادرة سيرفر معين' },
      { name: '$setname <new_name>', description: 'تغيير اسم البوت' },
      { name: '$setavatar <image_url>', description: 'تغيير صورة البوت' },
      { name: '$setbanner <image_url>', description: 'تغيير بنر البوت أو أرفق صورة' },
      { name: '$setcolor <#RRGGBB|default>', description: 'تغيير اللون الأساسي لإمبيدات البوت' },
      { name: '$setstatus <text>', description: 'تغيير حالة البوت' }
    ]
  },
  adminSystem: {
    label: '👑 Admin System : نظام المشرفين',
    description: 'إدارة مشرفي البوت (للمالك فقط)',
    commands: [
      { name: '$addadmin <user_id>', description: 'إضافة مستخدم إلى قائمة المشرفين' },
      { name: '$removeadmin <user_id>', description: 'إزالة مستخدم من قائمة المشرفين' },
      { name: '$adminlist', description: 'عرض قائمة مشرفي البوت' }
    ]
  },
  blacklistSystem: {
    label: '🚫 Blacklist System : القائمة السوداء',
    description: 'إدارة القائمة السوداء (للمالك فقط)',
    commands: [
      { name: '$blacklist user <user_id>', description: 'حظر/فك حظر مستخدم من البوت' },
      { name: '$blacklist server <server_id>', description: 'حظر/فك حظر سيرفر' },
      { name: '$blacklist list', description: 'عرض قائمة المحظورين' }
    ]
  },
  commandManagement: {
    label: '⚙️ Command Management : إدارة الأوامر',
    description: 'التحكم في الأوامر للسيرفرات (للمالك فقط)',
    commands: [
      { name: '$uncom <server_id> <command>', description: 'تعطيل أمر في سيرفر معين' },
      { name: '$recom <server_id> <command>', description: 'إعادة تفعيل أمر معطل' },
      { name: '$listdisabled [server_id]', description: 'عرض الأوامر المعطلة' }
    ]
  }
};

module.exports = {
  name: 'helpp',
  description: 'عرض أوامر المشرفين والمالك',
  async execute(message, args, client) {
    const isOwner = global.isOwner(message.author.id);
    const isAdmin = global.admins && global.admins.includes(message.author.id);

    if (!isOwner && !isAdmin) {
      return message.reply('❌ هذا الأمر متاح فقط لمشرفي ومالك البوت.');
    }

    let botInvite = 'Bot invite not available';

    try {
      const { PermissionFlagsBits } = require('discord.js');
      botInvite = await client.generateInvite({
        permissions: [
          PermissionFlagsBits.Administrator
        ],
        scopes: ['bot', 'applications.commands']
      });
    } catch (error) {
      console.error('Error generating bot invite:', error);
    }

    const supportServer = 'https://discord.gg/PBkRtApfG4';

    const channelEmbed = new EmbedBuilder()
      .setTitle('👑 Marka Bot - Admin & Owner Commands')
      .setDescription('**Categories :\n- 🤖 Bot Management : إدارة البوت\n- 👑 Admin System : نظام المشرفين\n- 🚫 Blacklist System : القائمة السوداء\n- ⚙️ Command Management : إدارة الأوامر**\n\n*هذه الأوامر متاحة فقط للمالك والمشرفين*')
      .addFields(
        { name: '🔗 Support Server', value: supportServer, inline: false }
      )
      .setColor(getPrimaryEmbedColor())
      .setFooter({ text: `طلب بواسطة ${message.author.username}` })
      .setTimestamp();

    const dmEmbed = new EmbedBuilder()
      .setTitle('👑 Marka Bot - Admin & Owner Commands')
      .setDescription('**Categories :\n- 🤖 Bot Management : إدارة البوت\n- 👑 Admin System : نظام المشرفين\n- 🚫 Blacklist System : القائمة السوداء\n- ⚙️ Command Management : إدارة الأوامر**\n\n*هذه الأوامر متاحة فقط للمالك والمشرفين*')
      .setColor(getPrimaryEmbedColor())
      .setFooter({ text: `طلب بواسطة ${message.author.username}` })
      .setTimestamp();

    const menuOptions = [
      {
        label: 'Bot Management : إدارة البوت',
        description: categories.botManagement.description,
        value: 'botManagement',
        emoji: '🤖'
      },
      {
        label: 'Admin System : نظام المشرفين',
        description: categories.adminSystem.description,
        value: 'adminSystem',
        emoji: '👑'
      },
      {
        label: 'Blacklist System : القائمة السوداء',
        description: categories.blacklistSystem.description,
        value: 'blacklistSystem',
        emoji: '🚫'
      },
      {
        label: 'Command Management : إدارة الأوامر',
        description: categories.commandManagement.description,
        value: 'commandManagement',
        emoji: '⚙️'
      }
    ];

    const createSelectMenu = () => new StringSelectMenuBuilder()
      .setCustomId('helpp_category')
      .setPlaceholder('اختر فئة الأوامر')
      .addOptions(menuOptions);

    let dmReply = null;
    let dmRow = null;
    let dmSelectMenu = null;
    try {
      const dmMessage = `**Prefix:** $\n**Support Server:** ${supportServer}\n**Bot Invite:** ${botInvite}`;
      dmSelectMenu = createSelectMenu();
      dmRow = new ActionRowBuilder().addComponents(dmSelectMenu);
      dmReply = await message.author.send({
        content: dmMessage,
        embeds: [dmEmbed],
        components: [dmRow]
      });
    } catch (error) {
      console.error('Error sending DM:', error);
      await message.channel.send('⚠️ لم أتمكن من إرسال رسالة خاصة. تم عرض القائمة هنا فقط. (Could not send DM. Menu shown here only.)').catch(() => {});
    }

    const chatSelectMenu = createSelectMenu();
    const chatRow = new ActionRowBuilder().addComponents(chatSelectMenu);
    const reply = await message.reply({
      embeds: [channelEmbed],
      components: [chatRow]
    });

    const chatCollector = reply.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id
    });

    let dmCollector = null;
    if (dmReply) {
      dmCollector = dmReply.createMessageComponentCollector({
        filter: (i) => i.user.id === message.author.id
      });
    }

    const handleInteraction = async (interaction) => {
      const category = categories[interaction.values[0]];
      
      const categoryEmbed = new EmbedBuilder()
        .setTitle(category.label)
        .setDescription(category.description)
        .setColor(getPrimaryEmbedColor())
        .setFooter({ text: `طلب بواسطة ${interaction.user.username}` })
        .setTimestamp();

      category.commands.forEach(cmd => {
        categoryEmbed.addFields({
          name: cmd.name,
          value: cmd.description,
          inline: false
        });
      });

      const freshSelectMenu = createSelectMenu();
      const freshRow = new ActionRowBuilder().addComponents(freshSelectMenu);

      await interaction.update({
        embeds: [categoryEmbed],
        components: [freshRow]
      });
    };

    chatCollector.on('collect', handleInteraction);
    if (dmCollector) {
      dmCollector.on('collect', handleInteraction);
    }
  }
};
