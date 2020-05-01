const express = require('express');
const bcrypt = require('bcryptjs');// encryptación de contraseña
const jwt = require('jsonwebtoken'); // manejar token

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
        }
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


module.exports = app;