/**
 * ## `customer.list` operation factory
 *
 * Customer list operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
module.exports = (base) => {
  const equalExpression = value => value;
  const inExpression = value => ({
    $in: value.split(',')
  });
  const likeExpression = value => ({
    $regex: new RegExp(value, 'i')
  });
  const filterExpressions = {
    id: inExpression,
    email: inExpression,
    status: inExpression,
    tags: inExpression
  };

  const selectableFields = base.db.models.Customer.selectableFields;
  const defaultFields = selectableFields.join(' ');
  const allowedProperties = Object.keys(filterExpressions);
  const defaultLimit = 10;
  const maxLimit = 100;

  return {
    handler: (params, reply) => {
      // Filters
      const filters = allowedProperties
        .filter(k => params.hasOwnProperty(k))
        .reduce((result, k) => {
          const field = k === 'id' ? '_id' : k;
          result[field] = filterExpressions[k](params[k]);
          return result;
        }, {});

      // Pagination
      let limit = +params.limit || defaultLimit;
      if (limit > maxLimit) limit = maxLimit;
      const skip = +params.skip || 0;

      // Fields
      let fields;
      if (params.fields) {
        fields = params.fields.split(',')
          .filter(f => {
            if (f.substr(0, 1) === '-') return selectableFields.indexOf(f.substring(1)) !== -1;
            return selectableFields.indexOf(f) !== -1;
          })
          .join(' ');
      } else {
        fields = defaultFields;
      }

      // Query
      const query = base.db.models.Customer
        .find(filters, fields)
        //.populate('variants')
        .skip(skip)
        .limit(limit);

      // Exec the query
      query.exec()
        .then(customers => {
          return reply(base.utils.genericResponse({
            page: { limit, skip },
            data: customers.map(customers => customers.toClient())
          }));
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  }
}
