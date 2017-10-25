import user from '../controllers/user'
import food from '../controllers/food'

export default function(app) {
	new user(app)
    new food(app)
}