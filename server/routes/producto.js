
const express = require('express');

let { verificarToken } = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../models/producto');

//============================
//Mostrar todas las productos
//============================
app.get('/producto', verificarToken, (req, res) => {
    
    let desde = req.query.desde || 0;
    desde = Number(desde);
    Producto.find({ disponible: true })
    .skip(desde)
    .limit(5)
        .sort('descripcion')// es para ordenar por el campo descripcion
        .populate('producto', 'nombre email') // con populate cargo el objeto producto
        .populate('categoria', 'descripcion')// cargo el objeto categoria
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });

        })

});

//============================
//Mostra una producto por id
//============================
app.get('/producto/:id', verificarToken, (req, res) => {

    let id = req.params.id;
    Producto.findById(id)
      .populate('producto', 'nombre email')
       .populate('categoria', 'descripcion')
       .exec( (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: ' El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });


    })

});
//============================
// buscar productos
//============================

app.get('/producto/buscar/:termino', verificarToken, (req, res)=>{

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');// con esto hacemos que nos busque donde este ese termino

    Producto.find({ nombre: regex })
      .populate('categoria','descripcion')
      .exec( (err, productos)=>{

          if (err) {
              return res.status(500).json({
                  ok: false,
                  err
              });
          }


          res.status(200).json({

              ok: true,
              productos
          });

      })

});

//============================
// Crear una nueva producto
//============================
app.post('/producto', verificarToken, (req, res) => {
    

    let body = req.body;

    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    });

    producto.save((err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
       

        res.status(200).json({

            ok: true,
            producto: productoDB
        });

    });

});
//============================
//Actualizar producto
//============================
app.put('/producto/:id', verificarToken, (req, res) => {
    // grabar el producto
    // grabar una categoria del listado 

    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save((err, productoGuardado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado
            });

        });

    });


});
//============================
//Borrar producto
//============================
app.delete('/producto/:id', verificarToken, (req, res) => {

    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'ID no existe'
                }
            });
        }

        productoDB.disponible = false;

        productoDB.save((err, productoBorrado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoBorrado,
                mensaje: 'Producto borrado'
            });

        })

    })



    });







module.exports = app;