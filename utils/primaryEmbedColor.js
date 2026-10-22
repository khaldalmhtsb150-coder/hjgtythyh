const DEFAULT_PRIMARY_EMBED_COLOR = '#6A3FF2';
const HEX_COLOR_PATTERN = /^#[0-9A-F]{6}$/i;

function getPrimaryEmbedColor() {
  const color = global.botSettings?.primaryColor;
  return typeof color === 'string' && HEX_COLOR_PATTERN.test(color)
    ? color.toUpperCase()
    : DEFAULT_PRIMARY_EMBED_COLOR;
}

function darkenEmbedColor(color, factor = 0.9) {
  const normalizedColor = HEX_COLOR_PATTERN.test(color)
    ? color.slice(1)
    : DEFAULT_PRIMARY_EMBED_COLOR.slice(1);
  const channels = normalizedColor.match(/.{2}/g).map(channel => parseInt(channel, 16));
  const darkenedChannels = channels.map(channel =>
    Math.max(0, Math.min(255, Math.round(channel * factor)))
  );

  return `#${darkenedChannels.map(channel => channel.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

module.exports = {
  DEFAULT_PRIMARY_EMBED_COLOR,
  getPrimaryEmbedColor,
  darkenEmbedColor
};
