import axios from "axios";
import { boot } from "quasar/wrappers";

const api = axios.create({ baseURL: 'http://asteroids-api-485748506.us-east-1.elb.amazonaws.com:3000'})

export default boot(({app}) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
})

export { api }