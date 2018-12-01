var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
var randtoken = require('rand-token');
var db = require('./connection.js'); // db is pool
var common = require('./common.js'); 
// Get all Location
router.get('/', function (req, res) {
    if (req.get("token") == null || req.get("token") == "") {
        res.statusCode = 200;
        return res.json({
            respond: false,
            errors: true
        });
    } else {
        var token = req.get("token");
        common.checksession(db, token, function (returnValue) {
            if (returnValue > 0) {
                res.statusCode = 200
                return res.json({
                    respond: true,
                    errors: false
                });
            } else {
                res.statusCode = 200
                return res.json({
                    respond: false,
                    errors: true
                });
            }
        });
    }
});


//Login
router.post('/', function(req, res) {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.statusCode = 200;
    return res.json({
      respond: "Missing Fields",
      errors: true
    });
  } else {
    if (req.body.username !== "" && req.body.username !== null && req.body.password !== "" && req.body.password !== null) {
      var username = req.body.username;
      var password = req.body.password;
      var paremeters = {
        s_l_username: username
      };
      db.query('SELECT s_l_ID , s_l_password from secure_login where ? ', paremeters, function(err, rows, fields) {
        if (err) {
           console.log(err);
          res.statusCode = 200;
          return res.json({
            respond: "Database Error",
            errors: true
          });
        } else {
          if (rows.length) {
            var securepassword = rows[0].s_l_password;
            bcrypt.compare(password, securepassword, function(err, result) {
              if (result) {
                if (err) {
                  res.statusCode = 200;
                  return res.json({
                    respond: "Something went wrong",
                    errors: true
                  });
                } else {

                  var token = randtoken.generate(16);
                  var secureid = rows[0].s_l_ID;
                  var updatequery1 = {
                    s_l_session_token: token
                  };
                  var updatequery2 = {
                    s_l_ID: secureid
                  };
                  var query = db.query('UPDATE secure_login SET ? where ? ', [updatequery1, updatequery2], function(err, result) {
                    if (err) {
                      console.log(err);
                      res.statusCode = 200;
                      return res.json({
                        respond: "Database error",
                        errors: true
                      });
                    } else {
                      res.statusCode = 200;
                      return res.json({
                        token: token,
                        errors: false
                      });
                    }
                  });
                }
              } else {
                res.statusCode = 200;
                return res.json({
                  respond: "Wrong Password",
                  errors: true
                });
              }
            });
          } else {
            res.statusCode = 200;
            return res.json({
              respond: "Username Not Found",
              errors: true
            });
          }
        }
      });
    } else {
      res.statusCode = 200
      return res.json({
        respond: "Missing Field",
        errors: true
      });
    }
  }
});

// Create new User
router.put('/', function(req, res) {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.statusCode = 200;
    return res.json({
      respond: "Missing Fields",
      errors: true
    });
  } else {
    if (req.body.username !== "" && req.body.username !== null && req.body.password !== "" && req.body.password !== null && req.body.email !== "" && req.body.email !== null && req.body.fullname !== "" && req.body.fullname !== null) {
      var username = req.body.username;
      var password = req.body.password;
      var email = req.body.email;
      var fullname = req.body.fullname;
      var paremeters = {
        s_l_username: username
      };
      db.query('SELECT s_l_username from secure_login where ? ', paremeters, function(err, rows, fields) {
        if (err) {
          res.statusCode = 200;
          return res.json({
            respond: "Creating Account Failed , Database Error",
            errors: true
          });
        } else {
          if (rows.length) {
            res.statusCode = 200;
            return res.json({
              respond: "Username Already Existed ",
              errors: true
            });
          } else {
            bcrypt.hash(password, 10, function(err, hash) {
              var paremeters = {
                s_l_username: username,
                s_l_password: hash,
                s_l_email: email,
                s_l_full_name: fullname
              };
              var query = db.query('INSERT INTO secure_login SET ?', paremeters, function(err, result) {
                if (err) {
                  res.statusCode = 200;
                  return res.json({
                    respond: "Creating Account Failed , Database Error",
                    errors: true
                  });
                } else {
                  if (result) {
                     res.statusCode = 200;
                    return res.json({
                      success: "Successfully Created Account",
                      errors: false
                    });
                  } else {
                    res.statusCode = 200;
                    return res.json({
                      respond: "Creating Account Failed",
                      errors: true
                    });
                  }
                }
              });
            });
          }
        }
      });
    } else {
      res.statusCode = 200
      return res.json({
        respond: "Missing Field",
        errors: true
      });
    }
  }
});
module.exports = router;