var express = require('express');
var router = express.Router();
var common = require('./common.js');
var db = require('./connection.js'); // db is pool

// Add Attractions to travelgroup
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
        if (req.body.attractionid != null && req.body.attractionid !== "") {
          common.getuserid(db, token, function(userid) {
            db.query('SELECT attractions_ID from attractions where attractions_ID = ?', req.body.attractionid, function(err, rows, fields) {
              if (err) {
                res.statusCode = 200;
                return res.json({
                  respond: "Database Error",
                  errors: true
                });
              } else {
                if (rows.length) {
                  db.query('SELECT t_i_c_att_ID from t_i_c_attractions where attractions_ID = ? and t_i_c_att_ID = ?', [req.body.attractionid, groupid], function(err, rows, fields) {
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
                        attractions_ID: req.body.attractionid,
                        t_i_c_ID: groupid
                      };
                      var query = db.query('INSERT INTO t_i_c_attractions SET ?', paremeters, function(err, result) {
                        if (err) {
                          res.statusCode = 200
                          return res.json({
                            respond: "Database ran into problem",
                            errors: true
                          });
                        } else {
                          if (result) {
                            return res.json({
                              respond: "Successfully Added",
                              errors: false
                            });
                          } else {
                            res.statusCode = 200
                            return res.json({
                              respond: "Failed Adding",
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
                    respond: "Attractions details not found",
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

// Delete Attractions from travelgroup
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
            if (req.body.attractionid != null && req.body.attractionid !== "") {
              common.getuserid(db, token, function(userid) {

                db.query('SELECT t_i_c_ID from travel_Itinerary_container where t_i_c_ID = ? and s_l_ID = ?', [groupid, userid], function(err, rows, fields) {
                  if (err) {
                    res.statusCode = 200;
                    return res.json({
                      respond: "Database Error",
                      errors: true
                    });
                  } else {
                    if (rows.length) {

                      db.query('SELECT t_i_c_att_ID from t_i_c_attractions where attractions_ID = ? and t_i_c_ID = ?', [req.body.attractionid, groupid], function(err, rows, fields) {
                        if (err) {
                          res.statusCode = 200;
                          return res.json({
                            respond: "Database Error",
                            errors: true
                          });
                        }
                        if (rows.length) {
                          var query = db.query('DELETE FROM t_i_c_attractions where attractions_ID = ? and t_i_c_ID = ?', [req.body.attractionid, groupid], function(err, result) {
                            if (err) {
                              res.statusCode = 200;
                              return res.json({
                                respond: "Database Error",
                                errors: true
                              });
                            } else {
                              if (result) {
                                return res.json({
                                  respond: "Successfully Deleted",
                                  errors: false
                                });
                              } else {
                                res.statusCode = 200
                                return res.json({
                                  respond: "Failed deleting item",
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