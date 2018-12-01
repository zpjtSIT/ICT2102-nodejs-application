var express = require('express');
var router = express.Router();
var common = require('./common.js');
var db = require('./connection.js'); // db is pool

// Get all hotel based on containerid
router.get('/retrieve/:cid', function(req, res) {
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
        var cid = req.params.cid;
        db.query('SELECT ast.* , tica.* , s_l_full_name FROM attractions_suggested_timing ast inner join t_i_c_attractions tica inner join secure_login sl inner join attractions a where a.attractions_ID = tica.attractions_ID and ast.s_l_ID = sl.s_l_ID  and tica.t_i_c_att_ID = ast.t_i_c_att_ID and tica.t_i_c_att_ID = ?', [cid], function(err, rows, fields) {
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
                  id: rows[i].a_s_t_ID,
                  suggested: rows[i].s_l_full_name,
                  start: rows[i].a_s_t_start_time,
                  end: rows[i].a_s_t_end_time,
                  ticid: rows[i].t_i_c_ID,
                  ticaid : rows[i].t_i_c_att_ID
                }
                item_array.push(jsonObject);
              }

              var counter = 0;
              var count = [];
              for (var z = 0; z < item_array.length; z++) {
                db.query('select (b.count_two / a.count_one) * 100 as final_count from (select count(t_i_c_p_ID) as count_one from ' +
                  't_i_c_participant where t_i_c_ID = ?) a,(select count(astp.t_i_c_p_ID) as count_two from attractions_suggested_timing_poll astp join t_i_c_participant ticp on ' +
                  'astp.t_i_c_p_ID = ticp.t_i_c_p_ID  where ticp.t_i_c_ID = ? and a_s_t_vote = 1 and astp.a_s_t_ID = ?) b', [item_array[z].ticid, item_array[z].ticid, item_array[z].id],
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
                count: [],
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
router.post('/:ticaid', function(req, res) {
  if (req.get("token") == null || req.get("token") == "") {
    res.statusCode = 200;
    return res.json({
      respond: "Invalid Token Key",
      errors: true
    });
  } else {
    var token = req.get("token");
    var ticaid = req.params.ticaid;
    common.checksession(db, token, function(returnValue) {
      if (returnValue) {

        if (req.body.startdate !== "null" && req.body.startdate !== null && req.body.enddate !== "" && req.body.enddate !== null && req.body.starttime !== "" && req.body.starttime !== null && req.body.endtime !== "" && req.body.endtime !== null) {

          common.getuserid(db, token, function(sld) {
            
            var finalstartdatetime = req.body.startdate + "T" + req.body.starttime;
            var finalenddatetime = req.body.enddate + "T" + req.body.endtime;
            
            var paremeters = {
              a_s_t_start_time: finalstartdatetime ,
              a_s_t_end_time: finalenddatetime ,
              t_i_c_att_ID: ticaid,
              s_l_ID:  sld
            }
            var query = db.query('INSERT INTO attractions_suggested_timing SET ?', paremeters, function(err, result) {
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