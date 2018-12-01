var express = require('express');
var router = express.Router();
var common = require('./common.js');
var db = require('./connection.js'); // db is pool
var nodemailer = require('nodemailer');

// Invite Member
router.put('/', function(req, res) {
  if (req.get("token") == null || req.get("token") === "") {
    res.statusCode = 200;
    return res.json({
      respond: "Invalid Token Key",
      errors: true
    });
  } else {
    var token = req.get("token");
    common.checksession(db, token, function(returnValue) {
      if (returnValue) {
        if (req.body.email != null && req.body.email !== "" && req.body.tgid !== "" && req.body.tgid !== "") {
          db.query('SELECT t_i_c_p_ID from t_i_c_participant where t_i_c_ID = ? and t_i_c_p_email = ? ', [req.body.tgid, req.body.email], function(err, rows, fields) {
            if (err) {
              res.statusCode = 200;
              return res.json({
                respond: "Database Error",
                errors: true
              });
            } else {
              if (rows.length) {
                res.statusCode = 200
                return res.json({
                  respond: "Already Invited",
                  errors: true
                });
              } else {
                var paremeters = {
                  t_i_c_ID: req.body.tgid,
                  t_i_c_p_email: req.body.email
                };
                var query = db.query('INSERT INTO t_i_c_participant SET ?', paremeters, function(err, result) {
                  if (err) {
                    res.statusCode = 200
                    return res.json({
                      respond: "Database ran into problem",
                      errors: true
                    });
                  } else {
                    if (result) {
                      
                      var transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                              user: 'ICT2102AY1819TEAM08@gmail.com',
                              pass: 'cat123!@#'
                            }
                          });
                      var mailOptions;
                      db.query('SELECT s_l_username from secure_login where s_l_email = ?', [req.body.email], function(err, rows, fields) {
                        if (rows.length) {
                          mailOptions = {
                            from: 'ICT2102AY1819TEAM08@gmail.com',
                            to: req.body.email,
                            subject: 'Travel Itinerary Collaboration',
                            html : 'Hi ' + rows[0].s_l_username + '<br />  You have been invited </br > ' + req.body.note
                          };
                          
                        } else {
                          mailOptions = {
                            from: 'ICT2102AY1819TEAM08@gmail.com',
                            to: req.body.email,
                            subject: 'Travel Itinerary Collaboration',
                            html : 'Hi , </br > You have been invited </br > ' + req.body.note
                          };
                        }
                        transporter.sendMail(mailOptions, function(error, info) {
                            if (error) {
                              console.log(error);
                            } else {
                              console.log('Email sent: ' + info.response);
                            }
                            return res.json({
                              respond: "Successfully Invited Friend",
                              errors: false
                            });
                          });
                      });
                    } else {
                      res.statusCode = 200
                      return res.json({
                        respond: "Invitation failed",
                        errors: true
                      });
                    }
                  }
                });
              }
            }
          });
        } else {
          res.statusCode = 200
          return res.json({
            respond: "Missing Fields",
            errors: true
          });
        }
      } else {
        res.statusCode = 200
        return res.json({
          respond: "Invalid session",
          errors: true
        });
      }
    });
  }
});

module.exports = router;