export const HelperPrice = (totalHours, helperPrice, numberOfHelpers) => {
  return (totalHours / 60) * helperPrice * numberOfHelpers;
};

export const farePrice = (quotePrice, farePriceRate) => {
  return quotePrice * farePriceRate;
};

export const walkingDistancePrice = (
  walkingMeterDistancePrice,
  totalWalkingDistance,
  totalCubicMeter
) => {
  return totalWalkingDistance * walkingMeterDistancePrice * totalCubicMeter;
};

export const levelPrice = (
  totalCubicMeter,
  cubicMeterPrice,
  numberOfLevels,
  levelCompoundRate
) => {
  return (
    totalCubicMeter *
    cubicMeterPrice *
    Math.pow(1 + levelCompoundRate / 1, numberOfLevels) *
    numberOfLevels
  );
};

export const productCoefficient = (
  totalCubicMeter,
  productLoadingUnloadingRate
) => {
  return totalCubicMeter * productLoadingUnloadingRate;
};

export const distancePrice = (totalDistanceKm, distanceKmPrice) => {
  return totalDistanceKm * distanceKmPrice;
};

export const quotePrice = (
  walkingDistancePrice,
  levelPrice,
  distancePrice,
  productPrice
) => {
  return (
    walkingDistancePrice +
    levelPrice +
    distancePrice +
  productPrice
  );
};

export const checkMinimumPrice = (totalQuotePrice, minimumPrice) => {
  if ( Number(totalQuotePrice) <  Number(minimumPrice)) {
    return  Number(minimumPrice);
  } else {
    return  Number(totalQuotePrice);
  }
};
