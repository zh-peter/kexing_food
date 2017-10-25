import express from 'express'
import bodyParser from 'body-parser'
import jwt from 'express-jwt'

import config from './config'
import tools from './middlewares/tools'
import jwtauth from './middlewares/jwtauth'
import routes from './routes'

const app          = express()
const auth         = new jwtauth()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


app.use(/\/api/, tools)
app.use(/^((?!wechatlogin).)+$/, [
	auth.verifyToken.bind(auth)
])

// 加载路由
routes(app)

app.use((req, res, next) => {
	const err = new Error('Not Found')
	err.status = 404
	res.status(404)
	res.send('Not Found')
	next(err)
})

app.use((err, req, res, next) => {
	console.log(err)
	res.status(err.status || 500)
})


export default app