var express = require('express');
var router = express.Router();
var common = require('./common.js');
var db = require('./connection.js'); // db is pool

// Get all hotel based on containerid
router.get('/retrieve/:hid', function(req, res) {
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
        var count = [];
        var item_array = [];
        var hid = req.params.hid;
        db.query('SELECT hst.* , tich.* , s_l_full_name FROM hotel_suggested_timing hst inner join t_i_c_hotel tich inner join secure_login sl inner join hotel h where h.hotel_ID = tich.hotel_ID and hst.s_l_ID = sl.s_l_ID  and tich.t_i_c_h_ID = hst.t_i_c_h_ID and hst.t_i_c_h_ID = ?', [hid], function(err, rows, fields) {
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
                  id: rows[i].h_s_t_ID,
                  suggested: rows[i].s_l_full_name,
                  start: rows[i].h_s_t_start_time,
                  end: rows[i].h_s_t_end_time,
                  ticid : rows[i].t_i_c_ID,
                  tichid : rows[i].t_i_c_h_ID
                }
                item_array.push(jsonObject);
              }

              var counter = 0;
              var count = [];
              for (var z = 0; z < item_array.length; z++) {
                db.query('select (b.count_two / a.count_one) * 100 as final_count from (select count(t_i_c_p_ID) as count_one from '+
                 't_i_c_participant where t_i_c_ID = ?) a,(select count(hstp.t_i_c_p_ID) as count_two from hotel_suggested_timing_poll hstp join t_i_c_participant ticp on '+
                  'hstp.t_i_c_p_ID = ticp.t_i_c_p_ID  where ticp.t_i_c_ID = ? and h_s_t_p_vote = 1 and hstp.h_s_t_ID = ?) b', [item_array[z].ticid, item_array[z].ticid, item_array[z].id],
                  function(err, row_result, fields) {
                    if (err) {
                      count.push(0);
                    }
                    if (row_result.length) {
                      count.push(Math.round(row_result[0].final_count));
                    } else {
                      count.push(0);
                    }
                    if (counter == item_array.length - 1) {
                      res.statusCode = 200
                      return res.json({
                        count: count,
                        respond: item_array,
                        errors: false
                      });
                    }
                    counter++;
                  });
              }
            } else {
              res.statusCode = 200
              return res.json({
                count : [],
                respond: item_array,
                errors: false
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

// Get all Location
router.post('/:tichid', function(req, res) {
  if (req.get("token") == null || req.get("token") == "") {
    res.statusCode = 200;
    return res.json({
      respond: "Invalid Token Key",
      errors: true
    });
  } else {
    var token = req.get("token");
    var tichid = req.params.tichid;
    common.checksession(db, token, function(returnValue) {
      if (returnValue) {

        if (req.body.startdate !== "null" && req.body.startdate !== null && req.body.enddate !== "" && req.body.enddate !== null && req.body.starttime !== "" && req.body.starttime !== null && req.body.endtime !== "" && req.body.endtime !== null) {

          common.getuserid(db, token, function(sld) {
            
            var finalstartdatetime = req.body.startdate + "T" + req.body.starttime;
            var finalenddatetime = req.body.enddate + "T" + req.body.endtime;
            
            var paremeters = {
              h_s_t_start_time: finalstartdatetime ,
              h_s_t_end_time: finalenddatetime ,
              t_i_c_h_ID: tichid,
              s_l_ID:  sld
            }
            var query = db.query('INSERT INTO hotel_suggested_timing SET ?', paremeters, function(err, result) {
              if (err) {
                res.statusCode = 200
                console.log(err)
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
                    respond: "Vote Fail",
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

module.exports = router;