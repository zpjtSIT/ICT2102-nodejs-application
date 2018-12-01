var express = require('express');
var router = express.Router();
var common = require('./common.js');
var db = require('./connection.js'); // db is pool

//get all hotel based on country
router.get('/:cid', function(req, res) {
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
        var cid = req.params.cid;
        db.query('SELECT * FROM t_i_c_attractions where t_i_c_ID = ?', [cid], function(err, first_rows, fields) {
          if (err) {
            res.statusCode = 200
            return res.json({
              respond: err,
              errors: true
            });
          }
          var query = db.query('SELECT * FROM attractions where country = (select t_i_c_country from travel_Itinerary_container where t_i_c_ID = ?);', cid, function(err, rows, fields) {
            if (err) {
              res.statusCode = 200
              return res.json({
                respond: "Database ran into problem",
                errors: true
              });
            } else {
              var item_array = [];
              var map_markers = [];
              if (rows.length) {
                for (var i = 0; i < rows.length; i++) {

                  var selected_att = "";

                  for (var c = 0; c < first_rows.length; c++) {
                    if (first_rows[c].attractions_ID == rows[i].attractions_ID) {
                      selected_att = "checked disabled";

                      var item = {
                        name: rows[i].attractions_name,
                        lat: rows[i].attractions_lat,
                        long: rows[i].attractions_long

                      }
                      map_markers.push(item);
                    }
                  }

                  var jsonObject = {
                    id: rows[i].attractions_ID,
                    name: rows[i].attractions_name,
                    address: rows[i].attraction_location,
                    lat: rows[i].attractions_lat,
                    long: rows[i].attractions_long,
                    rating: rows[i].attractions_rating,
                    type: rows[i].attraction_type,
                    image: rows[i].attraction_img,
                    country: rows[i].country,
                    open: rows[i].openingHr,
                    close: rows[i].closingHr,
                    desc: rows[i].attraction_description,
                    selected_attraction: selected_att
                  }
                  item_array.push(jsonObject);
                }
              }
              res.statusCode = 200
              return res.json({
                respond: item_array,
                map_markers: map_markers,
                errors: false
              });
            }
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

router.post('/:cid', function(req, res) {
  if (req.get("token") == null || req.get("token") == "") {
    res.statusCode = 200;
    return res.json({
      respond: "Invalid Token Key",
      errors: true
    });
  } else {
    var cid = req.params.cid;
    var searchterm = '';
    searchterm = "%" + req.body.search + "%";
    var token = req.get("token");
    common.checksession(db, token, function(returnValue) {
      if (returnValue) {
        db.query('SELECT * FROM t_i_c_attractions where t_i_c_ID = ?', [cid], function(err, first_rows, fields) {
          if (err) {
            res.statusCode = 200
            return res.json({
              respond: err,
              errors: true
            });
          }

          var query = db.query('SELECT * FROM attractions where country = (select t_i_c_country from travel_Itinerary_container where t_i_c_ID = ?) AND attractions_name like ? ', [cid, searchterm], function(err, rows, fields) {
            if (err) {
              res.statusCode = 200
              return res.json({
                respond: err,
                errors: true
              });
            } else {
              var item_array = [];
              if (rows.length) {
                for (var i = 0; i < rows.length; i++) {
                  var selected_att = "";

                  for (var c = 0; c < first_rows.length; c++) {
                    if (first_rows[c].attractions_ID == rows[i].attractions_ID) {
                      selected_att = "checked disabled";

                      var item = {
                        name: rows[i].attractions_name,
                        lat: rows[i].attractions_lat,
                        long: rows[i].attractions_long

                      }
                      map_markers.push(item);
                    }
                  }

                  var jsonObject = {
                    id: rows[i].attractions_ID,
                    name: rows[i].attractions_name,
                    address: rows[i].attraction_location,
                    lat: rows[i].attractions_lat,
                    long: rows[i].attractions_long,
                    rating: rows[i].attractions_rating,
                    type: rows[i].attraction_type,
                    image: rows[i].attraction_img,
                    country: rows[i].country,
                    open: rows[i].openingHr,
                    close: rows[i].closingHr,
                    desc: rows[i].attraction_description,
                    selected_attraction: selected_att
                  }
                  item_array.push(jsonObject);
                }
              }
              res.statusCode = 200
              return res.json({
                respond: item_array,
                errors: false
              });
            }
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
        db.query('SELECT * FROM t_i_c_attractions ticatt inner join attractions att  where t_i_c_ID = ? and ticatt.attractions_ID = att.attractions_ID', [cid], function(err, rows, fields) {
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
                  id: rows[i].attractions_ID,
                  name: rows[i].attractions_name,
                  rating: rows[i].attractions_rating,
                  type: rows[i].attraction_type,
                  open: rows[i].openingHr,
                  close: rows[i].closingHr,
                  ticatt: rows[i].t_i_c_att_ID
                }
                item_array.push(jsonObject);
              }

              var counter = 0;
              var count = [];
              for (var z = 0; z < item_array.length; z++) {
                db.query('select (b.count_two / a.count_one) * 100 as final_count from (select count(t_i_c_p_ID) as count_one from ' +
                  't_i_c_participant where t_i_c_ID = ?) a,(select count(ap.t_i_c_p_ID) as count_two from attraction_polling ap join t_i_c_participant ticp on ' +
                  'ap.t_i_c_p_ID = ticp.t_i_c_p_ID  where ticp.t_i_c_ID = ? and att_p_vote = 1 and ap.t_i_c_att_ID = ?) b', [cid, cid, item_array[z].ticatt],
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

module.exports = router;