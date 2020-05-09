const express = require('express');
const fileUpload = require('express-fileupload');
const app = express ();

const Usuario = require('../models/usuario'); // aqui importamos el modelo de usuario para poder grabar la imagen 
const Producto = require('../models/producto');

const fs = require('fs');// esto es filesystem y lo usaremos para comprobar las imagenes
const path = require('path');// hacer el path de las rutas
// default options
app.use(fileUpload());//Middleware

app.put('/upload/:tipo/:id', function (req, res) { // tipo seria si es producto o usuario y id pues el id del producto o usuario

      let tipo = req.params.tipo; // aqui recojo el parametro que me entra por la url para el tipo
      let id = req.params.id; //  aqui recojo el parametro que me entra por la url para el id

     // primer error si no retorna el archivo
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
                ok: false,
                err: {
                    message: ' No se ha seleccionado nungún archivo'
                }

        });
    }

    // Validar tipo 
    let tiposValidos = ['productos', 'usuarios'];// arreglo con los tipos permitidos
     if (tiposValidos.indexOf(tipo) < 0){ // compruebo que tipo( este nos entra la url) no esta dentro del arreglo
        // devuelvo el error
        return res.status(400).json({
             ok: false,
             err:{
                 message: ' Los tipos permitidos son ' + tiposValidos.join(', '),// aqui uno los elementos del arreglo mediante una coma
                 tipo: tipo // aqui devuelvo el tipo que nosotros hemos puesto
             }

        });


     }
       

    let archivo = req.files.archivo;// aqui se carga el archivo 
    let nombreCortado = archivo.name.split('.');// esto divide el nombre del archivo por el punto y los pone en un Array
    let extension = nombreCortado[nombreCortado.length -1];//aqui cojo la última posición del array correspondiente a la extensión

    // validar las extensiones de archivo permitidas
       let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    // en el siguiente if comprobamos que la extension esta dentro de la extensiones permitidas
       if ( extensionesValidas.indexOf(extension) < 0 ){
            return res.status(400).json({
                  ok: false,
                  err: {

                    message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),// con join uno los elementos del array con comas
                    ext: extension // esta es la extension que recibo
                
                  }
                 

            });

       }
    // Cambiar nombre al archivo para que sea unico aunque subamos la misma imagen y tambien evitar la cache del navegador
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;


    // el siguiente paso es mover el archivo al directorio
    // la ruta la hemos metido entre literales para poder meter el nombre del archivo
    // con la variable tipo le estamos dando una ruta diferente dependiendo del tipo
         archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err)=> {
        if (err){
            return res.status(500).json({

                ok: false,
                err
            });
        }
       // Aqui imagen cargada

       if(tipo === 'usuarios'){


              imagenUsuario(id, res, nombreArchivo); // aqui llamamos a la funcion 
       }else {

           imagenProducto(id, res, nombreArchivo); // aqui llamamos a la funcion 

       }
    });



});
//--------------------------------------------------------------------------------------------------------------------
//                                                       USUARIOS
//--------------------------------------------------------------------------------------------------------------------
function imagenUsuario(id, res, nombreArchivo){ // Esta funcion nos va a permitir recibir la imagen, comprobar si existe el usuario y grabarla en la base de datos 

      Usuario.findById(id, (err, usuarioDB )=>{ // aqui comprobamos si ese usuario existe por el id
           if(err){
               borrarArchivo(nombreArchivo, 'usuarios');//borramos la imagen subida

               return res.status(500).json({
                   ok: false,
                   err

               });

           }

           if( !usuarioDB){
               borrarArchivo(nombreArchivo, 'usuarios');//borramos la imagen subida

               return res.statuts(400).json({
                   ok: false,
                   err: {
                       message: ' EL usuario no existe'
                   }
               });
           }

    // vamos a comprobar si existe ya una imagen asignada al usuario para ello necesitamos el path
    // esto nos va a valer para eliminar la imagen antigua para no tener tantas imagenes almacenadas
         
           borrarArchivo(usuarioDB.img, 'usuarios');


           usuarioDB.img = nombreArchivo;

           usuarioDB.save( (err, usuarioGuardado)=>{ // Grabamos en la base de datos
               
               res.json({
                  ok: true,
                  usuario: usuarioGuardado,
                  img: nombreArchivo
               });
                
           });

      });


}


//---------------------------------------------------------------------------------------------------------
//                                                PRODUCTOS
//---------------------------------------------------------------------------------------------------------
function imagenProducto(id, res, nombreArchivo) { // Esta funcion nos va a permitir recibir la imagen, comprobar si existe el usuario y grabarla en la base de datos 

    Producto.findById(id, (err, productoDB) => { // aqui comprobamos si ese usuario existe por el id
        if (err) {
            borrarArchivo(nombreArchivo, 'productos');//borramos la imagen subida

            return res.status(500).json({
                ok: false,
                err

            });

        }

        if (!productoDB) {
            borrarArchivo(nombreArchivo, 'productos');//borramos la imagen subida

            return res.status(400).json({
                ok: false,
                err: {
                    message: ' EL producto no existe'
                }
            });
        }

        // vamos a comprobar si existe ya una imagen asignada al producto para ello necesitamos el path
        // esto nos va a valer para eliminar la imagen antigua para no tener tantas imagenes almacenadas

        borrarArchivo(productoDB.img, 'productos');


        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => { // Grabamos en la base de datos

            res.json({
                ok: true,
                 producto: productoGuardado,
                img: nombreArchivo
            });

        });

    });


}

// esta función es para borrar los archivos antiguos cuando modificamos la imagen de usuario o productos
function borrarArchivo(nombreImagen, tipo){
    console.log(nombreImagen);
  console.log(tipo);
    // vamos a comprobar si existe ya una imagen asignada al usuario para ello necesitamos el path
    // esto nos va a valer para eliminar la imagen antigua para no tener tantas imagenes almacenadas
    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen }`);
    console.log(pathImagen);
    if (fs.existsSync(pathImagen)) {  // miramos si existe con filesystem(fs.existSync)
        fs.unlinkSync(pathImagen); //eliminamos la imagen antigua

    }

}

module.exports = app;