var express = require('express');
var router = express.Router();
var common = require('./common.js');
var db = require('./connection.js'); // db is pool

// Add Hotel to travelgroup
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
        if (req.body.hotelid != null && req.body.hotelid !== "") {
          common.getuserid(db, token, function(userid) {
            db.query('SELECT hotel_ID from hotel where hotel_ID = ?', req.body.hotelid, function(err, rows, fields) {
              if (err) {
                res.statusCode = 200;
                return res.json({
                  respond: "Database Error",
                  errors: true
                });
              } else {
                if (rows.length) {
                  db.query('SELECT t_i_c_h_ID from t_i_c_hotel where hotel_ID = ? and t_i_c_h_ID = ?', [req.body.hotelid, groupid], function(err, rows, fields) {
                    if (err) {
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
                        hotel_ID: req.body.hotelid,
                        t_i_c_ID: groupid
                      };
                      var query = db.query('INSERT INTO t_i_c_hotel SET ?', paremeters, function(err, result) {
                        if (err) {
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
                    respond: "Hotel details not found",
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

// Delete Hotel from travelgroup
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
            if (req.body.hotelid != null && req.body.hotelid !== "") {
              common.getuserid(db, token, function(userid) {

                db.query('SELECT t_i_c_ID from travel_Itinerary_container where t_i_c_ID = ? and s_l_ID = ?', [groupid, getuserid], function(err, rows, fields) {
                  if (err) {
                    res.statusCode = 200;
                    return res.json({
                      respond: "Database Error",
                      errors: true
                    });
                  } else {
                    if (rows.length) {

                      db.query('SELECT t_i_c_h_ID from t_i_c_hotel where hotel_ID = ? and t_i_c_ID = ?', [req.body.hotelid, groupid], function(err, rows, fields) {
                        if (err) {
                          res.statusCode = 200;
                          return res.json({
                            respond: "Database Error",
                            errors: true
                          });
                        }
                        if (rows.length) {
                          var query = db.query('DELETE FROM t_i_c_hotel where hotel_ID = ? and t_i_c_ID = ?', [req.body.hotelid, groupid], function(err, result) {
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