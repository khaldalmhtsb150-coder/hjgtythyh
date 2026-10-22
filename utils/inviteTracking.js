function getGuildRecords(invites, guildId) {
  const guildInvites = invites[guildId] || {};
  const records = [];

  for (const [inviterId, inviterData] of Object.entries(guildInvites)) {
    for (const record of inviterData?.invites || []) {
      if (record?.userId) {
        records.push({ inviterId, record });
      }
    }
  }

  return records;
}

function getInviteeRecords(invites, guildId, userId) {
  return getGuildRecords(invites, guildId)
    .filter(({ record }) => record.userId === userId);
}

function latestRecord(records) {
  return records.reduce((latest, current) => {
    if (!latest) return current;
    const latestTime = Number(latest.record.joinedAt || latest.record.timestamp || 0);
    const currentTime = Number(current.record.joinedAt || current.record.timestamp || 0);
    return currentTime >= latestTime ? current : latest;
  }, null);
}

function recordInviteJoin(invites, guildId, inviterId, member, joinedAt, awardPoint) {
  if (!invites[guildId]) invites[guildId] = {};
  if (!invites[guildId][inviterId]) {
    invites[guildId][inviterId] = { points: 0, invites: [] };
  }

  const priorRecords = getInviteeRecords(invites, guildId, member.id);
  const activeRecord = priorRecords.find(({ inviterId: recordInviterId, record }) =>
    record.departedAt == null &&
    record.joinedAt &&
    Number(record.joinedAt) === Number(joinedAt) &&
    recordInviterId === inviterId
  );

  if (activeRecord) {
    activeRecord.record.joinedAt = activeRecord.record.joinedAt || joinedAt;
    activeRecord.record.memberCreatedAt = member.user.createdTimestamp;
    return { pointsAwarded: false, record: activeRecord.record };
  }

  // Close stale open records in case the bot was offline when a previous leave happened.
  for (const { record } of priorRecords) {
    if (record.departedAt == null) {
      record.membershipUnknown = true;
      record.joinedAt = record.joinedAt || record.timestamp || joinedAt;
      record.departedAt = joinedAt;
    }
  }

  const record = {
    userId: member.id,
    timestamp: joinedAt,
    joinedAt,
    memberCreatedAt: member.user.createdTimestamp,
    departedAt: null
  };
  invites[guildId][inviterId].invites.push(record);

  const pointsAwarded = priorRecords.length === 0 && awardPoint;
  if (pointsAwarded) {
    invites[guildId][inviterId].points = (invites[guildId][inviterId].points || 0) + 1;
  }

  return { pointsAwarded, record };
}

function markInviteeLeft(invites, guildId, memberId, departedAt, memberCreatedAt, actualJoinedAt, membershipEndKnown = true) {
  const records = getInviteeRecords(invites, guildId, memberId);

  for (const { record } of records) {
    if (record.departedAt == null) {
      if (!membershipEndKnown || (!record.joinedAt && !actualJoinedAt)) {
        record.membershipUnknown = true;
      }
      record.joinedAt = record.joinedAt || actualJoinedAt || record.timestamp || departedAt;
      record.departedAt = departedAt;
    }
    if (!record.memberCreatedAt && memberCreatedAt) {
      record.memberCreatedAt = memberCreatedAt;
    }
  }

  const latest = latestRecord(records);
  return latest ? { ...latest, records } : { inviterId: null, record: null, records };
}

function markUnknownInviteJoin(invites, guildId, memberId, joinedAt, memberCreatedAt) {
  const priorRecords = getInviteeRecords(invites, guildId, memberId);
  const hasOpenRecord = priorRecords.some(({ record }) => record.departedAt == null);
  if (!hasOpenRecord) return false;

  markInviteeLeft(
    invites,
    guildId,
    memberId,
    joinedAt,
    memberCreatedAt,
    null,
    false
  );
  return true;
}

function getInviteesForInviter(invites, guildId, inviterId) {
  const inviterInvites = invites[guildId]?.[inviterId]?.invites || [];
  const uniqueInvitees = new Map();

  for (const record of inviterInvites) {
    if (!record?.userId) continue;
    const existing = uniqueInvitees.get(record.userId);
    const existingTime = Number(existing?.joinedAt || existing?.timestamp || 0);
    const currentTime = Number(record.joinedAt || record.timestamp || 0);
    if (!existing || currentTime >= existingTime) {
      uniqueInvitees.set(record.userId, record);
    }
  }

  return [...uniqueInvitees.values()]
    .sort((a, b) => Number(b.joinedAt || b.timestamp || 0) - Number(a.joinedAt || a.timestamp || 0));
}

function getMembershipDays(record, now = Date.now()) {
  if (record?.membershipUnknown) return null;
  const joinedAt = Number(record?.joinedAt || 0);
  if (!joinedAt) return null;

  const end = Number(record.departedAt || now);
  return Math.max(0, Math.floor((end - joinedAt) / (24 * 60 * 60 * 1000)));
}

function formatArabicDays(days) {
  return `${days} ${days === 1 ? 'يوم' : 'أيام'}`;
}

module.exports = {
  getGuildRecords,
  getInviteeRecords,
  recordInviteJoin,
  markInviteeLeft,
  markUnknownInviteJoin,
  getInviteesForInviter,
  getMembershipDays,
  formatArabicDays
};
