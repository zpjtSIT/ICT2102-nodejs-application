var express = require('express');
var router = express.Router();
var common = require('./common.js');
var db = require('./connection.js'); // db is pool
var request = require('request');


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
        if (req.body.country != null && req.body.country !== "" && req.body.departDate != null && req.body.departDate !== "" && req.body.returnDate != null && req.body.returnDate !== "" && req.body.adult != null && req.body.adult !== "" && req.body.children != null && req.body.children !== "") {
          var country = req.body.country;
          var departDate = req.body.departDate;
          var returnDate = req.body.returnDate;
          var adult = req.body.adult;
          var children = req.body.children;
          var destination;

          if (req.body.country == "bangkok") {
            destination = {
              "value": {
                "type": "airport",
                "city": "Bangkok",
                "airport": "Bangkok",
                "iata": "BKK",
                "code": "BKK",
                "country": "Thailand",
                "countryIata": "TH",
                "locationId": "airport_BKK"
              },
              "display": "Bangkok (BKK)"
            }
          } else if (req.body.country == "taiwan") {
            destination = {
              "value": {
                "type": "city",
                "city": "Taipei",
                "airport": "All Airports",
                "iata": "TPE",
                "code": "TPE",
                "country": "Taiwan",
                "countryIata": "TW",
                "locationId": "TW_city_TPE"
              },
              "display": "Taipei (TPE)"
            }
          }

          var result = {
            "tripType": "return",
            "isNewSession": false,
            "travellers": {
              "adults": adult,
              "children": children,
              "infants": 0
            },
            "moreOptions": {},
            "outboundFlightNumber": "",
            "inboundFlightNumber": "",
            "itineraries": [{
              "id": "d3790686-8b9a-4b5c-89ba-3a42d14e8c20",
              "departDate": departDate,
              "returnDate": returnDate,
              "origin": {
                "value": {
                  "type": "airport",
                  "city": "Singapore",
                  "airport": "Singapore",
                  "iata": "SIN",
                  "code": "SIN",
                  "country": "Singapore",
                  "countryIata": "SG",
                  "locationId": "airport_SIN"
                },
                "display": "Singapore (SIN)"
              },
              destination
            }],
            "locale": {
              "country": "GO",
              "currentLocale": "en",
              "locales": []
            }
          }
          request({
            headers: {
              'correlation_id': 'zz225a416e310391ba2899c68d2f3cf4'
            },
            uri: 'https://www.travelstart.com/webapi/search/?correlation_id=zz225a416e310391ba2899c68d2f3cf4',
            body: JSON.stringify(result),
            method: 'POST'
          }, function(err, status, body) {
            if (err) {
              res.statusCode = 200
              return res.json({
                respond: "API Server Error",
                errors: true
              });
            } else {
              var result = JSON.parse(body);

              var actual_result = result.response;

              var item = actual_result.airlineNames;

              var airlineimage = [];
              
             if(item != null && item !== ""){
               Object.keys(item).forEach(function(key) {
                var image = 'https://www.travelstart.com/assets/img/carriers/retina48px/carrier-' + key + '.png';
                var object = {
                  code: key,
                  image: image
                }
                airlineimage.push(object);
                  });
             }
             
              var return_result = {
                airlineNames: actual_result.airlineNames,
                locationName: actual_result.locationNames,
                airlineimage: airlineimage,
                itineraries: actual_result.itineraries,
              }
              res.statusCode = 200
              return res.json({
                respond: return_result,
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

router.get('/search/:airportcode', function(req, res) {
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
        var airportcode = req.params.airportcode;
        var return_result = {};
        request({
          uri: 'https://www.travelstart.com/servlet/ac.json/?n=12&q=' + airportcode,
          method: 'GET'
        }, function(err, status, body) {
          if (err) {
            res.statusCode = 200
            return res.json({
              respond: "API Server Error",
              errors: true
            });
          } else {
            var body_json = JSON.parse(body);
            for (var i = 0; i < body_json.length; i++) {
              if (body_json[i].iata == airportcode) {
                return_result = {
                  item: body_json[i]
                }
              }
            }
            res.statusCode = 200
            return res.json({
              respond: return_result,
              errors: false
            });
          }
        })
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
router.put('/', function(req, res) {
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
        if (req.body.airline_info != null && req.body.airline_info !== "" && req.body.airline_name !== null && req.body.airline_name !== "" && req.body.airline_location !== null && req.body.airline_location !== "") {

          var input = (req.body.airline_info);
          var name = (req.body.airline_name);
          var location = (req.body.airline_location);

          var query = db.query('INSERT INTO airlines SET airlines_json = ? , airlines_name = ? , airlines_location = ?', [input, name, location], function(err, result) {
            if (err) {
              console.log(err);
              res.statusCode = 200
              return res.json({
                respond: "Database ran into problem",
                errors: true
              });
            } else {
              if (result) {
                return res.json({
                  respond: result.insertId,
                  errors: false
                });
              } else {
                res.statusCode = 200
                return res.json({
                  respond: "Failed Adding into Flight",
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

// Get all Location
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

                var departure = flight_array_parse.odoList[0].segments[0].departureDateTime
                var arrival = flight_array_parse.odoList[0].segments[flight_go_count].arrivalDateTime

                var depart_array = departure.split("T");

                var depart_time = depart_array[1].slice(0, depart_array[1].length - 3);
                
                var date_depart = depart_array[0] + " " + depart_time;
                
                var arrival_array = arrival.split("T");

                var arrival_time = arrival_array[1].slice(0, arrival_array[1].length - 3);
                
                var date_arrival = arrival_array[0] + " " + arrival_time;
                
                var flight_ariline = JSON.parse(rows[i].airlines_name);

                var airline_company = "";

                var keys = Object.keys(flight_ariline);
                for (var f = 0; f < keys.length; f++) {
                  var key = keys[f];
                  if (key === flight_array_parse.odoList[0].segments[0].airlineCode) {
                    airline_company = flight_ariline[key];
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
                  arrival: date_arrival,
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

module.exports = router;