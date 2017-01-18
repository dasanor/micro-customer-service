const bcrypt = require('bcrypt');

/**
 * ## `customer.checkCredentials` operation factory
 *
 * Check customer credentials operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
module.exports = (base) => {
  return {
    validator: {
      schema: base.utils.loadModule('schemas:checkCredentials')
    },
    handler: (msg, reply) => {
      const email = msg.email;

      base.db.models.Customer
        .findOne({ email })
        .exec()
        .then(customer => {
          if (!customer) throw base.utils.Error('bad_credentials', {email});

          return bcrypt.compare(msg.password, customer.password);
        })
        .then(result => {
          if(!result) throw base.utils.Error('bad_credentials', {email});

          return reply(base.utils.genericResponse());
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  }
}