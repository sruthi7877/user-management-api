const db = require('../config/db');
const { logError } = require('../utils/logger');

function managerIsActive(manager_id) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT is_active FROM managers WHERE manager_id = ?';
    db.get(query, [manager_id], (err, row) => {
      if (err) {
        logError(`DB Error in managerIsActive: ${err.message}`);
        reject(err);
      } else {
        resolve(row ? row.is_active === 1 : false);
      }
    });
  });
}

function createUser(user) {
  return new Promise((resolve, reject) => {
    const { user_id, full_name, mob_num, pan_num, manager_id } = user;
    const query = `INSERT INTO users (user_id, full_name, mob_num, pan_num, manager_id, is_active)
                   VALUES (?, ?, ?, ?, ?, 1)`;
    db.run(query, [user_id, full_name, mob_num, pan_num, manager_id], function (err) {
      if (err) {
        logError(`DB Error in createUser: ${err.message}`);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function getUsers(filters) {
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM users WHERE is_active = 1';
    let params = [];

    if (filters.user_id) {
      query += ' AND user_id = ?';
      params.push(filters.user_id);
    }
    if (filters.mob_num) {
      query += ' AND mob_num = ?';
      params.push(filters.mob_num);
    }
    if (filters.manager_id) {
      query += ' AND manager_id = ?';
      params.push(filters.manager_id);
    }

    db.all(query, params, (err, rows) => {
      if (err) {
        logError(`DB Error in getUsers: ${err.message}`);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function deleteUser(filters) {
  return new Promise((resolve, reject) => {
    let query = 'DELETE FROM users WHERE ';
    let params = [];

    if (filters.user_id) {
      query += 'user_id = ?';
      params.push(filters.user_id);
    } else if (filters.mob_num) {
      query += 'mob_num = ?';
      params.push(filters.mob_num);
    } else {
      return reject(new Error('No user_id or mob_num provided'));
    }

    db.run(query, params, function (err) {
      if (err) {
        logError(`DB Error in deleteUser: ${err.message}`);
        reject(err);
      } else {
        if (this.changes === 0) {
          reject(new Error('User not found'));
        } else {
          resolve();
        }
      }
    });
  });
}

function updateUser(user_id, data) {
  return new Promise((resolve, reject) => {
    const fields = [];
    const params = [];

    for (const key of ['full_name', 'mob_num', 'pan_num', 'manager_id']) {
      if (data[key]) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }
    if (fields.length === 0) {
      return reject(new Error('No update data provided'));
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    const query = `UPDATE users SET ${fields.join(', ')} WHERE user_id = ? AND is_active = 1`;
    params.push(user_id);

    db.run(query, params, function (err) {
      if (err) {
        logError(`DB Error in updateUser: ${err.message}`);
        reject(err);
      } else {
        if (this.changes === 0) {
          reject(new Error('User not found or inactive'));
        } else {
          resolve();
        }
      }
    });
  });
}

// Special update for manager_id: deactivate old and insert new record
function updateManagerForUser(user_id, new_manager_id) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Deactivate old record
      const deactivateQuery = `UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND is_active = 1`;
      db.run(deactivateQuery, [user_id], function (err) {
        if (err) {
          logError(`DB Error in deactivate old user record: ${err.message}`);
          return reject(err);
        }
        if (this.changes === 0) {
          return reject(new Error('User not found or already inactive'));
        }

        // Get old user data
        const selectOld = `SELECT full_name, mob_num, pan_num FROM users WHERE user_id = ?`;
        db.get(selectOld, [user_id], (err2, row) => {
          if (err2 || !row) {
            logError(`DB Error in selecting old user data: ${err2 ? err2.message : 'No data found'}`);
            return reject(err2 || new Error('Old user data not found'));
          }

          const { full_name, mob_num, pan_num } = row;
          const { v4: uuidv4 } = require('uuid');
          const new_user_id = uuidv4();

          // Insert new record with updated manager_id
          const insertQuery = `INSERT INTO users (user_id, full_name, mob_num, pan_num, manager_id, is_active)
                               VALUES (?, ?, ?, ?, ?, 1)`;
          db.run(insertQuery, [new_user_id, full_name, mob_num, pan_num, new_manager_id], function (err3) {
            if (err3) {
              logError(`DB Error inserting new user record: ${err3.message}`);
              return reject(err3);
            }
            resolve();
          });
        });
      });
    });
  });
}

module.exports = {
  managerIsActive,
  createUser,
  getUsers,
  deleteUser,
  updateUser,
  updateManagerForUser,
};
