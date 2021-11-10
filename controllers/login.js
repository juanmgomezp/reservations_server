const User = require('../models/users');
const jwt = require('jsonwebtoken');
const { comparePasswords } = require('../functions/commons')

const auth = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({username : username});
    
    if (!user) 
        return res.status(401).json({type: 'error', msg: 'usuario no registrado'});
    
    const matchPasswords = await comparePasswords(password, user.password)
    if(!matchPasswords) 
        return res.status(401).json({type: 'error', msg: "contraseña incorrecta"});
    
    const token = jwt.sign({id: user.id}, process.env.SECRET, {expiresIn:  86400});
    res.status(200).json({token: token, type: 'success', msg: `bienvenido ${user.username}`});  
}

module.exports = auth;