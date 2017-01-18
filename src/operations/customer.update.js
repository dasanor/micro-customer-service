const isemail = require('isemail');

/**
 * ## `customer.update` operation factory
 *
 * Update Customer operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
module.exports = (base) => {
  const customersChannel = base.config.get('bus:channels:customers:name');

  return {
    validator: {
      schema: base.utils.loadModule('schemas:updateCustomer')
    },
    handler: (msg, reply) => {
      const id = msg.id;

      base.db.models.Customer
        .findOne({_id: id})
        .exec()
        .then(customer => {
          if (!customer) throw base.utils.Error('customer_not_found', {id});

          customer.firstName = msg.firstName || customer.firstName;
          customer.lastName = msg.lastName || customer.lastName;
          customer.tags = msg.tags || customer.tags;
          customer.status = msg.status || customer.status;

          const email = msg.email;
          if (email) {
            if (!isemail.validate(email)) {
              throw base.utils.Error('customer_invalid_email', {email});
            } else {
              customer.email = email;
            }
          }

          return customer.save();
        })
        .then(savedCustomer => {
          if (base.logger.isDebugEnabled()) base.logger.debug(`[customer] customer ${savedCustomer._id} updated`);

          base.bus.publish(`${customersChannel}.UPDATE`,
            {
              new: savedCustomer.toObject({virtuals: true}),
              data: msg
            }
          );

          return reply(base.utils.genericResponse({customer: savedCustomer.toClient()}));
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  }
}
