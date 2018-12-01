var express = require('express');
var router = express.Router();
var common = require('./common.js');
var db = require('./connection.js'); // db is pool
var moment = require('moment');

// New TravelGroup
router.post('/', function(req, res) {
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
        if (req.body.name != null && req.body.name !== "") {
          common.getuserid(db, token, function(studentid) {
            var paremeters = {
              t_i_c_name: req.body.name,
              s_l_ID: studentid
            };
            var query = db.query('INSERT INTO travel_Itinerary_container SET ?', paremeters, function(err, result) {
              if (err) {
                res.statusCode = 200
                return res.json({
                  respond: "Database ran into problem",
                  errors: true
                });
              } else {
                if (result) {
                  return res.json({
                    respond: "Successfully Created Travel Group",
                    errors: false
                  });
                } else {
                  res.statusCode = 200
                  return res.json({
                    respond: "Creating Travel Group Failed",
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
// Get all TravelGroup
router.get('/', function(req, res) {
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
        common.getuserid(db, token, function(studentID) {
          common.getstudentemailbasedontoken(db, token, function(studentemail) {
            db.query('SELECT t_i_c_ID,t_i_c_name,t_i_c_name,t_i_c_status FROM travel_Itinerary_container where s_l_ID = ? UNION SELECT tic.t_i_c_ID,t_i_c_name,t_i_c_name,t_i_c_status FROM t_i_c_participant ticp inner join travel_Itinerary_container tic where ticp.t_i_c_ID = tic.t_i_c_ID and ticp.t_i_c_p_email = ?', [studentID, studentemail], function(err, rows, fields) {
              if (err) {
                res.statusCode = 200
                return res.json({
                  respond: "Database ran into some problem",
                  errors: true
                });
              } else {
                var jsonArray = {};
                if (rows.length) {
                  var bv = [];
                  var plan = [];
                  var past = [];
                  for (var i = 0; i < rows.length; i++) {
                    var jsonObject = {
                      id: rows[i].t_i_c_ID,
                      name: rows[i].t_i_c_name,
                      status: rows[i].t_i_c_status
                    }
                    if (rows[i].t_i_c_status === 0) {
                      plan.push(jsonObject);
                    } else if (rows[i].t_i_c_status === 1) {
                      bv.push(jsonObject);
                    } else {
                      past.push(jsonObject);
                    }
                  }
                  jsonArray = {
                    bv: bv,
                    plan: plan,
                    past: past
                  };
                }
                return res.json({
                  respond: jsonArray,
                  errors: false
                });
              }
            });
          });
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
// Check page belong to 
router.get('/:id', function(req, res) {
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
        var id = req.params.id;
        common.getuserid(db, token, function(studentid) {
          if (studentid > 0) {
            var title = "";
            db.query('SELECT * from travel_Itinerary_container where t_i_c_ID = ? ', [id], function(err, return_row_tic, fields) {
              if (err) {
                res.statusCode = 200
                return res.json({
                  respond: "Database ran into some problem",
                  errors: true
                });
              } else {
                if (return_row_tic.length) {
                  var country, startdate, enddate , flightstart , flightend;
                  country = return_row_tic[0].t_i_c_country;
                  startdate = return_row_tic[0].t_i_c_start;
                  enddate = return_row_tic[0].t_i_c_end;
                  title =  return_row_tic[0].t_i_c_name;
                  
                  
                  if(typeof(startdate) != "undefined" && startdate !== null && startdate !== "0000-00-00"  &&  typeof(enddate) != "undefined" && enddate !== null && enddate !== "0000-00-00" ) {
                    
                    flightstart = moment(startdate).utc().format('YYYY-MM-DD');
                    flightend = moment(enddate).utc().format('YYYY-MM-DD');
                    startdate = moment(startdate).utc().format('DD-MM-YYYY');
                    enddate = moment(enddate).utc().format('DD-MM-YYYY');
                    
                  } else {
                    country = null;
                    startdate = null;
                    enddate = null;
                  }
                   
                 db.query('SELECT * from travel_Itinerary_container where t_i_c_ID = ? ', [id], function(err, rows, fields) {
                  if (err) {
                      res.statusCode = 200
                      return res.json({
                        respond: "Database ran into some problem",
                        errors: true
                      });
                    } else {
                      
                      var owner_container = rows[0].s_l_ID;

                  db.query('SELECT t_i_c_ID,s_l_ID from travel_Itinerary_container where t_i_c_ID = ? and s_l_ID = ?', [id, studentid], function(err, rows, fields) {
                    if (err) {
                      res.statusCode = 200
                      return res.json({
                        respond: "Database ran into some problem",
                        errors: true
                      });
                    } else {
                      var jsonArray = {};
                      var owner = 0;
                      var persontype = 0;
                      var travelmemberarray = [];
                      if (rows.length) {
                        owner = rows[0].s_l_ID,
                          // IF CONTAINER IS FOUND RETURN ALL OTHER FIELDS
                          persontype = 2;
                      } else {
                        common.getstudentemailbasedontoken(db, token, function(studentemail) {
                          db.query('SELECT t_i_c_ID from t_i_c_participant where t_i_c_ID = ? and t_i_c_p_email = ? ', [id, studentemail], function(err, rows, fields) {
                            if (err) {
                              res.statusCode = 200
                              return res.json({
                                respond: "Database ran into some problem",
                                errors: true
                              });
                            } else {
                              if (rows.length) {
                                persontype = 1;
                              } else {
                                //Not found
                                persontype = 0;
                              }
                            }
                          });
                        });
                      }
                      db.query('SELECT sl.s_l_ID,s_l_full_name FROM travel_Itinerary_container tic inner join secure_login sl where t_i_c_ID = ? and sl.s_l_ID = tic.s_l_ID union select s_l_ID,s_l_full_name FROM t_i_c_participant ticp inner join secure_login sl where t_i_c_ID = ? and t_i_c_p_email = sl.s_l_email UNION SELECT COALESCE(0) AS s_l_ID , t_i_c_p_email as s_l_full_name  FROM t_i_c_participant where t_i_c_p_email not in (select s_l_email from secure_login) and t_i_c_ID = ?  ', [id, id, id], function(err, rows, fields) {
                        if (err) {
                          res.statusCode = 200
                          return res.json({
                            respond: err,
                            errors: true
                          });
                        } else {
                          if (rows.length) {
                            for (var i = 0; i < rows.length; i++) {
                              var jsonObject = {
                                id: rows[i].s_l_ID,
                                name: rows[i].s_l_full_name
                              }
                              travelmemberarray.push(jsonObject);
                            }
                          }
                          jsonArray = {
                            id : id ,
                            type: persontype,
                            members: travelmemberarray,
                            owner: owner,
                            country: country,
                            startdate: startdate,
                            enddate: enddate,
                            title : title,
                            flightstart : flightstart,
                            flightend :flightend,
                            container_owner : owner_container
                          }
                          res.statusCode = 200
                          return res.json({
                            respond: jsonArray,
                            errors: false
                          });
                        }
                      });
                    }
                  });
                    }
                });
                } else {
                  res.statusCode = 200
                  return res.json({
                    respond: "Not Found",
                    errors: true
                  });
                }
              }
            });
          } else {
            res.statusCode = 200
            return res.json({
              respond: "invalid",
              errors: true
            });
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
// Update the country and date time
router.put('/:id', function(req, res) {
  if (req.get("token") == null || req.get("token") === "") {
    res.statusCode = 200;
    return res.json({
      respond: "Invalid Token Key",
      errors: true
    });
  } else {
    var id = req.params.id;
    var token = req.get("token");
    common.checksession(db, token, function(returnValue) {
      if (returnValue) {
        if (req.body.country !== null && req.body.country !== "" && req.body.startdate !== "" && req.body.startdate !== null && req.body.enddate !== "" && req.body.enddate !== null) {
          var start = moment(req.body.startdate, 'DD/MM/YYYY');
          var new_start_date = start.format('YYYY-MM-DD');
          var end = moment(req.body.enddate, 'DD/MM/YYYY');
          var new_end_date = end.format('YYYY-MM-DD');
          var updatequery1 = {
            t_i_c_country: req.body.country,
            t_i_c_start: new_start_date,
            t_i_c_end: new_end_date,
          }
          var query = db.query('UPDATE travel_Itinerary_container SET ? where t_i_c_ID = ? ', [updatequery1, id], function(err, result) {
            if (err) {
              res.statusCode = 200;
              return res.json({
                respond: "Database error",
                error: true
              });
            } else {
              return res.json({
                respond: "Successful",
                errors: false
              });
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