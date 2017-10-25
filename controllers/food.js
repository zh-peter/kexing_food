import config from '../config'
import proxy from '../proxy'

class Ctrl{
    constructor(app) {
        Object.assign(this, {
            app, 
            model: proxy.food
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
        // this.app.get('/api/food/info', this.getInfo.bind(this))
        this.app.get('/api/food/recommed', this.recommedFood.bind(this))
        this.app.get('/api/food/add_score', this.add_score.bind(this))
        this.app.get('/api/food/add_praise', this.add_praise.bind(this))
        this.app.get('/api/food/cancel_praise', this.cancel_praise.bind(this))
    }

    add_score(req, res, next) {
        console.log('query:', req.query)
        const food_id = Number(req.query.food_id)
        var uid = 0
        if(req.headers.uid)
            uid = Number(req.headers.uid)
        var score = Number(req.query.score)
        if(score < 0 || score > 5 )
            return res.tools.setJson(2, 'param error')

        const score_info = {
            score: 0,
            count: 0
        }

        if(food_id <= 0 || uid <= 0){
            return res.tools.setJson(2, 'param error')
        }

        this.model.setUserFoodScore(uid, food_id, score).then(result => {
            console.log("setUserFoodScore", result)
            return this.model.getFoodScore(food_id)
        }).then(result => {
            console.log("getFoodScore", result)
            score_info.score = result[0].total_score / result[0].count_number
            score_info.count = result[0].count_number
            return res.tools.setJson(0, 'ok', score_info)
        }).catch(err => {
            // dup key
            if(err.errno == 1062)
            {
                return res.tools.setJson(2, 'already scored')
            }
            else
                next(err)
        }).catch(err => next(err))

    }


    add_praise(req, res, next) {
        console.log('query:', req.query)
        const food_id = Number(req.query.food_id)
        var uid = 0
        const praise_info = {
            count: 0
        }
        if(req.headers.uid)
            uid = Number(req.headers.uid)

        if(food_id <= 0 || uid <= 0){
            return res.tools.setJson(2, 'param error')
        }

        this.model.setUserFoodPraise(uid, food_id).then(result => {
            return this.model.getFoodPraiseCount(food_id)
        }).then(result => {
            praise_info.count = result[0].praise_count
            return res.tools.setJson(0, 'ok', praise_info)
        }).catch(err => {
            // dup key
            try
            {
                if(err.errno == 1062)
                {
                    return res.tools.setJson(2, 'already praised')
                }
                else
                    next(err)
            }
            catch(e)
            {
                next(err)
            }
        })
    }

    cancel_praise(req, res, next) {
        console.log('query:', req.query)
        const food_id = Number(req.query.food_id)
        var uid = 0
        if(req.headers.uid)
            uid = Number(req.headers.uid)

        if(food_id <= 0 || uid <= 0){
            return res.tools.setJson(2, 'param error')
        }

        this.model.cancelUserFoodPraise(uid, food_id).then(result => {
            return res.tools.setJson(0, 'ok')
        }).catch(err => next(err))
    }

    recommedFood(req, res, next) {
        console.log('query:', req.query)
        const type = Number(req.query.food_type)
        const food_info = {
            food_id: 0,
            name: '',
            food_desc: 'no food avalible for now',
            food_type: 0,
            pic_list:[],
            price: '',
            shop_name: '',
            shop_address: '',
            tel:'',
            score_info: {
                score: 0,
                count: 0,
                user_score: 0 
            },
            praise_info:{
                count: 0,
                state: 0
            }
        }
        var uid = 0
        if(req.headers.uid)
            uid = Number(req.headers.uid)
        if(uid <= 0)
            return res.tools.setJson(2, 'param error')
        var has_food = false
        this.model.getRecommedFood(type, uid).then(food_list =>{
            if(Array.isArray(food_list) && food_list.length > 0)
            {
                const index = Math.floor(Math.random() * food_list.length)
                food_info.food_id = food_list[index].food_id 
                food_info.name = food_list[index].name 
                food_info.food_desc = food_list[index].food_desc 
                food_info.food_type = food_list[index].food_type 
                food_info.tel = food_list[index].tel
                if(food_list[index].pic_list)
                    food_info.pic_list = food_list[index].pic_list.split(",")
                food_info.price = food_list[index].price 
                food_info.shop_name = food_list[index].shop_name 
                food_info.shop_address = food_list[index].shop_address 
                // update recommed log
                has_food = true
                return this.model.saveRecommdRecord(uid, food_list[index].food_id)
            }
            else if(Array.isArray(food_list) && food_list.length == 0) {
                return this.model.getAllFoodByType(type)
            }
        }).then(result =>{
            if(!has_food)
            {
                // random select
                if(Array.isArray(result) && result.length > 0) {
                    const index = Math.floor(Math.random() * result.length)
                    food_info.food_id = result[index].food_id 
                    food_info.name = result[index].name 
                    food_info.food_desc = result[index].food_desc 
                    food_info.food_type = result[index].food_type 
                    food_info.tel = result[index].tel
                    if(result[index].pic_list)
                        food_info.pic_list = result[index].pic_list.split(",")
                    food_info.price = result[index].price 
                    food_info.shop_name = result[index].shop_name 
                    food_info.shop_address = result[index].shop_address 
                    // update recommed log
                    has_food = true
                    return this.model.saveRecommdRecord(uid, result[index].food_id)
                } 
            }
        }).then(result => {
            console.log("has_food,", has_food)
            if(has_food)
            {
                // get like count and score
                return Promise.all([this.model.getFoodScore(food_info.food_id),
                    this.model.getFoodPraiseCount(food_info.food_id),
                    this.model.getUserFoodScore(uid, food_id),
                    this.model.getUserFoodPraiseState(uid. food_id)
                    ])
            }
            else            
                return res.tools.setJson(1, 'failed')
        }).then(result => {
            if(has_food)
            {
                if(result[0][0].count_number != 0)
                    food_info.score_info.score = result[0][0].total_score / result[0][0].count_number
                else
                    food_info.score_info.score = 0
                food_info.score_info.count = result[0][0].count_number

                food_info.praise_info.count = result[1][0].praise_count

                if(result[2][0])
                    food_info.score_info.user_score = result[2][0].score

                if(result[3][0])
                    food_info.praise_info.state = 1

                return res.tools.setJson(0, '成功', {
                    food_info: food_info })
            }
           
        }).catch(err => next(err))

    }
}

export default Ctrl