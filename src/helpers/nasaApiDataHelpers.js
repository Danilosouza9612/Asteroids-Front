import { format } from "date-fns";

export const parseEstimatedDiameter = data => ({
  min: Number.parseFloat(data.estimatedDiameter.meters.estimatedDiameterMin), 
  max: Number.parseFloat(data.estimatedDiameter.meters.estimatedDiameterMax)
});
export const formatEstimatedDiameter = data => `${Math.round(data.min)} m - ${Math.round(data.max)} m`;

export const formatIsHazardousAsteroid = data => data ? 'Yes' : 'No';

export const parseCloseApproachDateFromString = data => new Date(data.closeApproachData[0].epochDateCloseApproach);
export const formatCloseApproachDate = data => format(data, ' dd MMM yyyy hh:MM');

export const parseRelativeVelocity = data => Number.parseFloat(data.closeApproachData[0].relativeVelocity.kilometersPerHour);
export const formatRelativeVelocity = data => `${Math.round(data)} KPH`;

export const parseMissDistance = data => Number.parseFloat(data.closeApproachData[0].missDistance.kilometers);
export const formatMissDistance = data => `${Math.round(data)} KM`;

