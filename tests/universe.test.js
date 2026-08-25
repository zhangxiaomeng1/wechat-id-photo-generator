const assert = require('assert')
const { COMPANIONS, getAvatarName, getCompanionGreeting } = require('../utils/universe')

assert.strictEqual(COMPANIONS.length, 3)
assert.strictEqual(getAvatarName(0), '光年旅人')
assert.strictEqual(getAvatarName(4), '光年旅人')
assert.strictEqual(getCompanionGreeting('curious'), '前面有一颗新星，要一起去看看吗？')
assert.strictEqual(getCompanionGreeting('unknown'), '我在这里，陪你慢慢探索。')

console.log('universe tests passed')
