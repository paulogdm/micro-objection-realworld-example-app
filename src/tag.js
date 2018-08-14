// tag model
const Tag = require('./models/Tag')

// simply returning all tags
const getTags = async (req, res) => {
  const tags = await Tag.query()
  return {tags}
}

module.exports = {
  getTags
}
