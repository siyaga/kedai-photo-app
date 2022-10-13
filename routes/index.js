var express = require('express');
var router = express.Router();
var multer = require('multer');
const fs = require('fs');
var bcrypt = require('bcrypt');
var moment = require('moment');
var initializePassport = require('../auth');
var passport = require('passport');
initializePassport(passport);
const {
  body,
  check,
  validationResult
} = require('express-validator');




const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, '././public/images');
  },
  filename: (req, file, callback) => {
    callback(null, new Date().getTime() + '-' + file.originalname);
  }
});

const kirim = multer({
  storage: fileStorage
});

const db = require('../models');
const { authenticate } = require('passport');
const { reset } = require('nodemon');
const { users } = require('../models');
const { info } = require('console');
const Users = db.users;
const Fotos = db.fotos;
const Op = db.Sequelize.Op;



// Membuat Proses menuju login Page 
router.get('/login', checkAuthenticated, (req, res) => {
  res.render('login', {
      title: "Login",
      users: authUser(req.user)
  })
})
// Melakukan Proses Login page
router.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
  successFlash: true,
}));

function authUser(req) {
  if (req === undefined) {
      return 'null';
  } else {
      return req

  }
}


/* GET Pembeli page. */
router.get('/pembeli',checkNotAuthenticated, pembeliRoleIs, function(req, res, next) {
  res.render('pembeli', { title: 'Pembeli', users: authUser(req.user) });
});

/* GET Penjual page. */
router.get('/penjual',checkNotAuthenticated, penjualRoleIs, function(req, res, next) {
  res.render('penjual', { title: 'Penjual', users: authUser(req.user) });
});

/* GET Admin page. */
router.get('/admin',checkNotAuthenticated, adminRoleIs, function(req, res, next) {
  res.render('admin', { title: 'Admin', users: authUser(req.user) });
});

/* GET 404 page. */
router.get('/404', function(req, res, next) {
  res.render('404', { title: '404', users: authUser(req.user) });
});

router.get('/register', function (req, res, next) {
  res.render('register', {
    title: 'Register User',
    users: authUser(req.user)
  });
});


// create Berita
router.post('/register', [
  check('nama')
  .notEmpty().withMessage('Nama harus diisi.'),
  body('email').custom(async (valueEmail, ) => {

    // Mencari nama yang sama di query

    const Email = await Users.findOne({
      where: {
        email: valueEmail
      }
    });
    if (Email) {
      throw new Error(`Email ${valueEmail} sudah terdaftar! `);

    }

    return true;
  })
  .notEmpty().withMessage('Email harus diisi.')
  .isEmail().withMessage('Email tidak valid.'),
  body('username').custom(async (valueUsername) => {
    // Mencari nama yang sama di query
    const username = await Users.findOne({
      where: {
        username: valueUsername
      }
    });


    if (username) {
      throw new Error(`Username ${valueUsername} sudah terdaftar! `);

    }

    return true;
  })
  .notEmpty().withMessage('Username harus diisi.')
  .isLength({
    max: 20
  }).withMessage('Username maximal Harus 20 karakter.'),
  check('password')
  .notEmpty().withMessage('Password harus diisi.')
  .isLength({
    min: 6
  }).withMessage('password minimal Harus 6 karakter.'),
  body('password').custom((valuePassword, {
    req
}) => {

    if (valuePassword !== req.body.compassword) {
        throw new Error(`Password tidak sama, mohon isikan ulang`);
    }
    return true;
}),
  body('role').custom(async (valueRole) => {
    // Mencari nama yang sama di query


    if (valueRole=="pilih role") {
      throw new Error(`Tolong di isikan role anda`);

    }

    return true;
  })

], function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('register', {
      title: 'Register User',
      errors: errors.array(),
      username: username,
      data: req.body,
      users: authUser(req.user)
    });
  } else {

    let passwordHash = bcrypt.hashSync(req.body.password, 10);
    let user = {
      nama: req.body.nama,
      email: req.body.email,
      username: req.body.username,
      password: passwordHash,
      role: req.body.role,
      image: "default.png"
    }
    Users.create(user)
      .then(data => {
       // res.flash('msg', 'Berhasil Melakukan Registrasi Silakan Lakukan login');
        res.redirect('/login');
      })
      .catch(err => {
        res.json({
          info: "Error",
          message: err.message
        });
      });

  }

});

