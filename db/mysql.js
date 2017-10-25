import mysql from 'mysql2'
import config from '../config';

var MySqlConn = mysql.createPool(config.mysql);

export default MySqlConn