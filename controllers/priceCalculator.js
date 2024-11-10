const BASE_PRICE = 3.0; 
const PRICE_PER_KM = 1.5; 
const SURGE_MULTIPLIER_PEAK = 1.75; 
const SURGE_MULTIPLIER_OFF_PEAK = 1.0; 

function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = value => (value * Math.PI) / 180;
  const R = 6371; 
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

function isPeakHour() {
  const currentHour = new Date().getHours();
  return currentHour >= 7 && currentHour <= 9 || currentHour >= 17 && currentHour <= 19; 
}

exports.calculatePrice = async (req, res) => {
  const { pickupLat, pickupLng, dropoffLat, dropoffLng } = req.query;

  try {
    if (
      !pickupLat || isNaN(pickupLat) ||
      !pickupLng || isNaN(pickupLng) ||
      !dropoffLat || isNaN(dropoffLat) ||
      !dropoffLng || isNaN(dropoffLng)
    ) {
      return res.status(400).send('Invalid coordinates');
    }

    const rideDistance = calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
    const surgeMultiplier = isPeakHour() ? SURGE_MULTIPLIER_PEAK : SURGE_MULTIPLIER_OFF_PEAK;

    const price = BASE_PRICE + (rideDistance * PRICE_PER_KM * surgeMultiplier);

    res.status(200).json({
      rideDistance: rideDistance.toFixed(2),
      price: price.toFixed(2),
      surgeMultiplier,
      isPeakHour: surgeMultiplier > 1
    });
  } catch (error) {
    res.status(500).send('Error calculating price');
  }
};
