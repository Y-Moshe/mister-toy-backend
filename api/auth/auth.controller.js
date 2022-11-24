const authService = require('./auth.service')
const logger = require('../../services/logger.service')

async function login(req, res) {
    const { username, password } = req.body
    try {
        const user = await authService.login(username, password)
        const loginToken = authService.getLoginToken(user)
        logger.info('User login: ', user)
        res.cookie('loginToken', loginToken)

        res.status(200).json(user)
    } catch (err) {
        logger.error('Failed to Login ' + err)
        res.status(401).json({ err })
    }
}

async function signup(req, res) {
    try {
        const { username, password, fullname } = req.body
        const account = await authService.signup(username, password, fullname)
        logger.debug(`auth.route - new account created: ` + JSON.stringify(account))
        const user = await authService.login(username, password)
        const loginToken = authService.getLoginToken(user)
        logger.info('User login: ', user)
        res.cookie('loginToken', loginToken)

        res.status(200).json(user)
    } catch (err) {
        logger.error('Failed to signup ' + err)
        res.status(500).json({ err })
    }
}

async function logout(req, res){
    try {
        res.clearCookie('loginToken')
        res.status(200).send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(500).json({ err: 'Failed to logout' })
    }
}

module.exports = {
    login,
    signup,
    logout
}