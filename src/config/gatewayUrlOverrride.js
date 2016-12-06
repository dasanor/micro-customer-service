function gatewayUrlOverrride(/* base */) {
  const urls = {};
  return (serviceName /* , serviceVersion, operationName */) => urls[serviceName];
}

module.exports = gatewayUrlOverrride;
