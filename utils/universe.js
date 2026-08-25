const COMPANIONS = [
  { key: 'nova', name: '星芽', symbol: '✦', description: '温柔的夜航员', color: '#8b7dff' },
  { key: 'tide', name: '潮汐', symbol: '◌', description: '安静的倾听者', color: '#3fc5d5' },
  { key: 'orbit', name: '轨道', symbol: '◉', description: '有趣的探索者', color: '#ffb45e' }
]

const AVATAR_NAMES = ['光年旅人', '云端漫游者', '星环居民', '微光玩家']

const GREETINGS = {
  calm: '我在这里，陪你慢慢探索。',
  focused: '今天也一起，把想做的事完成。',
  curious: '前面有一颗新星，要一起去看看吗？'
}

function pick(list, seed) {
  const index = Math.abs(Number(seed) || 0) % list.length
  return list[index]
}

function getAvatarName(seed) {
  return pick(AVATAR_NAMES, seed)
}

function getCompanionGreeting(mood) {
  return GREETINGS[mood] || GREETINGS.calm
}

module.exports = {
  COMPANIONS,
  GREETINGS,
  getAvatarName,
  getCompanionGreeting
}
