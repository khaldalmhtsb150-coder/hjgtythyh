const { afterEach, test } = require('node:test');
const assert = require('node:assert/strict');
const {
  recordInviteJoin,
  markInviteeLeft,
  markUnknownInviteJoin
} = require('../utils/inviteTracking');
const { buildInviteProfileEmbed } = require('../utils/inviteProfile');

const GUILD_ID = 'guild-1';
const INVITER_ID = 'inviter-1';
const MEMBER_ID = 'member-1';
const DAY_MS = 24 * 60 * 60 * 1000;

afterEach(() => {
  delete global.invites;
});

function freshInviteData(points = 0) {
  return {
    [GUILD_ID]: {
      [INVITER_ID]: {
        points,
        invites: []
      }
    }
  };
}

function getProfile(invites, inviterId = INVITER_ID) {
  global.invites = invites;
  return buildInviteProfileEmbed(GUILD_ID, {
    id: inviterId,
    username: 'test-inviter',
    displayAvatarURL: () => 'https://example.com/avatar.png'
  }).toJSON();
}

function assertProfile(invites, expectedSummary, expectedMemberText) {
  const embed = getProfile(invites);
  const summary = embed.fields.find(field => field.name === '📊 الملخص');
  const members = embed.fields.find(field => field.name === '👤 الأعضاء الذين دعاهم');

  assert.ok(summary, 'profile should contain the invite summary');
  assert.equal(summary.value, expectedSummary);
  if (expectedMemberText) {
    assert.ok(members.value.includes(expectedMemberText), members.value);
  } else {
    assert.equal(members.value, 'لا توجد دعوات مسجلة لهذا العضو.');
  }
}

function expectedSummary(total, active, departed, unknown, points) {
  return [
    `👥 إجمالي الأعضاء المسجلين: **${total}**`,
    `🟢 ما زالوا في السيرفر: **${active}**`,
    `🔴 غادروا: **${departed}**`,
    `⚪ سجلات قديمة غير مؤكدة: **${unknown}**`,
    `⭐ نقاط الدعوات: **${points}**`
  ].join('\n');
}

function makeMember(createdTimestamp = Date.now() - 100 * DAY_MS) {
  return {
    id: MEMBER_ID,
    user: { createdTimestamp }
  };
}

test('new known invite is shown as active and awards one point only once', () => {
  const invites = freshInviteData();
  const joinedAt = Date.now();
  const member = makeMember();

  const firstJoin = recordInviteJoin(invites, GUILD_ID, INVITER_ID, member, joinedAt, true);

  assert.equal(firstJoin.pointsAwarded, true);
  assert.equal(firstJoin.record.userId, MEMBER_ID);
  assertProfile(
    invites,
    expectedSummary(1, 1, 0, 0, 1),
    `🟢 <@${MEMBER_ID}> — موجود منذ`
  );

  const repeatedEvent = recordInviteJoin(invites, GUILD_ID, INVITER_ID, member, joinedAt, true);
  assert.equal(repeatedEvent.pointsAwarded, false);
  assert.equal(invites[GUILD_ID][INVITER_ID].invites.length, 1);
  assertProfile(
    invites,
    expectedSummary(1, 1, 0, 0, 1),
    `🟢 <@${MEMBER_ID}> — موجود منذ`
  );
});

test('a new member with an unknown invite is not attributed or awarded points', () => {
  const invites = freshInviteData();
  const handled = markUnknownInviteJoin(
    invites,
    GUILD_ID,
    MEMBER_ID,
    Date.now(),
    makeMember().user.createdTimestamp
  );

  assert.equal(handled, false);
  assert.deepEqual(invites[GUILD_ID][INVITER_ID].invites, []);
  assertProfile(invites, expectedSummary(0, 0, 0, 0, 0), null);
});

test('member departure updates the summary without removing invite points', () => {
  const invites = freshInviteData();
  const joinedAt = Date.now() - 2 * DAY_MS;
  recordInviteJoin(invites, GUILD_ID, INVITER_ID, makeMember(), joinedAt, true);

  const result = markInviteeLeft(
    invites,
    GUILD_ID,
    MEMBER_ID,
    joinedAt + 2 * DAY_MS,
    makeMember().user.createdTimestamp,
    joinedAt
  );

  assert.equal(result.inviterId, INVITER_ID);
  assert.equal(result.record.departedAt, joinedAt + 2 * DAY_MS);
  assertProfile(
    invites,
    expectedSummary(1, 0, 1, 0, 1),
    `🔴 <@${MEMBER_ID}> — غادر بعد 2 أيام`
  );
});

test('a returning member is active again and does not earn a duplicate point', () => {
  const invites = freshInviteData();
  const firstJoinAt = Date.now() - 4 * DAY_MS;
  const member = makeMember();
  recordInviteJoin(invites, GUILD_ID, INVITER_ID, member, firstJoinAt, true);
  markInviteeLeft(
    invites,
    GUILD_ID,
    MEMBER_ID,
    firstJoinAt + 2 * DAY_MS,
    member.user.createdTimestamp,
    firstJoinAt
  );

  const returnAt = firstJoinAt + 3 * DAY_MS;
  const returned = recordInviteJoin(invites, GUILD_ID, INVITER_ID, member, returnAt, true);

  assert.equal(returned.pointsAwarded, false);
  assert.equal(invites[GUILD_ID][INVITER_ID].invites.length, 2);
  assert.equal(invites[GUILD_ID][INVITER_ID].invites[0].departedAt, firstJoinAt + 2 * DAY_MS);
  assert.equal(invites[GUILD_ID][INVITER_ID].invites[1].departedAt, null);
  assertProfile(
    invites,
    expectedSummary(1, 1, 0, 0, 1),
    `🟢 <@${MEMBER_ID}> — موجود منذ`
  );
});

test('an unknown invite closes a stale open membership without changing points', () => {
  const invites = freshInviteData();
  const firstJoinAt = Date.now() - 3 * DAY_MS;
  const member = makeMember();
  recordInviteJoin(invites, GUILD_ID, INVITER_ID, member, firstJoinAt, true);

  const rejoinedAt = firstJoinAt + 2 * DAY_MS;
  const handled = markUnknownInviteJoin(
    invites,
    GUILD_ID,
    MEMBER_ID,
    rejoinedAt,
    member.user.createdTimestamp
  );

  assert.equal(handled, true);
  assert.equal(invites[GUILD_ID][INVITER_ID].invites.length, 1);
  assert.equal(invites[GUILD_ID][INVITER_ID].invites[0].departedAt, rejoinedAt);
  assert.equal(invites[GUILD_ID][INVITER_ID].invites[0].membershipUnknown, true);
  assertProfile(
    invites,
    expectedSummary(1, 0, 1, 0, 1),
    `🔴 <@${MEMBER_ID}> — غادر بعد مدة غير معروفة`
  );
});

test('legacy records remain visible as unconfirmed and keep their existing points', () => {
  const invites = {
    [GUILD_ID]: {
      [INVITER_ID]: {
        points: 7,
        invites: [{ userId: MEMBER_ID, timestamp: Date.now() - 100 * DAY_MS }]
      }
    }
  };

  assertProfile(
    invites,
    expectedSummary(1, 0, 0, 1, 7),
    `⚪ <@${MEMBER_ID}> — سجل قديم، الحالة والمدة غير معروفتين`
  );
});
