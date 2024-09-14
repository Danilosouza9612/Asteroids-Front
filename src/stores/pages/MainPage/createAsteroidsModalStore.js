import { format } from "date-fns";
import { defineStore } from "pinia";
import { toCamel } from "snake-camel";
import { feed } from "src/services/apiNasaService";

export const useCreateAsteroidsModalStore = defineStore('createAsteroidsModalStore', {
  state: () =>({
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
    showModal(){
      this.show = true;
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