const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { getPrimaryEmbedColor } = require('../utils/primaryEmbedColor');

const categories = {
  giveaways: {
    label: '🎉 نظام الجيف اواي',
    description: 'أوامر الجيف اواي والجوائز',
    commands: [
      { name: '/gstart', description: 'بدء جيف اواي' },
      { name: '/gend', description: 'إنهاء الجيف اواي مبكراً' },
      { name: '/box', description: 'جيف اواي فوري (أول من يتفاعل يفوز)' },
      { name: '/winners', description: 'عرض الفائزين' }
    ]
  },
  wheel: {
    label: '🎡 العجلة والنقاط',
    description: 'أوامر العجلة والنقاط',
    commands: [
      { name: '/wheelticket', description: 'فتح تذكرة عجلة (يكلف نقطة واحدة)' },
      { name: '/addpoints', description: 'إضافة نقاط لمستخدم' },
      { name: '/addreward', description: 'إضافة مكافأة للعجلة' },
      { name: '/removereward', description: 'حذف مكافأة' },
      { name: '/listrewards', description: 'عرض جميع المكافآت' }
    ]
  },
  invites: {
    label: '🎫 نظام الدعوات',
    description: 'إحصائيات الدعوات وسجل دخول وخروج الأعضاء',
    commands: [
      { name: '/invites', description: 'عرض الأعضاء الذين دعاهم العضو وحالتهم ومدة بقائهم' },
      { name: '/setinvitelog', description: 'تعيين قناة رسائل الدخول والخروج والدعوات' }
    ]
  },
  greetings: {
    label: '👋 نظام الترحيب',
    description: 'إعدادات رسائل الترحيب',
    commands: [
      { name: '/greet', description: 'تفعيل/تعطيل نظام الترحيب' },
      { name: '/setgreet', description: 'تعيين رسالة الترحيب' },
      { name: '/greetduration', description: 'تعيين مدة بقاء رسالة الترحيب' },
      { name: '/testgreet', description: 'اختبار رسالة الترحيب' }
    ]
  },
  welcome: {
    label: '🖼️ نظام الترحيب بالصور',
    description: 'نظام ترحيب متقدم مع صور وأفاتارات',
    commands: [
      { name: '/setwelcomechannel', description: 'تعيين قناة الترحيب' },
      { name: '/setwelcomeimage', description: 'تعيين صورة الخلفية وموقع الأفاتار' },
      { name: '/setwelcomemessage', description: 'تعيين رسالة الترحيب (استخدم {user}, {username}, {server}, {membercount}, {inviter})' },
      { name: '/togglewelcome', description: 'تفعيل/تعطيل نظام الترحيب' },
      { name: '/testwelcome', description: 'اختبار إعدادات الترحيب' }
    ]
  },
  channels: {
    label: '🔒 التحكم بالقنوات',
    description: 'أوامر إظهار/إخفاء القنوات',
    commands: [
      { name: '/hide', description: 'إخفاء القناة من @everyone' },
      { name: '/show', description: 'إظهار القناة لـ @everyone' }
    ]
  },
  moderation: {
    label: '🛡️ الإشراف',
    description: 'أدوات إشراف السيرفر',
    commands: [
      { name: '/ban', description: 'حظر مستخدم' },
      { name: '/unban', description: 'فك حظر مستخدم' },
      { name: '/clear', description: 'مسح الرسائل' },
      { name: '/mute', description: 'كتم مستخدم' },
      { name: '/unmute', description: 'فك كتم مستخدم' },
      { name: '/setlog', description: 'تعيين قناة السجل (مع قائمة اختيار الأحداث)' },
      { name: '/viewlogs', description: 'عرض جميع قنوات السجل المكونة' },
      { name: '/disablelog', description: 'تعطيل نوع سجل معين' }
    ]
  },
  autoline: {
    label: '🖼️ نظام الخط التلقائي',
    description: 'الردود التلقائية على الرسائل',
    commands: [
      { name: '/setline', description: 'تعيين رابط صورة/GIF الخط التلقائي' },
      { name: '/addlinechannel', description: 'إضافة قناة للخط التلقائي' },
      { name: '/removelinechannel', description: 'حذف قناة من الخط التلقائي' },
      { name: '/listlinechannels', description: 'عرض إعدادات الخط التلقائي' },
      { name: '/toggleline', description: 'تفعيل/تعطيل الخط التلقائي' }
    ]
  },
  feedback: {
    label: '💬 نظام التعليقات',
    description: 'نظام تحويل الرسائل',
    commands: [
      { name: '/addfeedbackchannel', description: 'إضافة قناة تعليقات' },
      { name: '/removefeedbackchannel', description: 'حذف قناة تعليقات' },
      { name: '/setfeedbackemojis', description: 'تعيين إيموجيات التفاعل' },
      { name: '/listfeedback', description: 'عرض إعدادات التعليقات' },
      { name: '/togglefeedback', description: 'تفعيل/تعطيل التعليقات' }
    ]
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('عرض جميع الأوامر المتاحة'),
  
  async executeSlash(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('📚 Marka Bot - قائمة المساعدة')
      .setDescription('**__اختر قائمة من القائمة المنسدلة لعرض الأوامر <a:9891729282539192521:1161360261148586045> __**\n\nPrefix: $ للأوامر البادئة <:emoji_2:1435330849242480671>\nSlash: / للأوامر المائلة <:emoji_2:1435330849242480671>')
      .setColor(getPrimaryEmbedColor())
      .setFooter({ text: `طلب بواسطة ${interaction.user.tag}` })
      .setTimestamp();

    const menuOptions = [
      {
        label: categories.giveaways.label,
        description: categories.giveaways.description,
        value: 'giveaways',
        emoji: '🎉'
      },
      {
        label: categories.wheel.label,
        description: categories.wheel.description,
        value: 'wheel',
        emoji: '🎡'
      },
      {
        label: categories.invites.label,
        description: categories.invites.description,
        value: 'invites',
        emoji: '🎫'
      },
      {
        label: categories.greetings.label,
        description: categories.greetings.description,
        value: 'greetings',
        emoji: '👋'
      },
      {
        label: categories.welcome.label,
        description: categories.welcome.description,
        value: 'welcome',
        emoji: '🖼️'
      },
      {
        label: categories.channels.label,
        description: categories.channels.description,
        value: 'channels',
        emoji: '🔒'
      },
      {
        label: categories.moderation.label,
        description: categories.moderation.description,
        value: 'moderation',
        emoji: '🛡️'
      },
      {
        label: categories.autoline.label,
        description: categories.autoline.description,
        value: 'autoline',
        emoji: '🖼️'
      },
      {
        label: categories.feedback.label,
        description: categories.feedback.description,
        value: 'feedback',
        emoji: '💬'
      }
    ];

    const createSelectMenu = () => new StringSelectMenuBuilder()
      .setCustomId('help_category')
      .setPlaceholder('اختر فئة الأوامر')
      .addOptions(menuOptions);

    let dmReply = null;
    let dmRow = null;
    let dmSelectMenu = null;
    let dmFailed = false;
    try {
      dmSelectMenu = createSelectMenu();
      dmRow = new ActionRowBuilder().addComponents(dmSelectMenu);
      dmReply = await interaction.user.send({
        embeds: [embed],
        components: [dmRow]
      });
    } catch (error) {
      console.error('Error sending DM:', error);
      dmFailed = true;
    }

    const chatSelectMenu = createSelectMenu();
    const chatRow = new ActionRowBuilder().addComponents(chatSelectMenu);
    const reply = await interaction.reply({
      embeds: [embed],
      components: [chatRow],
      fetchReply: true
    });

    if (dmFailed) {
      await interaction.followUp({ content: '⚠️ لم أتمكن من إرسال رسالة خاصة. تم عرض القائمة هنا فقط. (Could not send DM. Menu shown here only.)', ephemeral: true }).catch(() => {});
    }

    const chatCollector = reply.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 300000
    });

    let dmCollector = null;
    if (dmReply) {
      dmCollector = dmReply.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        time: 300000
      });
    }

    const handleInteraction = async (i) => {
      const category = categories[i.values[0]];
      
      const categoryEmbed = new EmbedBuilder()
        .setTitle(category.label)
        .setDescription(category.description)
        .setColor(getPrimaryEmbedColor())
        .setFooter({ text: `طلب بواسطة ${i.user.tag}` })
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

      await i.update({
        embeds: [categoryEmbed],
        components: [freshRow]
      });
    };

    chatCollector.on('collect', handleInteraction);
    if (dmCollector) {
      dmCollector.on('collect', handleInteraction);
    }

    chatCollector.on('end', async () => {
      const disabledChatMenu = createSelectMenu().setDisabled(true);
      const disabledRow = new ActionRowBuilder().addComponents(disabledChatMenu);
      
      try {
        await reply.edit({ components: [disabledRow] });
      } catch (error) {
        console.log('Could not edit message - it may have been deleted');
      }
    });

    if (dmCollector) {
      dmCollector.on('end', async () => {
        const disabledDmMenu = createSelectMenu().setDisabled(true);
        const disabledRow = new ActionRowBuilder().addComponents(disabledDmMenu);
        
        try {
          await dmReply.edit({ components: [disabledRow] });
        } catch (error) {
          console.log('Could not edit DM - it may have been deleted');
        }
      });
    }
  }
};
