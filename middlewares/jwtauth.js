import jwt from 'jsonwebtoken'
import config from '../config'

class Middlewares{
	constructor() {
		this.TOKEN_EXPIRATION_SEC = 7 * 24 * 60 * 60
	}

	verifyToken(req, res, next) {
		console.log("headers:", req.headers)
		const token = req.headers.token
		const uid = Number(req.headers.uid)
		const token_data = jwt.decode(token, config.secret)
		console.log("token_data:", token_data, uid)
		if(token_data == null || token_data.exp <= Date.now()/1000)
		{
			console.log('date now:',Date.now())
			return res.tools.setJson(100, '无权访问')
		}
		if(token_data.id != uid || token_data.id <= 0)
			return res.tools.setJson(100, '无权访问')
		return next()
	}
}

export default Middlewares