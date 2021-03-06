var express = require('express');
var router = express.Router();
var common = require('./common.js');
var db = require('./connection.js'); // db is pool

router.put('/:cid', function(req, res) {
  if (req.get("token") == null || req.get("token") == "") {
    res.statusCode = 500;
    return res.json({
      respond: "Invalid Token Key",
      errors: true
    });
  } else {
    var token = req.get("token");
    var cid = req.params.cid;
    common.checksession(db, token, function(returnValue) {
      if (returnValue) {
        if (req.body.airID != null && req.body.airID !== "" && req.body.vote != null && req.body.vote !== "") {
          common.getstudentemailbasedontoken(db, token, function(email) {
            db.query('SELECT * FROM t_i_c_participant where  t_i_c_p_email = ? and t_i_c_ID = ?', [email, cid], function(err, row_par, fields) {
              if (err) {
                res.statusCode = 200;
                return res.json({
                  respond: "Database Error",
                  errors: true
                });
              }
              if (row_par.length) {
                db.query('SELECT * FROM t_i_c_airlines where air_ID = ? and t_i_c_ID = ?', [req.body.airID, cid], function(err, rows_123, fields) {
                  if (err) {
                    res.statusCode = 200;
                    return res.json({
                      respond: "Database Error",
                      errors: true
                    });
                  }
                  if (rows_123.length) {
                    db.query('SELECT * FROM airline_polling where t_i_c_p_ID = ? and t_i_c_a_ID = ?', [row_par[0].t_i_c_p_ID, rows_123[0].t_i_c_a_ID], function(err, rows, fields) {
                      if (err) {
                        res.statusCode = 200;
                        return res.json({
                          respond: "Database Error",
                          errors: true
                        });
                      }
                      if (rows.length) {
                        db.query('Update airline_polling set a_p_vote = ? where a_p_ID = ?', [req.body.vote , rows[0].a_p_ID],  function(err, result) {
                          if (err) {
                            res.statusCode = 200
                            return res.json({
                              respond: "Database ran into problem",
                              errors: true
                            });
                          } else {
                              if (result) {
                              return res.json({
                                respond: "Successfully Voted",
                                errors: false
                              });
                            } else {
                              res.statusCode = 200
                              return res.json({
                                respond: "Vote Fail",
                                errors: true
                              });
                            }
                          }
                        });
                      } else {
                        var paremeters = {
                          t_i_c_p_ID: row_par[0].t_i_c_p_ID,
                          t_i_c_a_ID: rows_123[0].t_i_c_a_ID,
                          a_p_vote: req.body.vote
                        }

                        var query = db.query('INSERT INTO airline_polling SET ?', paremeters, function(err, result) {
                          if (err) {
                            console.log(err);
                            res.statusCode = 200
                            return res.json({
                              respond: "Database ran into problem",
                              errors: true
                            });
                          } else {
                            if (result) {
                              return res.json({
                                respond: "Successfully Voted",
                                errors: false
                              });
                            } else {
                              res.statusCode = 200
                              return res.json({
                                respond: "Vote Fail",
                                errors: true
                              });
                            }
                          }
                        });
                      }
                    });
                  } else {
                    res.statusCode = 200
                    return res.json({
                      respond: "Not Authorize",
                      errors: true
                    });
                  }
                });
              } else {
                res.statusCode = 200
                return res.json({
                  respond: "Not Authorize 1",
                  errors: true
                });
              }
            });
          });
        } else {
          res.statusCode = 200
          return res.json({
            respond: "Missing Fields",
            errors: true
          });
        }

      } else {
        res.statusCode = 500
        return res.json({
          respond: "Invalid session",
          errors: true
        });
      }
    });
  }
});

module.exports = router;