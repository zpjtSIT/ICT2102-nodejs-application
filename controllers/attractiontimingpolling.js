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
        if (req.body.attractiontimingpollingid != null && req.body.attractiontimingpollingid !== "" && req.body.vote != null && req.body.vote !== "") {
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
                db.query('SELECT * FROM attractions_suggested_timing_poll where t_i_c_p_ID = ? and a_s_t_ID = ?', [row_par[0].t_i_c_p_ID, req.body.attractiontimingpollingid], function(err, rows, fields) {
                  if (err) {
                    res.statusCode = 200;
                    return res.json({
                      respond: "Database Error",
                      errors: true
                    });
                  }
                  if (rows.length) {
                    db.query('Update attractions_suggested_timing_poll set a_s_t_vote = ? where a_s_t_p_ID = ?', [req.body.vote, rows[0].a_s_t_p_ID], function(err, result) {
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
                      a_s_t_ID: req.body.attractiontimingpollingid,
                      a_s_t_vote: req.body.vote
                    }

                    var query = db.query('INSERT INTO attractions_suggested_timing_poll SET ?', paremeters, function(err, result) {
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