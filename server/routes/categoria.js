
const express = require('express');

let { verificarToken, verificaAdmin_role } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

//============================
//Mostrar todas las categorias
//============================
app.get('/categoria', verificarToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')// es para ordenar por el campo descripcion
        .populate('usuario', 'nombre email') // con populate cargo el objeto usuario
        .exec((err, categorias) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias
            });

        })

});

//============================
//Mostra una categoria por id
//============================
app.get('/categoria/:id', verificarToken, (req, res) =>{
    
    let id = req.params.id;
    Categoria.findById(id, (err, categoriaDB)=>{
           if (err) {
               return res.status(500).json({
                   ok: false,
                   err
               });
           }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: ' El id no existe'
                }
            });
        }

           res.json({
              ok: true,
              categoria: categoriaDB
           });

       
    })

});
//============================
// Crear una nueva categoria
//============================
app.post('/categoria', verificarToken, (req, res) =>{

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
         usuario: req.usuario._id

    });

    categoria.save((err, categoriaDB)=>{
          
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({

            ok: true,
            categoria: categoriaDB
        });

    });

});
//============================
//Actualizar categoria
//============================
app.put('/categoria/:id', verificarToken, (req, res) =>{

  let id = req.params.id;
  let body = req.body;
// la variable descCategoria es para actualizar la descripcion
  let descCategoria = {
      descripcion: body.descripcion
  };

  Categoria.findByIdAndUpdate(id , descCategoria, { new: true, runValidators: true }, (err, categoriaDB)=>{

      if (err) {
          return res.status(500).json({
              ok: false,
              err
          });
      }
      if (!categoriaDB) {
          return res.status(400).json({
              ok: false,
              err
          });
      }
      res.json({

          ok: true,
          categoria: categoriaDB
      });

  });

});
//============================
//Borrar categoria
//============================
app.delete('/categoria/:id',[verificarToken, verificaAdmin_role] , (req, res) =>{

   let id = req.params.id;

   Categoria.findByIdAndRemove( id ,(err, categoriaDB)=>{
       
       if (err) {
           return res.status(500).json({
               ok: false,
               err
           });
       }
      if (!categoriaDB) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'El id no existe'
            }
        });
    }
    res.json({

        ok: true,
        message: 'Categoria Borrada'
    });

});

});  






module.exports = app;