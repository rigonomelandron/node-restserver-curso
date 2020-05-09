const jwt = require('jsonwebtoken');// carga la libreria de json web token




//====================
// verificar token
//====================

let verificarToken = (req, res, next)=> {
     let token = req.get('token');// esta es la variable que recibo por el get

    jwt.verify(token, process.env.SEED, (err, decoded)=>{
         
        if(err){

            return res.status(401).json({
                 ok: false,
                 err: {
                     message: 'Token no válido'
                 }
            });
        }
        req.usuario = decoded.usuario;
        next();
     });
     
    

};
//====================
// verificar  Admin_Role
//====================

let verificaAdmin_role = (req, res, next)=>{
   
    let usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE'){
       next();
       return;
}else{
       return res.json({
           ok: false,
           err:{
               message: 'El usuario no es administrador'
           }

        })
    }
  
};

//------------------------------
//  Verificar token img
//-------------------------------

let verificaTokenImg = (req, res, next)=>{

    let token = req.query.token;
    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {

            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }
        req.usuario = decoded.usuario;
        next();
    });

    
}

module.exports = {

    verificarToken,
    verificaAdmin_role,
    verificaTokenImg
}