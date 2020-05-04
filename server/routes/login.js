const express = require('express');
const bcrypt = require('bcryptjs');// encryptación de contraseña
const jwt = require('jsonwebtoken'); // manejar token

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario');
const app = express();



 app.post('/login', (req, res)=>{

    let body = req.body;

    Usuario.findOne({ email: body.email}, (err, usuarioDB)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
// verificación si usuario existe en la base de datos con email
        if( !usuarioDB){
            return res.status(400).json({
                ok: false,
                 err: {
                     message: '(Usuario) o contraseña incorrecta'
                 }
            });
        };
// verificación de la contraseña con bcrypt con compateSync estoy comparando la contraseña que entra en el body con la del usuario 
     if (!bcrypt.compareSync( body.password, usuarioDB.password)){
         return res.status(400).json({
             ok: false,
             err: {
                 message: 'Usuario o (contraseña) incorrecta'
             }
         });
              
     }
// Generar token - El expireIn que esta puesto es para que expire en 30 días

  let token = jwt.sign({
      usuario: usuarioDB
  }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
// si todo es correcto 
     res.json({
        ok: true,
        usuario: usuarioDB,
        token

     });

    });
        
 });

 //  configuraciones de google

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
   return {
        nombre: payload.name,
        email: payload.email,
         img: payload.picture,
         google: true
    
}
}

app.post('/google', async (req, res) => {

    let token = req.body.idtoken;

     let googleUser = await verify(token)
        .catch( e =>{
            return res.status(403).json({
                ok:false, 
                err: e

            });
        });

        Usuario.findOne( { email: googleUser.email }, (err, usuarioDB)=>{
              
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            };

            if( usuarioDB ){
                 
                if( usuarioDB.google === false ){
                    return res.status(400).json({
                        ok: false,
                        err: {
                            message: ' Debe usar su autenticación normal'
                        }
                    });

                } else {

                    let token = jwt.sign({
                        usuario: usuarioDB
                    }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                    return res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token

                    });
                }

            } else {
                // si el usuario no existe en nuestra base de datos 
                let usuario = new Usuario();

                usuario.nombre = googleUser.nombre;
                usuario.email = googleUser.email;
                usuario.img = googleUser.img;
                usuario.google= true;
                usuario.password = ':)';

                usuario.save( (err, usuarioDB)=>{
                    
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            err
                        });
                    };
                    let token = jwt.sign({
                        usuario: usuarioDB
                    }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                    return res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token

                    });


                });

            }

        });

     

});
module.exports = app;