const { v4: uuidv4 } = require('uuid');
const {
  validateFullName,
  validateMobile,
  normalizeMobile,
  validatePAN,
  validateUUID,
} = require('../utils/validations');
const {
  managerIsActive,
  createUser,
  getUsers,
  deleteUser,
  updateUser,
  updateManagerForUser,
} = require('../services/userService');
const { logInfo, logError } = require('../utils/logger');

async function createUserHandler(req, res) {
  try {
    const { full_name, mob_num, pan_num, manager_id } = req.body;
    if (!full_name || !mob_num || !pan_num || !manager_id) {
      return res.status(400).json({ error: 'Missing required keys' });
    }
    if (!validateFullName(full_name)) {
      return res.status(400).json({ error: 'Invalid full_name' });
    }
    if (!validateMobile(mob_num)) {
      return res.status(400).json({ error: 'Invalid mob_num' });
    }
    if (!validatePAN(pan_num)) {
      return res.status(400).json({ error: 'Invalid pan_num' });
    }
    if (!validateUUID(manager_id)) {
      return res.status(400).json({ error: 'Invalid manager_id' });
    }
    const managerActive = await managerIsActive(manager_id);
    if (!managerActive) {
      return res.status(400).json({ error: 'Manager not active or does not exist' });
    }

    const user_id = uuidv4();
    const user = {
      user_id,
      full_name,
      mob_num: normalizeMobile(mob_num),
      pan_num: pan_num.toUpperCase(),
      manager_id,
    };

    await createUser(user);

    logInfo(`User created with ID: ${user_id}`);
    res.json({ success: true, message: 'User created successfully' });
  } catch (err) {
    logError(`createUserHandler error: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getUsersHandler(req, res) {
  try {
    const { user_id, mob_num, manager_id } = req.body || {};

    if (
      user_id && !validateUUID(user_id)
      || mob_num && !validateMobile(mob_num)
      || manager_id && !validateUUID(manager_id)
    ) {
      return res.status(400).json({ error: 'Invalid filter parameters' });
    }

    const filters = {};
    if (user_id) filters.user_id = user_id;
    if (mob_num) filters.mob_num = normalizeMobile(mob_num);
    if (manager_id) filters.manager_id = manager_id;

    const users = await getUsers(filters);
    res.json({ users });
  } catch (err) {
    logError(`getUsersHandler error: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function deleteUserHandler(req, res) {
  try {
    const { user_id, mob_num } = req.body;

    if (!user_id && !mob_num) {
      return res.status(400).json({ error: 'Provide user_id or mob_num for deletion' });
    }

    if (user_id && !validateUUID(user_id)) {
      return res.status(400).json({ error: 'Invalid user_id' });
    }
    if (mob_num && !validateMobile(mob_num)) {
      return res.status(400).json({ error: 'Invalid mob_num' });
    }

    const filters = {};
    if (user_id) filters.user_id = user_id;
    else if (mob_num) filters.mob_num = normalizeMobile(mob_num);

    await deleteUser(filters);

    logInfo(`User deleted: ${user_id || mob_num}`);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    logError(`deleteUserHandler error: ${err.message}`);
    res.status(404).json({ error: err.message });
  }
}

async function updateUserHandler(req, res) {
  try {
    const { user_ids, update_data } = req.body;

    if (!Array.isArray(user_ids) || user_ids.length === 0 || typeof update_data !== 'object') {
      return res.status(400).json({ error: 'Missing or invalid user_ids or update_data' });
    }

    // Validate user_ids
    for (const id of user_ids) {
      if (!validateUUID(id)) {
        return res.status(400).json({ error: `Invalid user_id: ${id}` });
      }
    }

    // Validate update_data fields if present
    if (update_data.full_name && !validateFullName(update_data.full_name)) {
      return res.status(400).json({ error: 'Invalid full_name' });
    }
    if (update_data.mob_num && !validateMobile(update_data.mob_num)) {
      return res.status(400).json({ error: 'Invalid mob_num' });
    }
    if (update_data.pan_num && !validatePAN(update_data.pan_num)) {
      return res.status(400).json({ error: 'Invalid pan_num' });
    }
    if (update_data.manager_id && !validateUUID(update_data.manager_id)) {
      return res.status(400).json({ error: 'Invalid manager_id' });
    }

    // If manager_id is provided, check manager is active
    if (update_data.manager_id) {
      const managerActive = await managerIsActive(update_data.manager_id);
      if (!managerActive) {
        return res.status(400).json({ error: 'Manager not active or does not exist' });
      }
    }

    // If only manager_id in update_data and multiple user_ids -> bulk update
    const keys = Object.keys(update_data);
    if (keys.length === 1 && keys[0] === 'manager_id') {
      for (const id of user_ids) {
        // Update manager_id: deactivate old, insert new
        await updateManagerForUser(id, update_data.manager_id);
      }
    } else {
      // For other updates, update each user individually
      for (const id of user_ids) {
        const dataToUpdate = {};
        if (update_data.full_name) dataToUpdate.full_name = update_data.full_name;
        if (update_data.mob_num) dataToUpdate.mob_num = normalizeMobile(update_data.mob_num);
        if (update_data.pan_num) dataToUpdate.pan_num = update_data.pan_num.toUpperCase();

        // If manager_id is part of update_data, skip here (handle separately to avoid duplication)
        if (update_data.manager_id) {
          return res.status(400).json({
            error:
              'Updating manager_id along with other fields for multiple users is not supported. Update manager_id separately.',
          });
        }

        if (Object.keys(dataToUpdate).length > 0) {
          await updateUser(id, dataToUpdate);
        }
      }
    }

    logInfo(`Users updated: ${user_ids.join(', ')}`);
    res.json({ success: true, message: 'Users updated successfully' });
  } catch (err) {
    logError(`updateUserHandler error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createUserHandler,
  getUsersHandler,
  deleteUserHandler,
  updateUserHandler,
};
