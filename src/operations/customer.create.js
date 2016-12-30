const bcrypt = require('bcrypt');
const isemail = require('isemail');
const isoCountries = require('i18n-iso-countries');
const shortId = require('shortId');

/**
 * ## `customer.create` operation factory
 *
 * Create Customer operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const customersChannel = base.config.get('bus:channels:customers:name');
  const bcryptSalt = base.config.get('bcryptSalt');

  const op = {
    validator: {
      schema: require(base.config.get('schemas:createCustomer'))
    },
    handler: (msg, reply) => {
      bcrypt.hash(msg.password, bcryptSalt)
        .then(encryptedPassword => {
          const email = msg.email;
          if (!isemail.validate(email)) throw base.utils.Error('customer_invalid_email', {email});

          if (msg.addresses) {
            msg.addresses.forEach(address => {
              if (!isoCountries.alpha2ToNumeric(address.country)) {
                  throw base.utils.Error('address_contry_invalid', { address: address.country });
              }else {
                address.id = shortId.generate()
              }
            });
          }

          const customer = new base.db.models.Customer({
            email: msg.email,
            password: encryptedPassword,
            firstName: msg.firstName,
            lastName: msg.lastName,
            addresses: msg.addresses,
            tags: msg.tags,
            status: msg.status
          });

          return customer.save();
        })
        .then(savedCustomer => {
          if (base.logger.isDebugEnabled()) base.logger.debug(`[customer] customer ${savedCustomer._id} created`);

          base.bus.publish(`${customersChannel}.CREATE`,
            {
              new: savedCustomer.toObject({virtuals: true}),
              data: msg
            }
          );

          return reply(base.utils.genericResponse({customer: savedCustomer.toClient()}));
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
