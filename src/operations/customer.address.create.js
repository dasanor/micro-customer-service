const isoCountries = require('i18n-iso-countries');

/**
 * ## `customer.address.create` operation factory
 *
 * Create customer address operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
module.exports = (base) => {
  const customersChannel = base.config.get('bus:channels:customers:name');

  return {
    validator: {
      schema: base.utils.loadModule('schemas:createAddress')
    },
    handler: (msg, reply) => {
      const customerId = msg.customerId;
      const addresses = msg.addresses;

      for(const address of addresses){
        if (!isoCountries.alpha2ToNumeric(address.country)) {
          return reply(base.utils.genericResponse(null,
            base.utils.Error('address_contry_invalid', { address: address.country })));
        }
      }

      base.db.models.Customer.findOneAndUpdate(
        {_id: customerId},
        {$addToSet: {addresses: {$each: addresses}}},
        {new: true}
      )
        .exec()
        .then(customer => {
          if (!customer) throw base.utils.Error('customer_not_found', {customerId});

          if (base.logger.isDebugEnabled()) base.logger.debug(`[customer] added new addresses for customer ${customerId}`);

          base.bus.publish(`${customersChannel}.CUSTOMER_ADDRESS_CREATE`,
            {
              customer: customer.toObject({virtuals: true}),
              data: msg
            }
          );

          return reply(base.utils.genericResponse({customer: customer.toClient()}));
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  }
}