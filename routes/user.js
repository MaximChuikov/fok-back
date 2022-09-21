const Router = require('express')
const user_router = new Router()

const user = require('./controllers/user-controller')

user_router.get('/account', user.getAccountInfo)
// user_router.post('/account', )

// ?set=0&days_in_set=4
user_router.get('/sport-hall-rent', user.getSportHallRent)
// user_router.get('gym-rent', )
//
// user_router.get('await-new-rent', )
// user_router.post('rent-request', )

module.exports = user_router