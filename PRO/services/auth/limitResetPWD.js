const DB = require('../../config/mysql');
const moment = require('moment');


/**
 * Specific middleware responsible with limit password reset once a day
 * for any user.
 */
const limitResetPWD = (req, res, next) => {

    const SQL_QUERY = "SELECT id, email, pwd_reset FROM users WHERE email =?";
    
    
    DB.query(SQL_QUERY, [req.body.email], (err, result) => {
        console.log('requrest', req.body.email);
        if (err) throw err.message;
        
        if (result.length < 1) return res.status(401).json({status: 'failed', message: 'Unauthorized to reset password !'});
        
        const RESULT_QUERY = JSON.parse(JSON.stringify(result[0]));
        console.log('result', RESULT_QUERY);
        
        if (RESULT_QUERY.pwd_reset !== null) {
            
            const CURRENT_DAY = moment().format("DD/MM/YYYY");
            const RESET_DAY   = moment(RESULT_QUERY.pwd_reset).format("DD/MM/YYYY hh:mm:ss");
            
            if (RESET_DAY >= CURRENT_DAY || RESULT_QUERY.pwd_reset_requested === 'Y') {
                return res.json({status: 'failed', message: 'Password reset limit reached'});
            } 
        }
        next();
        
    });


}

module.exports = limitResetPWD;