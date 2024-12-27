const TRACKING_STATUS = Object.freeze({
  PREPARING_PACKAGE: 1,
  PACKAGE_SHIPPED: 2,
  PACKAGE_EN_ROUTE: 3
});

const TrackingStatusDescriptions = Object.freeze({
  [TRACKING_STATUS.PREPARING_PACKAGE]: 'Preparing package.',
  [TRACKING_STATUS.PACKAGE_SHIPPED]: 'Package shipped for transport.',
  [TRACKING_STATUS.PACKAGE_EN_ROUTE]: 'Package on the way.'
});

module.exports = { TRACKING_STATUS, TrackingStatusDescriptions };
