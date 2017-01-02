/**
 * ## `customer.info` operation factory
 *
 * Customer info operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
module.exports = (base) => {
  return {
    validator: {
      schema: require(base.config.get('schemas:infoCustomer'))
    },
    handler: (msg, reply) => {
      const id = msg.id;

      base.db.models.Customer
        .findOne({ _id: id })
        .exec()
        .then(customer => {
          if (!customer) throw base.utils.Error('customer_not_found', {id});

          return reply(base.utils.genericResponse({ customer: customer.toClient() }));
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  }
}
