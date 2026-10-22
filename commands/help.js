const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { getPrimaryEmbedColor } = require('../utils/primaryEmbedColor');

const HELP_CATEGORY_EMOJI = '<:emoji_6:1557325564854140939>';
const HELP_COMMAND_EMOJI = '<:emoji_6:1557325564854140939>';
const HELP_MENU_EMOJI = { id: '1557325564854140939', name: 'emoji_6' };
const BOT_INVITE_URL = 'https://discord.com/api/oauth2/authorize?client_id=1434927077030887544&scope=bot+applications.commands&permissions=8';
const HELP_CATEGORIES_DESCRIPTION = `**Categories :
- ${HELP_CATEGORY_EMOJI} Giveaway Commands : القيف اواي
- ${HELP_CATEGORY_EMOJI} Wheel Commands : العجلة
- ${HELP_CATEGORY_EMOJI} نظام الدعوات
- ${HELP_CATEGORY_EMOJI} Greet Commands : ترحيب مؤقت
- ${HELP_CATEGORY_EMOJI} Welcome System : نظام الترحيب بالصور
- ${HELP_CATEGORY_EMOJI} Channel Control : التحكم بالشات
- ${HELP_CATEGORY_EMOJI} Supervision : الإشراف
- ${HELP_CATEGORY_EMOJI} autoline : الخط التلقائي
- ${HELP_CATEGORY_EMOJI} Feedback : التعليقات
- ${HELP_CATEGORY_EMOJI} Jail System : نظام السجن
- ${HELP_CATEGORY_EMOJI} Custom Replies : الردود التلقائية**`;

