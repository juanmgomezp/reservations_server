const jwt = require('jsonwebtoken');

const validateToken = async (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(401).json({msg: "no se recibió un token"});   
    try {
        const validToken = jwt.verify(token, process.env.SECRET);
        if (validToken){
            res.status(201).json({token:true, type:'success', msg:'token válido'})
        }
    } catch (error) {
        if (error.name == "JsonWebTokenError") 
            return res.status(404).json({token:false, type:'error', msg:'token inválido'})
        if (error.name == "TokenExpiredError") 
            return res.status(402).json({token:false, type:'error', msg:'la sesión ha expirado'})
        return res.status(404).json({token:false, type:'error', msg:'algo salió mal'})        
    } 
}

const validUser = async (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(401).json({msg: "no se recibió un token"});   
    try {
        const validToken = jwt.verify(token, process.env.SECRET);
        if (validToken){
            next();
        }
    } catch (error) {
        if (error.name == "JsonWebTokenError") 
            return res.status(404).json({value:false, type:'error', msg:'token inválido'})
        if (error.name == "TokenExpiredError") 
            return res.status(402).json({value:false, type:'error', msg:'token ha expirado'})
        return res.status(404).json({value:false, type:'error', msg:'algo salió mal'})        
    } 
}

module.exports = {validateToken, validUser};