router.get('/profile',checkNotAuthenticated, function (req, res, next) {
  res.render('profile', {
    title: `Profile`,
    users: authUser(req.user)
  });
});


router.get('/editprofile/:username',checkNotAuthenticated, async function (req, res, next) {
      const id_user = req.user.id;
      await Users.findByPk(id_user)
      .then(profile => {
        if(profile){
          res.render('editprofile', {
            title: `Edit Profile ${req.params.username}`,
            detailUser: profile,
            users: authUser(req.user)
          });
        } else {
          res.redirect('404');
        }
        
      })
      .catch(err => {
        throw err;
      })
     
});


// edit Berita
router.post('/editprofile/:username',checkNotAuthenticated, kirim.array('image', 1),
 [
  check('nama')
  .notEmpty().withMessage('Nama harus diisi.'),
  check('email')
  .notEmpty().withMessage('Email harus diisi.')
  .isEmail().withMessage('Email tidak valid.'),
],async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {

    
    res.render('editprofile', {
      title: 'Edit Profile',
      errors: errors.array(),
      users: authUser(req.user)
    });
  } else {
    const oldImage = req.user.image;
    const id = req.user.id;
    let image
            if (!req.files.find((fileE) => fileE.filename)) {
                image = 'default.png'
            } else {

                image = req.files[0].filename
                if(oldImage == 'default.png') {

                } else {
                  fs.unlinkSync(`././public/images/${oldImage}`)
                }
            }
            if (image == 'default.png') {
                image = oldImage
            }
    let user = {
      nama: req.body.nama,
      email: req.body.email,
      username: req.user.username,
      password: req.user.password,
      image: image
    }
    await Users.update(user, {
      where: {
        id:id
      }
    })
      .then(data => {
       // res.flash('msg', 'Berhasil Melakukan Registrasi Silakan Lakukan login');
        res.redirect('/');
      })
      .catch(err => {
        res.json({
          info: "Error",
          message: err.message
        });
      });

  }

});

// penjual 

router.get("/pengeditfoto",checkNotAuthenticated, function (req, res, next) {
  res.render("foto/pengeditfoto", { title: "Pengedit Foto", 
  users: authUser(req.user) });
});

//disini

router.get("/",async function (req, res, next) {
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(20);
  await Fotos.findAll()

    .then((foto) => {
      res.render("foto/tokofoto", {
        title: "Toko Foto",
        fotos: foto,
        users: authUser(req.user)
      });
    })
    .catch((err) => {
      res.render("tokofoto", {
        title: "Toko Foto",
        fotos: [],
        users: authUser(req.user)
      });
    });
});

// pagination
/*
router.get("/tokofoto/:page", function (req, res, next) {
  var perPage = 9;
  var page = req.params.page || 1;

  Fotos.find({})
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec(function (err, fotos) {
      Fotos.count().exec(function (err, count) {
        if (err) return next(err);
        res.render("tokofoto", {
          fotos: fotos,
          current: page,
          pages: Math.ceil(count / perPage),
        });
      });
    });
});
*/
//end pagination

