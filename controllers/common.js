exports.checksession = function(db, token, callback) {
  // clean it and return

  var paremeters1 = {
    s_l_session_token: token
  };
  var secure_login_id = 0;
  db.query('SELECT s_l_ID from secure_login where ?', [paremeters1], function(err, rows, fields) {
    if (err) {
      callback(false);
    } else {
      if (rows.length) {
        callback(true);
      } else {
        callback(false);
      }
    }
  });
}

exports.getuserid = function(db, token, callback) {
  // clean it and return
  var studentid = 0;
  var paremeters1 = {
    s_l_session_token: token
  };
  db.query('SELECT s_l_ID from secure_login where ?', [paremeters1], function(err, rows, fields) {
    if (err) {
      callback(0);
    } else {
      if (rows.length) {
        studentid = rows[0].s_l_ID;
        callback(studentid);
      } else {
        callback(0);
      }
    }
  });
}

exports.getstudentemailbasedontoken = function(db, token, callback) {
  // clean it and return
  var studentemail = "";
  db.query('SELECT s_l_email from secure_login where s_l_session_token = ?', [token], function(err, rows, fields) {
    if (err) {
      callback(studentemail);
    } else {
      if (rows.length) {
        studentemail = rows[0].s_l_email;
        callback(studentemail);
      } else {
        callback(studentemail);
      }
    }
  });
}

exports.getstudentidbasedonemail = function(db, email, callback) {
  // clean it and return
  var studentid = 0;
  db.query('SELECT s_l_ID from secure_login where s_l_email = ?', [email], function(err, rows, fields) {
    if (err) {
      callback(0);
    } else {
      if (rows.length) {
        studentid = rows[0].s_l_ID;
        callback(studentid);
      } else {
        callback(0);
      }
    }
  });
}

exports.getpostivecount = function(db, cid, item_array, callback) {
  var count = [];
  for (var z = 0; z < item_array.length; z++) {
    db.query('select (b.count_two / a.count_one) * 100 as final_count from (select count(t_i_c_p_ID) as count_one from ' +
      't_i_c_participant where t_i_c_ID = 29) a,(select count(hp.t_i_c_p_ID) as count_two from hotel_polling hp join t_i_c_participant ticp on ' +
      'hp.t_i_c_p_ID = ticp.t_i_c_p_ID  where ticp.t_i_c_ID = 29 and h_p_vote = 1 and hp.t_i_c_h_ID = 10) b', [cid, cid, item_array[z].t_i_c_h_ID],
      function(err, row_result, fields) {
        if (row_result.length) {
          count.push(row_result[0].final_count);
        }
      
      });
  }
  return count;
}