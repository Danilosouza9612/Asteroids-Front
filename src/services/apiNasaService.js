import axios from "axios";

const nasaApi = axios.create({
  baseURL: 'http://api.nasa.gov/'
})

const nasaApiKey = "ZHLZTzVXheNTrupxCJ332pioB0wLeZK4wgOZJGJW";

export function feed({startDate, endDate=null}){
  console.log("***START DATE***");
  console.log(startDate);
  let startDateString = `${startDate.getFullYear()}-${startDate.getMonth()+1}-${startDate.getDate()}`;
  let endDateString =  !!endDate ? `${endDate.getFullYear()}-${endDate.getMonth()+1}-${endDate.getDate()}` : '' ;
  return nasaApi.get(`/neo/rest/v1/feed?start_date=${startDateString}&end_date=${endDateString}&api_key=${nasaApiKey}`);
}