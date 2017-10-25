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
    

    getAllFoodByType(food_type) {
         return this.query("select * from food_info where food_type = ?", [food_type])
    }

    getFoodInfoById(id) {
        return this.query("select * from food_info where food_id = ?", [id])
    }

    getRecommedFood(food_type, uid) {
        var sql = "select * from food_info left join \
        (select food_id as food from user_food  where  uid = ?)b \
        on food_info.food_id = b.food where b.food is null and food_type=? order by food_score desc limit 10"
        return this.query(sql, [uid, food_type])
    }

    getRandomFood(food_type) {
        var sql = "select * from food_info where food_id > \
        (select floor(max(food_id)*rand()) from food_info where food_type = ? ) and food_type = ? order by food_id asc limit 1"
        return this.query(sql, [food_type, food_type])

    }

    saveRecommdRecord(uid, food_id) {
        var now_time = parseInt(new Date().getTime() / 1000)
        var sql = "insert into user_food (uid, food_id, recommed_time) values (?, ?, ?)"
        return this.query(sql, [uid, food_id, now_time])
    }

    setFoodScore(food_id, score) {
        var sql = "update user_food set score = ? where food_id = ?"
        return this.query(sql, [score, food_id])
    }

    setUserFoodScore(uid, food_id, score) {
        var now_time = parseInt(new Date().getTime() / 1000)
        var sql = "insert into user_food_score (uid, food_id, score, score_time) \
        value (?, ?, ?, ?)"
        return this.query(sql, [uid, food_id, score, now_time])
    }

    getUserFoodScore(uid, food_id) {
        var sql = "select * from user_food_score where uid = ? and food_id = ?"
        return this.query(sql, [uid, food_id])
    }

    getFoodScore(food_id) {
        var sql = "select count(*) as count_number, sum(score) as total_score from \
        user_food_score where food_id = ?"
        return this.query(sql, [food_id])
    }

    setUserFoodPraise(uid, food_id) {
        var now_time = parseInt(new Date().getTime() / 1000)
        var sql = "insert into user_food_like (uid, food_id, score_time) \
        value (?, ?, ?)"
        return this.query(sql, [uid, food_id, now_time])
    }

    getUserFoodPraiseState(uid, food_id) {
        var sql = "select * from user_food_like where uid = ? and food_id = ?"
        return this.query(sql, [uid, food_id])
    }
    cancelUserFoodPraise(uid, food_id) {
        var sql = "delete from user_food_like where uid = ? and food_id = ?"
        return this.query(sql, [uid, food_id])
    }

    getFoodPraiseCount(food_id) {
        var sql = "select count(*) as praise_count from user_food_like where food_id = ?"
        return this.query(sql, [food_id])
    }
}

export default new Common(MySqlConn)