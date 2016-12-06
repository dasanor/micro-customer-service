const bcrypt = require('bcrypt');

/**
 * ## `customer.checkCredentials` operation factory
 *
 * Check customer credentials operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const customersChannel = base.config.get('bus:channels:customers:name');
  const op = {
    validator: {
      schema: require(base.config.get('schemas:checkCredentials'))
    },
    handler: (msg, reply) => {
      const username = msg.username;

      base.db.models.Customer
        .findOne({ username })
        .exec()
        .then(customer => {
          if (!customer) throw base.utils.Error('bad_credentials', {username});

          return bcrypt.compare(msg.password, customer.password);
        })
        .then(result => {
          if(!result) throw base.utils.Error('bad_credentials', {username});

          return reply(base.utils.genericResponse());
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
