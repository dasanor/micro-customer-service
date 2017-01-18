/**
 * ## `customer.address.remove` operation factory
 *
 * Remove customer address operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
module.exports = (base) => {
  const customersChannel = base.config.get('bus:channels:customers:name');

  return {
    validator: {
      schema: base.utils.loadModule('schemas:removeAddress')
    },
    handler: (msg, reply) => {
      const customerId = msg.customerId;
      const addressId = msg.addressId;

      base.db.models.Customer.findOneAndUpdate(
        {_id: customerId},
        {$pull: {addresses: {id: addressId}}},
        {new: true}
      )
        .exec()
        .then(customer => {
          if (!customer) {
            throw base.utils.Error('customer_address_not_found', {customerId, addressId});
          }

          if (base.logger.isDebugEnabled()) base.logger.debug(`[customer] address ${addressId} removed for customer ${customerId}`);

          base.bus.publish(`${customersChannel}.CUSTOMER_ADDRESS_REMOVE`,
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