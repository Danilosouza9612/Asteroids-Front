import { format } from "date-fns";
import { defineStore } from "pinia";
import { toCamel } from "snake-camel";
import { feed } from "src/services/apiNasaService";
import { useAsteroidsStore } from "./asteroidsListStore";
import * as nasaApiDataHelpers from 'src/helpers/nasaApiDataHelpers';

export const useCreateAsteroidsModalStore = defineStore('createAsteroidsModalStore', {
  state: () =>({
    idToExport: null,
    loading: false,
    show: false,
    fetchedItems: [],
    selected: [],
    startDate: null,
    endDate: null
  }),

  getters: {
    getShow: (state) => state.show,
    getStartDate: (state) => !!state.startDate ? format(state.startDate, 'yyyy/MM/dd') : null,
    getEndDate: (state) => !!state.endDate ? format(state.endDate, 'yyyy/MM/dd') : null,
    getFetchedItems: (state) => state.fetchedItems,
    getSelected: (state) => state.selected
  },

  actions: {
    initExport(id){
      this.show = true;
      this.idToExport = id;
    },
    export(){
      let dataToExport = this.selected;
      useAsteroidsStore().fillData(this.idToExport, {
        title: this.selected.name,
        description: `Absolute Magnitude: ${dataToExport.absoluteMagnitudeH}\n`+
          `Estimated Diameter: ${nasaApiDataHelpers.formatEstimatedDiameter(nasaApiDataHelpers.parseEstimatedDiameter(dataToExport))}\n` +
          `Is potentially hazardous?: ${nasaApiDataHelpers.formatIsHazardousAsteroid(dataToExport)}\n`+
          `Close Approach Date: ${nasaApiDataHelpers.formatCloseApproachDate(nasaApiDataHelpers.parseCloseApproachDateFromString(dataToExport))}\n`+
          `Relative velocity: ${nasaApiDataHelpers.formatRelativeVelocity(nasaApiDataHelpers.parseRelativeVelocity(dataToExport)) }\n`+
          `Miss Distance: ${nasaApiDataHelpers.formatMissDistance(nasaApiDataHelpers.parseMissDistance(dataToExport))}`
      });
    },
    hideModal(){
      this.show = false;
    },
    setStartDate(startDate){
      this.startDate = new Date(startDate);
    },
    setEndDate(endDate){
      this.endDate = new Date(endDate);
    },
    setSelected(selected){
      this.selected = selected;
    },
    async fetchData(){
      this.loading=true;
      let data = toCamel((await feed({startDate: this.startDate, endDate: this.endDate})).data);
      this.fetchedItems = Object.entries(data.nearEarthObjects).flatMap(([_, value]) => value);
      this.loading=false;
    }
  },
});