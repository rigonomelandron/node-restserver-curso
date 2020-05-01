
//==================
// Puerto
//==================
process.env.PORT = process.env.PORT || 3000;


//==================
// Entorno
//==================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//==================
// Vencimiento del token
//==================

process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;
//==================
//Seed de autenticación
//==================
      // tendremos que implementar una variable de entorno en heroku desde la consola de comandos con  >heroku config:set SEED="Este-es-el-seed-de-produccion"(SEED es la variable)
process.env.SEED = process.env.SEED || 'Este-es-el-seed-de-desarrollo'
//==================
// Base de datos
//==================

let urlDB;

if ( process.env.NODE_ENV === 'dev'){

    urlDB = 'mongodb://localhost:27017/cafe';
}else {


urlDB = process.env.MONGO_URI;

}
process.env.URLDB = urlDB;
