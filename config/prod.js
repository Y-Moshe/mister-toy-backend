const { MONGODB_USER, MONGODB_PASASWORD } = process.env

module.exports = {
  'dbURL': `mongodb+srv://${MONGODB_USER}:${MONGODB_PASASWORD}@cluster0.rcaaixb.mongodb.net/?retryWrites=true&w=majority`,
}
