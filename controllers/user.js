import request from 'request'
import config from '../config'
import jwt from '../common/jwtauth'
import WXBizDataCrypt from '../common/WXBizDataCrypt'
import proxy from '../proxy'

class Ctrl{
	constructor(app) {
		Object.assign(this, {
			app, 
			model: proxy.user, 
		})

		this.init()
	}

	/**
	 * 初始化
	 */
	init() {
		this.routes()
	}

	/**
	 * 注册路由
	 */
	routes() {
		this.app.get('/api/user/info', this.getInfo.bind(this))
		this.app.get('/api/user/wechatlogin', this.wechatLoginIn.bind(this))
		this.app.post('/api/user/wechatlogin', this.wechatLoginIn.bind(this))
	}

	/**
	 * 封装request请求
	 */
	requestAsync(url) {
		return new Promise((reslove, reject) => {
			request({url: url}, (err, res, body) => {
				if (err) return reject(err)
				return reslove(body)
			})
		})
	}

	/**
	 * code 换取 session_key
	 */
	getSessionKey(code) {
		const appid = config.wechat.appid
		const secret = config.wechat.secret
		const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`
		return this.requestAsync(url)
	}

	wechatLoginIn(req, res, next) {
		console.log('body:', req)
		console.log('req query:', req.query)
		console.log('code:', req.query.code)
		const code = req.query.code
		const enData = req.query.encryptedData
		const iv = req.query.iv
		const body = {
			openid: null, 
			nick_name:null,
			head_pic:null,
			reg_time:null,
			uid:null
		}
		var sessionKey = ""

		if(code == null || enData == null || iv == null)
		{
			return res.tools.setJson(1, 'code or encryptedData or iv is null')
		}

		const appid = config.wechat.appid
		const nowTime = new Date().getTime() / 1000
		body.reg_time = nowTime
		this.getSessionKey(code)
		.then(result => {
			console.log("session", result)
			result = JSON.parse(result)
			if (result && result.errmsg) {
				return res.tools.setJson(result.errcode, result.errmsg)	
			}
			if (result && result.openid) {
				body.openid = result.openid
				sessionKey = result.session_key 
				return this.model.findByOpenId(result.openid)
			}
		})
		.then(result => {
			console.log("save:", result)

			console.log('sessionKey:', sessionKey)
			if(sessionKey)
			{
				const pc = new WXBizDataCrypt(appid, sessionKey)
				const info = pc.decryptData(enData , iv)
				console.log('data:', info)
				if(info.openId)	
				{	
					console.log('openid:', info.openId)
					body.nick_name = info.nickName
					body.head_pic = info.avatarUrl
				}
				console.log(result)
				if (result[0] && result[0].uid) {
					body.uid = result[0].uid
					return this.model.updateUserInfo(body)
				}
				if(!result[0]) return this.model.insertNewUser(body)
			}
		})
		.then(result =>
		{
			console.log('return:', result)
			if(!body.uid && result)
			{
				body.uid = result.insertedId
			}
			if (result) {
				const token = res.jwt.setToken(body.uid)
				console.log("token:", body.uid, token)
				return res.tools.setJson(0, '成功', {
				token: token,
				uid: body.uid,
				})
			}
			if(!sessionKey)
				return res.tools.setJson(1, 'failed')

		})
		.catch(err => next(err))
	}

	getInfo(req, res, next) {
		console.log("req user:", req.user)
		var uid = 0
		if(req.headers.uid)
		  	uid = Number(req.headers.uid)
		this.model.getUserInfoById(uid)
		.then(result => {
			if (!result[0]) return res.tools.setJson(1, '用户不存在或已删除')
			return res.tools.setJson(0, '调用成功', result[0])
		})
		.catch(err => next(err))
	}
}

export default Ctrl