const { EmbedBuilder } = require('discord.js');
const { getInviteesForInviter, getMembershipDays, formatArabicDays } = require('./inviteTracking');
const { getPrimaryEmbedColor } = require('./primaryEmbedColor');

function buildInviteProfileEmbed(guildId, user) {
  const inviterData = global.invites[guildId]?.[user.id];
  const invitees = getInviteesForInviter(global.invites, guildId, user.id);
  const activeCount = invitees.filter(record => record.joinedAt && record.departedAt == null).length;
  const departedCount = invitees.filter(record => record.departedAt != null).length;
  const unknownCount = invitees.length - activeCount - departedCount;
  const points = inviterData?.points || 0;

  const memberLines = invitees.slice(0, 12).map(record => {
    if (record.departedAt != null) {
      const days = getMembershipDays(record);
      return `🔴 <@${record.userId}> — غادر بعد ${days === null ? 'مدة غير معروفة' : formatArabicDays(days)}`;
    }

    if (record.joinedAt) {
      const days = getMembershipDays(record);
      return `🟢 <@${record.userId}> — موجود منذ ${days === null ? 'مدة غير معروفة' : formatArabicDays(days)}`;
    }

    return `⚪ <@${record.userId}> — سجل قديم، الحالة والمدة غير معروفتين`;
  });

  if (invitees.length > 12) {
    memberLines.push(`… و${invitees.length - 12} عضو آخر`);
  }

  return new EmbedBuilder()
    .setTitle(`📨 سجل دعوات ${user.username}`)
    .setColor(getPrimaryEmbedColor())
    .setThumbnail(user.displayAvatarURL())
    .setDescription(`إحصائيات الدعوات المسجلة لـ <@${user.id}>`)
    .addFields(
      {
        name: '📊 الملخص',
        value: [
          `👥 إجمالي الأعضاء المسجلين: **${invitees.length}**`,
          `🟢 ما زالوا في السيرفر: **${activeCount}**`,
          `🔴 غادروا: **${departedCount}**`,
          `⚪ سجلات قديمة غير مؤكدة: **${unknownCount}**`,
          `⭐ نقاط الدعوات: **${points}**`
        ].join('\n'),
        inline: false
      },
      {
        name: '👤 الأعضاء الذين دعاهم',
        value: memberLines.length ? memberLines.join('\n') : 'لا توجد دعوات مسجلة لهذا العضو.',
        inline: false
      }
    )
    .setFooter({ text: 'مدة العضوية محسوبة من تاريخ دخول العضو للسيرفر' })
    .setTimestamp();
}

module.exports = { buildInviteProfileEmbed };
