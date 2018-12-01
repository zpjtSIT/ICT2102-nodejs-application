var express = require('express');
var router = express.Router();
var common = require('./common.js');
var db = require('./connection.js'); // db is pool


router.get('/retrieve/flight/:cid', function(req, res) {
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
        var cid = req.params.cid;
        db.query('SELECT * FROM t_i_c_airlines tica inner join airlines a where tica.air_ID = a.airlines_ID and tica.t_i_c_ID = ?', cid, function(err, rows, fields) {
          if (err) {
            console.log("1" + err);
            res.statusCode = 200;
            return res.json({
              respond: "Database Error",
              errors: true
            });
          } else {
            var result_array = []
            if (rows.length) {
              for (var i = 0; i < rows.length; i++) {
                var flight_array = rows[i].airlines_json
                var flight_array_parse = JSON.parse(flight_array);

                var flight_go_count = (flight_array_parse.odoList[0].segments).length - 1;
                var origin = flight_array_parse.odoList[0].segments[0].origCode;
                var destination = flight_array_parse.odoList[0].segments[flight_go_count].destCode;

                var flight_go_count1 = (flight_array_parse.odoList[1].segments).length - 1;
                var origin1 = flight_array_parse.odoList[1].segments[0].origCode;
                var destination1 = flight_array_parse.odoList[1].segments[flight_go_count1].destCode;


                var departure = flight_array_parse.odoList[0].segments[0].departureDateTime
                var arrival = flight_array_parse.odoList[0].segments[flight_go_count].arrivalDateTime

                var departure1 = flight_array_parse.odoList[1].segments[0].departureDateTime
                var arrival1 = flight_array_parse.odoList[1].segments[flight_go_count1].arrivalDateTime

                var depart_array = departure.split("T");

                var depart_time = depart_array[1].slice(0, depart_array[1].length - 3);

                var date_depart = depart_array[0] + " " + depart_time;

                var depart_array1 = departure1.split("T");

                var depart_time1 = depart_array1[1].slice(0, depart_array1[1].length - 3);

                var date_depart1 = depart_array1[0] + " " + depart_time1;


                var arrival_array = arrival.split("T");

                var arrival_time = arrival_array[1].slice(0, arrival_array[1].length - 3);

                var date_arrival = arrival_array[0] + " " + arrival_time;

                var arrival_array1 = arrival1.split("T");

                var arrival_time1 = arrival_array1[1].slice(0, arrival_array1[1].length - 3);

                var date_arrival1 = arrival_array1[0] + " " + arrival_time1;


                var flight_ariline = JSON.parse(rows[i].airlines_name);

                var airline_company = "";
                var airline_company1 = "";


                var keys = Object.keys(flight_ariline);
                for (var f = 0; f < keys.length; f++) {
                  var key = keys[f];
                  if (key === flight_array_parse.odoList[0].segments[0].airlineCode) {
                    airline_company = flight_ariline[key];
                  }
                  if (key === flight_array_parse.odoList[1].segments[0].airlineCode) {
                    airline_company1 = flight_ariline[key];
                  }

                }
                var cost = 0;

                if ((flight_array_parse.currencyCode) == "ZAR") {
                  cost = Math.round(flight_array_parse.amount * 0.094);
                }
                var json = {
                  id: rows[i].airlines_ID,
                  airline: airline_company,
                  cost: cost,
                  origin: origin,
                  destination: destination,
                  transfer: flight_go_count,
                  departure_date: date_depart,
                  airline1: airline_company1,
                  arrival: date_arrival1,
                  origin1: origin1,
                  destination1: destination1,
                  transfer1: flight_go_count1,
                  departure_date1: date_depart1,
                  arrival1: date_arrival1,
                  tica: rows[i].t_i_c_a_ID
                }
                result_array.push(json);
              }

              var counter = 0;
              var count = [];
              for (var z = 0; z < result_array.length; z++) {
                db.query('select (b.count_two / a.count_one) * 100 as final_count from (select count(t_i_c_p_ID) as count_one from ' +
                  't_i_c_participant where t_i_c_ID = ?) a,(select count(ap.t_i_c_p_ID) as count_two from airline_polling ap join t_i_c_participant ticp on ' +
                  'ap.t_i_c_p_ID = ticp.t_i_c_p_ID  where ticp.t_i_c_ID = ? and ap.a_p_vote = 1 and ap.t_i_c_a_ID = ?) b', [cid, cid, result_array[z].tica],
                  function(err, row_result, fields) {
                    if (err) {
                      count.push(0);
                    }
                    if (row_result.length) {
                      count.push(Math.round(row_result[0].final_count));
                    } else {
                      count.push(0);
                    }
                    if (counter == result_array.length - 1) {
                      res.statusCode = 200
                      return res.json({
                        count: count,
                        respond: result_array,
                        errors: false
                      });
                    }
                    counter++;
                  });
              }
            } else {
              res.statusCode = 200
              return res.json({
                respond: result_array,
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

router.get('/retrieve/attraction/:cid', function(req, res) {
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
        var cid = req.params.cid;
        db.query('select t_i_c_attractions.t_i_c_ID, attractions_suggested_timing.a_s_t_ID, t_i_c_attractions.t_i_c_att_selected, attractions_suggested_timing.a_s_t_selected, attractions.attractions_name,attractions_suggested_timing.a_s_t_start_time,attractions_suggested_timing.a_s_t_end_time from '+
                'attractions_suggested_timing inner join t_i_c_attractions on t_i_c_attractions.t_i_c_att_ID = attractions_suggested_timing.t_i_c_att_ID inner join attractions on t_i_c_attractions.attractions_ID = attractions.attractions_ID '+
                'where t_i_c_attractions.t_i_c_ID = 29 '+
                'UNION '+
                'SELECT t_i_c_attractions.t_i_c_ID,coalesce(0) as a_s_t_ID, t_i_c_attractions.t_i_c_att_selected, coalesce(0) as a_s_t_selected, attractions.attractions_name,coalesce(0) as a_s_t_start_time,coalesce(0) as a_s_t_end_time from t_i_c_attractions, attractions WHERE t_i_c_attractions.attractions_ID=attractions.attractions_ID AND '+
                't_i_c_attractions.t_i_c_ID = 29 AND t_i_c_attractions.t_i_c_att_ID NOT IN' +
                '(SELECT t_i_c_attractions.t_i_c_att_ID from t_i_c_attractions WHERE t_i_c_attractions.t_i_c_ID = 29 AND EXISTS (SELECT * from attractions_suggested_timing where attractions_suggested_timing.t_i_c_att_ID = t_i_c_attractions.t_i_c_att_ID))', [cid,cid], function(err, rows, fields) {
          if (err) {
            console.log(err)
            res.statusCode = 200;
            return res.json({
              respond: "Database Error",
              errors: true
            });
          } else {
            var result_array = []
            if (rows.length) {
              for (var i = 0; i < rows.length; i++) {
               var json = { 
                 ticid : rows[i].t_i_c_ID,
                 a_s_t_ID : rows[i].a_s_t_ID,
                 attractionname : rows[i].attractions_name,
                 start : rows[i].a_s_t_start_time,
                 end : rows[i].a_s_t_end_time
               }
               result_array.push(json)
              }
              
              res.statusCode = 200
              return res.json({
                respond: result_array,
                errors: false
              });
              
            } else {
              res.statusCode = 200
              return res.json({
                respond: result_array,
                errors: false
              });
            }
          }
        });
      }
    });
  }
});

module.exports = router;