const categories = {
  giveaways: {
    label: `${HELP_CATEGORY_EMOJI} Giveaway Commands : القيف اواي`,
    description: 'أوامر الجيف اواي والجوائز',
    commands: [
      { name: '$gstart <duration> <winners> <prize>', description: 'بدء جيف اواي' },
      { name: '$gend <message_id>', description: 'إنهاء الجيف اواي مبكراً' },
      { name: '$box <prize>', description: 'جيف اواي فوري (أول من يتفاعل يفوز)' },
      { name: '$winners <message_id>', description: 'عرض الفائزين' }
    ]
  },
  wheel: {
    label: `${HELP_CATEGORY_EMOJI} Wheel Commands : العجلة`,
    description: 'أوامر العجلة والنقاط',
    commands: [
      { name: '$wheel <on|off>', description: 'تفعيل/تعطيل نظام العجلة' },
      { name: '$wheelticket', description: 'فتح تذكرة عجلة (يكلف نقطة واحدة)' },
      { name: '$addpoints @user <amount>', description: 'إضافة نقاط لمستخدم' },
      { name: '$addreward <reward>', description: 'إضافة مكافأة للعجلة' },
      { name: '$removereward <number>', description: 'حذف مكافأة' },
      { name: '$listrewards', description: 'عرض جميع المكافآت' }
    ]
  },
  invites: {
    label: `${HELP_CATEGORY_EMOJI} نظام الدعوات`,
    description: 'إحصائيات الدعوات وسجل دخول وخروج الأعضاء',
    commands: [
      { name: '$invites [@user]', description: 'عرض الأعضاء الذين دعاهم العضو وحالتهم ومدة بقائهم' },
      { name: '$setinvitelog #channel', description: 'تعيين قناة رسائل الدخول والخروج والدعوات' }
    ]
  },
  greetings: {
    label: `${HELP_CATEGORY_EMOJI} Greet Commands : ترحيب مؤقت`,
    description: 'إعدادات رسائل الترحيب',
    commands: [
      { name: '$greet <on|off>', description: 'تفعيل/تعطيل نظام الترحيب' },
      { name: '$setgreet <#channel> <message>', description: 'تعيين رسالة الترحيب' },
      { name: '$greetduration <seconds>', description: 'تعيين مدة بقاء رسالة الترحيب' },
      { name: '$testgreet', description: 'اختبار رسالة الترحيب' }
    ]
  },
  welcome: {
    label: `${HELP_CATEGORY_EMOJI} Welcome System : نظام الترحيب بالصور`,
    description: 'نظام ترحيب متقدم مع صور وأفاتارات',
    commands: [
      { name: '$setwelcomechannel #channel', description: 'تعيين قناة الترحيب' },
      { name: '$setwelcomeimage <url> [x] [y] [radius]', description: 'تعيين صورة الخلفية وموقع الأفاتار' },
      { name: '$setwelcomemessage <message>', description: 'تعيين رسالة الترحيب (استخدم {user}, {username}, {server}, {membercount}, {inviter})' },
      { name: '$togglewelcome <on|off>', description: 'تفعيل/تعطيل نظام الترحيب' },
      { name: '$testwelcome', description: 'اختبار إعدادات الترحيب' }
    ]
  },
  channels: {
    label: `${HELP_CATEGORY_EMOJI} Channel Control : التحكم بالشات`,
    description: 'أوامر إظهار/إخفاء القنوات',
    commands: [
      { name: '$hide [#channel]', description: 'إخفاء القناة من @everyone' },
      { name: '$show [#channel]', description: 'إظهار القناة لـ @everyone' }
    ]
  },
  moderation: {
    label: `${HELP_CATEGORY_EMOJI} Supervision : الإشراف`,
    description: 'أدوات إشراف السيرفر',
    commands: [
      { name: '$ban <@user> [reason]', description: 'حظر مستخدم' },
      { name: '$unban <user_id>', description: 'فك حظر مستخدم' },
      { name: '$clear <1-100>', description: 'مسح الرسائل' },
      { name: '$mute <@user> <duration> [reason]', description: 'كتم مستخدم' },
      { name: '$unmute <@user>', description: 'فك كتم مستخدم' },
      { name: '$setlog #channel', description: 'تعيين قناة السجل (مع قائمة اختيار الأحداث)' },
      { name: '$viewlogs', description: 'عرض جميع قنوات السجل المكونة' },
      { name: '$disablelog', description: 'تعطيل نوع سجل معين' }
    ]
  },
  autoline: {
    label: `${HELP_CATEGORY_EMOJI} autoline : الخط التلقائي`,
    description: 'الردود التلقائية على الرسائل',
    commands: [
      { name: '$setline <url>', description: 'تعيين رابط صورة/GIF الخط التلقائي' },
      { name: '$addlinechannel #channel', description: 'إضافة قناة للخط التلقائي' },
      { name: '$removelinechannel #channel', description: 'حذف قناة من الخط التلقائي' },
      { name: '$listlinechannels', description: 'عرض إعدادات الخط التلقائي' },
      { name: '$toggleline [on/off]', description: 'تفعيل/تعطيل الخط التلقائي' }
    ]
  },
  feedback: {
    label: `${HELP_CATEGORY_EMOJI} Feedback : التعليقات`,
    description: 'نظام تحويل الرسائل',
    commands: [
      { name: '$addfeedbackchannel #channel', description: 'إضافة قناة تعليقات' },
      { name: '$removefeedbackchannel #channel', description: 'حذف قناة تعليقات' },
      { name: '$setfeedbackemojis <emojis>', description: 'تعيين إيموجيات التفاعل' },
      { name: '$listfeedback', description: 'عرض إعدادات التعليقات' },
      { name: '$togglefeedback [on/off]', description: 'تفعيل/تعطيل التعليقات' }
    ]
  },
  jail: {
    label: `${HELP_CATEGORY_EMOJI} Jail System : نظام السجن`,
    description: 'سجن وإطلاق سراح الأعضاء',
    commands: [
      { name: '$اسجن @user [duration] [reason]', description: 'سجن عضو (المدة اختيارية: 1m, 1h, 1d)' },
      { name: '$عفو @user [reason]', description: 'إطلاق سراح عضو من السجن' },
      { name: '$jaillist', description: 'عرض قائمة المسجونين' },
      { name: '$setjailchat #channel', description: 'تعيين قناة السجن (للمسجونين فقط)' },
      { name: '$setjaillog #channel', description: 'تعيين قناة سجل السجن' },
      { name: '$setjailstaff @role', description: 'تعيين رتبة موظفي السجن' }
    ]
  },
  settings: {
    label: `${HELP_CATEGORY_EMOJI} الإعدادات`,
    description: 'إعدادات وتخصيصات البوت',
    commands: [
      { name: '$markagiv [on/off]', description: 'تفعيل/تعطيل رتبة marka giv' }
    ]
  },
  customReplies: {
    label: `${HELP_CATEGORY_EMOJI} Custom Replies : الردود التلقائية`,
    description: 'نظام الردود التلقائية المخصصة',
    commands: [
      { name: '$addreply <trigger> | <response>', description: 'إضافة رد تلقائي جديد' },
      { name: '$removereply <trigger>', description: 'حذف رد تلقائي' },
      { name: '$listreplies', description: 'عرض جميع الردود التلقائية' },
      { name: '$togglereply [on/off]', description: 'تفعيل/تعطيل نظام الردود التلقائية' }
    ]
  }
};

