import {
  farePrice,
  distancePrice,
  levelPrice,
  HelperPrice,
  walkingDistancePrice,
  productCoefficient,
  quotePrice,
  checkMinimumPrice
} from "./quote-functions";

import { getCoefficients } from "../coefficients/coefficients-get-function";

function maxNumberOfHelper(data) {
  let helperNumberList = [];
  for (let i = 0; i < data.length - 1; i++) {
    helperNumberList[i] = data[i].numberOfHelpers;
  }
  return Math.max(...helperNumberList);
}
async function handler(req, res) {
  let detailedPrice = {};
  let totalDistancePrice = 0;
  let totalProductPrice = 0;
  let totalHelperPrice = 0;
  let totalLevelPrice = [];
  let totalWalkingDistancePrice = [];
  let addressLevelPrice = 0;
  let totalProductLoadingPrice = 0;
  let totalProductUnloadingPrice = 0;
  let walkingDistanceAdrPrice = 0;

  if (req.method === "POST") {
    const data = req.body;
    const coefficients = {
      cubicMeterCoefficient: await getCoefficients("priceOfCubicMeter"),
      elevatorCoefficient: await getCoefficients("priceOfElevator"),
      levelCoefficient: await getCoefficients("priceOfLevel"),
      productCoefficient: await getCoefficients("priceOfProduct"),
      distanceCoefficient: await getCoefficients("priceOfDistance"),
      helperCoefficient: await getCoefficients("priceOfHelper"),
      fareCoefficient: await getCoefficients("priceOfFare"),
      walkingDistance: await getCoefficients("priceOfWalk"),
      minimumPrice: await getCoefficients("priceOfPriceFloor")
    };

    // price computation not specific to the addresses
    // computing distance price, product coefficient,

    totalDistancePrice = distancePrice(
      data.distanceTime.totalDistance,
      coefficients.distanceCoefficient.priceOfDistance
    );

    totalProductLoadingPrice = productCoefficient(
      data.items.totalAssembledVolume,
      coefficients.productCoefficient.priceOfLoading
    );

    totalProductUnloadingPrice = productCoefficient(
      data.items.totalAssembledVolume,
      coefficients.productCoefficient.priceOfUnloading
    );

    totalProductPrice = totalProductLoadingPrice + totalProductUnloadingPrice;

    // price computation not specific to the addresses
    // computing the average wage for helpers
    totalHelperPrice = HelperPrice(
      data.distanceTime.totalDrivingDuration +
        data.items.totalAssemblyTime +
        data.items.totalDisassemblyTime,
      coefficients.helperCoefficient.priceOfHelper,
      maxNumberOfHelper(data.addresses)
    );

    // price computation specific to the addresses
    // computing level price, walking distance price
    
    for (let i = 0; i < data.addresses.length - 1; i++) {
      if (!data.addresses[i].elevator) {
        addressLevelPrice = levelPrice(
          data.items.totalAssembledVolume,
          coefficients.cubicMeterCoefficient.priceOfCubicMeter,
          Math.abs(data.addresses[i].numberOfFloors),
          coefficients.levelCoefficient.priceOfLevelRate
        );
        totalLevelPrice[i] = addressLevelPrice;
      } else {
        addressLevelPrice = levelPrice(
          data.items.totalAssembledVolume,
          coefficients.cubicMeterCoefficient.priceOfCubicMeter,
          Math.abs(data.addresses[i].numberOfFloors),
          coefficients.elevatorCoefficient.priceOfElevator
        );
        totalLevelPrice[i] = addressLevelPrice;
      }
      walkingDistanceAdrPrice = walkingDistancePrice(
        coefficients.walkingDistance.priceOfWalk,
        data.addresses[i].walkingDistance,
        data.items.totalAssembledVolume
      );
      totalWalkingDistancePrice[i] = walkingDistanceAdrPrice;
    }

    ///// ///// ///// /// all set to zero if not NaN // Null / undefined

    detailedPrice.totalDistancePrice = totalDistancePrice ? totalDistancePrice : 0;
    detailedPrice.totalProductPrice = totalProductPrice ? totalProductPrice : 0;
    detailedPrice.totalHelperPrice = totalHelperPrice ? totalHelperPrice : 0;
    detailedPrice.totalLevelPrice = totalLevelPrice.reduce((a, b) => a + b, 0) ? totalLevelPrice.reduce((a, b) => a + b, 0) : 0;
    detailedPrice.totalWalkingDistancePrice = totalWalkingDistancePrice.reduce(
      (a, b) => a + b,
      0
    ) ? totalWalkingDistancePrice.reduce(
      (a, b) => a + b,
      0
    ) : 0;
    detailedPrice.addressLevelPrice = addressLevelPrice ? addressLevelPrice : 0;
    detailedPrice.totalProductLoadingPrice = totalProductLoadingPrice ? totalProductLoadingPrice : 0;
    detailedPrice.totalProductUnloadingPrice = totalProductUnloadingPrice ? totalProductUnloadingPrice : 0;

    /// ///// ///// /////
    const TWDP = totalWalkingDistancePrice.reduce((a, b) => a + b, 0) ? totalWalkingDistancePrice.reduce((a, b) => a + b, 0) : 0;
    const TLP =  totalLevelPrice.reduce((a, b) => a + b, 0) ?  totalLevelPrice.reduce((a, b) => a + b, 0) : 0 ;
    const TDP = totalDistancePrice ? totalDistancePrice : 0 ;
    const TPP = totalProductPrice ? totalProductPrice : 0; 

    // price of the quote
    let totalQuotePrice = quotePrice(
     TWDP,
     TLP,
     TDP,
     TPP
    );
    // Check whether or not the quote is below the minimum price
    // true: the quote price is set to the minimum price
    // false: the quote price is set to the quote price
    totalQuotePrice = checkMinimumPrice(
    totalQuotePrice,
      coefficients.minimumPrice.priceOfPriceFloor
    );

    let totalFarePrice = farePrice(
      totalQuotePrice,
      coefficients.fareCoefficient.priceOfFare
    );
    
    res.status(200).json({
      coefficients: coefficients,
      quotePrice: totalQuotePrice.toFixed(2),
      farePrice: totalFarePrice.toFixed(2),
      detailedPrice: detailedPrice
    });
  }
}

export default handler;
