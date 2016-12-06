/**
 * ## `customer.remove` operation factory
 *
 * Remove customer operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const customersChannel = base.config.get('bus:channels:customers:name');

  const op = {
    validator: {
      schema: require(base.config.get('schemas:removeCustomer'))
    },
    handler: (msg, reply) => {
      const id = msg.id;

      base.db.models.Customer
        .findOne({ _id: id })
        .exec()
        .then(customer => {
          if (!customer) throw base.utils.Error('customer_not_found', {id});

          return customer.remove();
        })
        .then(customer => {
          if (base.logger.isDebugEnabled()) base.logger.debug(`[customer] customer ${id} removed`);

          base.bus.publish(`${customersChannel}.REMOVE`,
            {
              data: id
            }
          );

          return reply(base.utils.genericResponse());
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
