/**
 * ## `customer.address.info` operation factory
 *
 * Get a customer address operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
module.exports = (base) => {
  const customersChannel = base.config.get('bus:channels:customers:name');

  return {
    validator: {
      schema: require(base.config.get('schemas:infoAddress'))
    },
    handler: (msg, reply) => {
      const customerId = msg.customerId;
      const addressId = msg.addressId;

      base.db.models.Customer
        .findOne({_id: customerId}, {addresses: {$elemMatch: {id: addressId}}})
        .exec()
        .then(customer => {
          if (!customer) {
            throw base.utils.Error('customer_not_found', {customerId});
          }
          if (!customer.addresses || customer.addresses.length == 0) {
            throw base.utils.Error('address_not_found', {customerId, addressId});
          }

          return reply(base.utils.genericResponse({address: customer.addresses[0]}));
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  }
}
