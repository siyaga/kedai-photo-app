var express = require('express');
var router = express.Router();
var multer = require('multer');
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
const Users = db.users;
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

/* GET home page. */
router.get('/',checkNotAuthenticated, function(req, res, next) {
  res.render('index', { title: 'Example', users: authUser(req.user) });
});

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
      role: req.body.role
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
    title: 'Edit Profile',
    users: authUser(req.user)
  });
});


// create Berita
router.post('/profile',checkNotAuthenticated, [
  check('nama')
  .notEmpty().withMessage('Nama harus diisi.'),
  body('email').custom(async (valueEmail,[
    req
  ] ) => {

    // Mencari nama yang sama di query

    const Email = await Users.findOne({
      where: {
        email: valueEmail
      }
    });
    if (valueEmail !== req.body.oldEmail && Email) {
      throw new Error(`Email ${valueEmail} sudah terdaftar! `);

    }

    return true;
  })
  .notEmpty().withMessage('Email harus diisi.')
  .isEmail().withMessage('Email tidak valid.'),
  body('username').custom(async (valueUsername, {req }) => {
    // Mencari nama yang sama di query
    const username = await Users.findOne({
      where: {
        username: valueUsername
      }
    });


    if (valueUsername !== req.body.oldUsername && username) {
      throw new Error(`Username ${valueUsername} sudah terdaftar! `);

    }

    return true;
  })
  .notEmpty().withMessage('Username harus diisi.')
  .isLength({
    max: 20
  }).withMessage('Username maximal Harus 20 karakter.'),
  

], function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('profile', {
      title: 'Edit Profile',
      errors: errors.array(),
      data: req.body,
      users: authUser(req.user)
    });
  } else {
    const username = req.params.username;
    let user = {
      nama: req.body.nama,
      email: req.body.email,
      username: req.body.username
    }
    Users.update(user, {
      where: {
        username:username
      }
    })
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
