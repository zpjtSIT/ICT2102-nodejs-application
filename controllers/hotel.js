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
        db.query('SELECT * FROM t_i_c_hotel where t_i_c_ID = ?', [cid], function(err, first_rows, fields) {
          if (err) {
            res.statusCode = 200
            return res.json({
              respond: err,
              errors: true
            });
          }
          var query = db.query('SELECT * FROM hotel where country = (select t_i_c_country from travel_Itinerary_container where t_i_c_ID = ?);', cid, function(err, rows, fields) {
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

                  var selected_hotel = "";

                  for (var c = 0; c < first_rows.length; c++) {
                    if (first_rows[c].hotel_ID == rows[i].hotel_ID) {
                      selected_hotel = "checked disabled";

                      var item = {
                        name: rows[i].hotel_name,
                        lat: rows[i].hotel_lat,
                        long: rows[i].hotel_long

                      }
                      map_markers.push(item);
                    }
                  }

                  var jsonObject = {
                    id: rows[i].hotel_ID,
                    name: rows[i].hotel_name,
                    address: rows[i].hotel_address,
                    lat: rows[i].hotel_lat,
                    long: rows[i].hotel_long,
                    rating: rows[i].hotel_rating,
                    price: rows[i].hotel_price_per_night,
                    pax: rows[i].can_fit,
                    image: rows[i].hotel_img,
                    country: rows[i].country,
                    website: rows[i].hotel_website,
                    tel: rows[i].hotel_tel,
                    email: rows[i].hotel_email,
                    selected_hotel: selected_hotel
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

// Get all Location based on search
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

        db.query('SELECT * FROM t_i_c_hotel where t_i_c_ID = ?', [cid], function(err, first_rows, fields) {
          if (err) {
            res.statusCode = 200
            return res.json({
              respond: err,
              errors: true
            });
          }
          var query = db.query('SELECT * FROM hotel where country = (select t_i_c_country from travel_Itinerary_container where t_i_c_ID = ?) AND hotel_name like ? ', [cid, searchterm], function(err, rows, fields) {
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
                  var hotel_star = "";
                  var hotel_pax = "";
                  for (var z = 0; z < rows[i].hotel_rating; z++) {
                    hotel_star += "<i style='color:#28b8dc' class='fa fa-star'></i> ";
                  }
                  for (var x = 0; x < rows[i].can_fit; x++) {
                    hotel_pax += "<i  style='color:#28b8dc'  class='fas fa-male'></i> ";
                  }

                  var selected_hotel = "";

                  for (var c = 0; c < first_rows.length; c++) {
                    if (first_rows[c].hotel_ID == rows[i].hotel_ID) {
                      selected_hotel = "checked disabled";
                    }
                  }

                  var jsonObject = {
                    id: rows[i].hotel_ID,
                    name: rows[i].hotel_name,
                    address: rows[i].hotel_address,
                    lat: rows[i].hotel_lat,
                    long: rows[i].hotel_long,
                    rating: rows[i].hotel_rating,
                    price: rows[i].hotel_price_per_night,
                    pax: rows[i].can_fit,
                    image: rows[i].hotel_img,
                    country: rows[i].country,
                    website: rows[i].hotel_website,
                    tel: rows[i].hotel_tel,
                    email: rows[i].hotel_email,
                    hotel_star: hotel_star,
                    hotel_pax: hotel_pax,
                    selected_hotel: selected_hotel
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
        db.query('SELECT * FROM t_i_c_hotel tich inner join hotel h  where t_i_c_ID = ? and tich.hotel_ID = h.hotel_ID', [cid], function(err, rows, fields) {
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
                  id: rows[i].hotel_ID,
                  name: rows[i].hotel_name,
                  price: rows[i].hotel_price_per_night,
                  pax: rows[i].can_fit,
                  hotel_star: rows[i].hotel_rating,
                  hotel_pax: rows[i].can_fit,
                  tich: rows[i].t_i_c_h_ID
                }
                item_array.push(jsonObject);
              }

              var counter = 0;
              var count = [];
              for (var z = 0; z < item_array.length; z++) {
                db.query('select (b.count_two / a.count_one) * 100 as final_count from (select count(t_i_c_p_ID) as count_one from ' +
                  't_i_c_participant where t_i_c_ID = ?) a,(select count(hp.t_i_c_p_ID) as count_two from hotel_polling hp join t_i_c_participant ticp on ' +
                  'hp.t_i_c_p_ID = ticp.t_i_c_p_ID  where ticp.t_i_c_ID = ? and h_p_vote = 1 and hp.t_i_c_h_ID = ?) b', [cid, cid, item_array[z].tich],
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