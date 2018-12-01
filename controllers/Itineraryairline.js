var express = require('express');
var router = express.Router();
var common = require('./common.js');
var db = require('./connection.js'); // db is pool

// Add Airline to travelgroup
router.put('/:groupid', function(req, res) {
  if (req.get("token") == null || req.get("token") == "") {
    res.statusCode = 200;
    return res.json({
      respond: "Invalid Token Key",
      errors: true
    });
  } else {
    var groupid = req.params.groupid;
    var token = req.get("token");
    common.checksession(db, token, function(returnValue) {
      if (returnValue) {
        if (req.body.airlineid != null && req.body.airlineid !== "") {
              db.query('SELECT airlines_ID from airlines where airlines_ID = ?', req.body.airlineid, function(err, rows, fields) {
                if (err) {
                  console.log("1" + err);
                  res.statusCode = 200;
                  return res.json({
                    respond: "Database Error",
                    errors: true
                  });
                } else {
                  if (rows.length) {
                    db.query('SELECT t_i_c_a_ID from t_i_c_airlines where air_ID = ? and t_i_c_ID = ?', [req.body.airlineid, groupid], function(err, rows, fields) {
                      if (err) {
                        console.log("2" + err);
                        res.statusCode = 200;
                        return res.json({
                          respond: "Database Error",
                          errors: true
                        });
                      }
                      if (rows.length) {
                        res.statusCode = 200
                        return res.json({
                          respond: "Item is already inside your travel group",
                          errors: true
                        });
                      } else {
                        var paremeters = {
                          air_ID: req.body.airlineid,
                          t_i_c_ID: groupid
                        };
                        var query = db.query('INSERT INTO t_i_c_airlines SET ?', paremeters, function(err, result) {
                          if (err) {
                            console.log("3" + err);
                            res.statusCode = 200
                            return res.json({
                              respond: "Database ran into problem",
                              errors: true
                            });
                          } else {
                            if (result) {
                              return res.json({
                                respond: "Successfully Added into Travel group",
                                errors: false
                              });
                            } else {
                              res.statusCode = 200
                              return res.json({
                                respond: "Failed Adding into Travel Group",
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
                      respond: "Flight details not found",
                      errors: true
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

// Delete Airline to travelgroup
router.delete('/:groupid', function(req, res) {
  if (req.get("token") == null || req.get("token") == "") {
    res.statusCode = 200;
    return res.json({
      respond: "Invalid Token Key",
      errors: true
    });
  } else {
    var token = req.get("token");
    common.checksession(db, token, function(returnValue) {
      if (returnValue) {
        var groupid = req.params.groupid;
        var token = req.get("token");
        common.checksession(db, token, function(returnValue) {
          if (returnValue) {
            if (req.body.airlineid != null && req.body.airlineid !== "") {
              common.getstudentid(db, token, function(studentid) {

                db.query('SELECT t_i_c_ID from travel_Itinerary_container where t_i_c_ID = ? and s_l_ID = ?', [groupid, studentid], function(err, rows, fields) {
                  if (err) {
                    res.statusCode = 200;
                    return res.json({
                      respond: "Database Error",
                      errors: true
                    });
                  } else {
                    if (rows.length) {

                      db.query('SELECT t_i_c_a_ID from t_i_c_airlines where air_ID = ? and t_i_c_ID = ?', [req.body.airlineid, groupid], function(err, rows, fields) {
                        if (err) {
                          res.statusCode = 200;
                          return res.json({
                            respond: "Database Error",
                            errors: true
                          });
                        }
                        if (rows.length) {
                          var query = db.query('DELETE FROM t_i_c_airlines where air_ID = ? and t_i_c_ID = ?', [req.body.airlineid, groupid], function(err, result) {
                            if (err) {
                              res.statusCode = 200;
                              return res.json({
                                respond: "Database Error",
                                errors: true
                              });
                            } else {
                              if (result) {
                                return res.json({
                                  respond: "Successfully Deleted from Travel group",
                                  errors: false
                                });
                              } else {
                                res.statusCode = 200
                                return res.json({
                                  respond: "Failed deleting from Travel Group",
                                  errors: true
                                });
                              }
                            }
                          });
                        } else {
                          res.statusCode = 200
                          return res.json({
                            respond: "Item does not exist",
                            errors: true
                          });
                        }
                      });
                    } else {
                      res.statusCode = 200
                      return res.json({
                        respond: "Travel Group details not found",
                        errors: true
                      });
                    }
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
          }
        });
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