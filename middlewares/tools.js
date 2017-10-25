import tools from '../common/tools'
import jwt from '../common/jwtauth'

export default function(req, res, next) {
	res.tools = new tools(req, res)
	res.jwt   = jwt
	next()
}