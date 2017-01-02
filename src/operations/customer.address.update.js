const isoCountries = require('i18n-iso-countries');
/**
 * ## `customer.address.update` operation factory
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
      schema: require(base.config.get('schemas:updateAddress'))
    },
    handler: (msg, reply) => {
      const customerId = msg.customerId;
      const address = msg.address;
      const addressId = address.id;

      if (!isoCountries.alpha2ToNumeric(address.country)) {
        return reply(base.utils.genericResponse(null,
          base.utils.Error('address_contry_invalid', { address: address.country })));
      }

      base.db.models.Customer.findOneAndUpdate(
        {_id: customerId, addresses: {$elemMatch: {id: addressId}}},
        {$set: {'addresses.$': address}},
        {new: true}
      )
        .exec()
        .then(customer => {
          if (!customer) {
            throw base.utils.Error('customer_address_not_found', {customerId, addressId});
          }

          if (base.logger.isDebugEnabled()) base.logger.debug(`[customer] updated addresses for customer ${customerId}`);

          base.bus.publish(`${customersChannel}.CUSTOMER_ADDRESS_UPDATE`,
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