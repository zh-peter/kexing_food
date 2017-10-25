import MySqlConn from '../db/mysql'
class Common{
	constructor(connetct) {
		Object.assign(this, {
			connetct, 
		})
	}

	query(sql, param) {
		console.log(sql, param)
		return new Promise((reslove, reject) => {
			this.connetct.query(sql, param, (err, rows) => {
				if(err)
					console.log("err", err)
				if (err) return reject(err)
				return reslove(rows)
			})
		})
	}
	
	insertNewUser(user_info) {
		const openid = user_info.openid
		const nick_name =  user_info.nick_name
		const head_pic =  user_info.head_pic
		const reg_time = user_info.reg_time
		return this.query("insert into user_info (openid, nick_name, head_pic, reg_time) values(?, ?, ?, ?)", 
			[openid, nick_name, head_pic, reg_time])
	}

	findByOpenId(openid) {
    	 return this.query("select * from user_info where openid = ?", [openid])
	}

	updateUserInfo(user_info) {
		return this.query("update user_info set nick_name = ?, head_pic = ? where openid= ?", 
			[user_info.nick_name, user_info.head_pic, user_info.openid])
	}

	getUserInfoById(id) {
		return this.query("select * from user_info where uid = ?", [id])
	}
	
}

export default new Common(MySqlConn)