router.get("/tambahfoto",checkNotAuthenticated,penjualRoleIs, function (req, res, next) {
  res.render("foto/tambahfoto", { title: "Tambah Foto", users: authUser(req.user) });
});
router.post("/tambahfoto",checkNotAuthenticated,penjualRoleIs, kirim.array("gambar", 1), function (req, res, next) {
  var bilangan = req.body.harga;
  var reverse = bilangan.toString().split("").reverse().join(""),
    ribuan = reverse.match(/\d{1,3}/g);
  ribuan = ribuan.join(".").split("").reverse().join("");

  let gambar = req.files[0].filename;
  let foto = {
    iduser: req.user.id,
    judul: req.body.judul,
    deskripsi: req.body.deskripsi,
    harga: ribuan,
    gambar: gambar,
  };
  Fotos.create(foto)
    .then((data) => {
      res.redirect("/");
    })
    .catch((err) => {
      res.render("foto/tambahfoto", {
        title: "Tambah Foto",
        users: authUser(req.user)
      });
    });
});

router.get("/deletefoto/:id",checkNotAuthenticated,penjualRoleIs, function (req, res, next) {
  var id = parseInt(req.params.id); // /detail/2, /detail/3
  Fotos.destroy({
    where: { id: id },
  })
    .then((num) => {
      res.redirect("/");
      
    })
    .catch((err) => {
      res.json({
        info: "Error",
        message: err.message,
      });
    });
});

// view
router.get("/viewfoto/:id", function (req, res, next) {
  var id = req.params.id;
  // var nama = req.params.nama;
  // const komentarr = await Comment1s.findAll({ where: { idfoto: id } });
  Fotos.findByPk(id)
    .then((foto) => {
      if (foto) {
        res.render("foto/viewfoto", {
          title: "View Foto",
          fotos: foto,
          users: authUser(req.user)
          // comment1s: komentarr,
        });
      } else {
        // http 404 not found
      res.redirect("/404");
      }
    })
    .catch((err) => {
      res.render("foto/viewfoto", {
        title: "View Foto",
        berita: {},
        users: authUser(req.user)
      });
    });
});

router.get("/editfoto/:id",checkNotAuthenticated,penjualRoleIs, function (req, res, next) {
  const id = parseInt(req.params.id);
  Fotos.findByPk(id)
    .then((foto) => {
      if (foto) {
        res.render("foto/editfoto", {
          title: "Edit Foto",
          fotos: foto,
          users: authUser(req.user)
        });
      } else {
        res.redirect("/");
      }
    })
    .catch((err) => {
      res.redirect("/editfoto");
    });
});
router.post("/editfoto/:id",checkNotAuthenticated,penjualRoleIs, kirim.array("gambar", 1), function (req, res, next) {
  const id = parseInt(req.params.id);
  var bilangan = req.body.harga;
  var reverse = bilangan.toString().split("").reverse().join(""),
    ribuan = reverse.match(/\d{1,3}/g);
  ribuan = ribuan.join(".").split("").reverse().join("");

  let gambar = req.files[0].filename;
  let foto = {
    iduser : req.user.id,
    judul: req.body.judul,
    deskripsi: req.body.deskripsi,
    harga: ribuan,
    gambar: gambar,
  };
  Fotos.update(foto, {
    where: { id: id },
  })
    .then((num) => {
      res.redirect("/");
    })
    .catch((err) => {
      res.json({
        info: "Error",
        message: err.message,
      });
    });
});


// Function Membuat Middleware Login
// Function Membuat Middleware Jika Tidak Login
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return res.redirect("/");
  }
  next();
}
// Function Membuat Middleware untuk akses login user
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect("/login");
}
// Function Membuat Middleware Role 
function adminRoleIs(req, res, next) {
  if (req.user.role === "admin") {
      return next();
  }
  return res.redirect('/');
}
// Function Membuat Middleware Role user dan admin
function pembeliRoleIs(req, res, next) {
  if (req.user.role == "pembeli" || req.user.role === "admin") {
    return next();
  }
  return res.redirect('/');

}
function penjualRoleIs(req, res, next) {
  if (req.user.role == "penjual" || req.user.role === "admin") {
    return next();
  }
  return res.redirect('/');

}

/* logout user. */
router.get('/logout', function (req, res, next) {
  req.session.destroy();
  res.redirect('/login');
});


module.exports = router;