module.exports = {
  name: 'help',
  description: 'عرض جميع الأوامر المتاحة',
  async execute(message, args) {
    const botInvite = BOT_INVITE_URL;
    const supportServer = 'https://discord.gg/PBkRtApfG4';

    const channelEmbed = new EmbedBuilder()
      .setTitle('⚙️ Marka Bot - help list')
      .setDescription(HELP_CATEGORIES_DESCRIPTION)
      .setColor(getPrimaryEmbedColor())
      .setFooter({ text: `طلب بواسطة ${message.author.username}` })
      .setTimestamp();

    const dmEmbed = new EmbedBuilder()
      .setTitle('⚙️ Marka Bot - help list')
      .setDescription(HELP_CATEGORIES_DESCRIPTION)
      .addFields({
        name: '🤖 Bot Invite',
        value: `[رابط إدخال البوت](${botInvite})`,
        inline: false
      })
      .setColor(getPrimaryEmbedColor())
      .setFooter({ text: `طلب بواسطة ${message.author.username}` })
      .setTimestamp();

    const menuOptions = [
      {
        label: 'Giveaway Commands : القيف اواي',
        description: categories.giveaways.description,
        value: 'giveaways'
      },
      {
        label: 'Wheel Commands : العجلة',
        description: categories.wheel.description,
        value: 'wheel'
      },
      {
        label: 'نظام الدعوات',
        description: categories.invites.description,
        value: 'invites'
      },
      {
        label: 'Greet Commands : ترحيب مؤقت',
        description: categories.greetings.description,
        value: 'greetings'
      },
      {
        label: 'Welcome System : نظام الترحيب بالصور',
        description: categories.welcome.description,
        value: 'welcome'
      },
      {
        label: 'Channel Control : التحكم بالشات',
        description: categories.channels.description,
        value: 'channels'
      },
      {
        label: 'Supervision : الإشراف',
        description: categories.moderation.description,
        value: 'moderation'
      },
      {
        label: 'autoline : الخط التلقائي',
        description: categories.autoline.description,
        value: 'autoline'
      },
      {
        label: 'Feedback : التعليقات',
        description: categories.feedback.description,
        value: 'feedback'
      },
      {
        label: 'Jail System : نظام السجن',
        description: categories.jail.description,
        value: 'jail'
      },
      {
        label: 'الإعدادات',
        description: categories.settings.description,
        value: 'settings'
      },
      {
        label: 'Custom Replies : الردود التلقائية',
        description: categories.customReplies.description,
        value: 'customReplies'
      }
    ].map(option => ({
      ...option,
      emoji: { ...HELP_MENU_EMOJI }
    }));

    const createSelectMenu = () => new StringSelectMenuBuilder()
      .setCustomId('help_category')
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
          name: `${HELP_COMMAND_EMOJI} ${cmd.name}`,
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
