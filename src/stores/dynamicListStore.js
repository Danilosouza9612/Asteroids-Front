import { date } from 'quasar';
import { toCamel } from 'snake-camel';
import { ApiCrudService } from 'src/services/apiCrudService';

export const dynamicListStore = {
  state: () => ({
    newDataModel: {},
    dataRequestPermit: data => data,
    items: [],
    total: 0,
    totalFiltered: 0,
    dataId: 0,
    loading: false,
    fetchLimit: 3,
    apiService: null,
    filters: {},
    formItems: [],
    errorsByItem: [] //{id, errors}
  }),

  getters: {
    totalPages: state => Math.ceil(state.total/state.fetchLimit),
    createFormItems: state => state.formItems.filter(item => !item.id),
    getLoading: state => state.loading,
    canSeeMore: state => state.items.length < state.total,
    getFormItems: state => state.formItems,
    getItems: state => state.items,
    hasErrorByAttribute: state => (dataId, attribute) => {
      let errorByItem = state.errorsByItem.find(item => item.dataId === dataId);
      return errorByItem!==undefined && errorByItem.errors[attribute]!==undefined;
    },
    errorsByAttribute: state => (dataId, attribute) => {
      let errorByItem = state.errorsByItem.find(item => item.dataId === dataId);
      if(!!errorByItem) return !!errorByItem.errors[attribute] ? errorByItem.errors[attribute].join(". ") : null;
      return null;
    }
  },

  actions: {
    setDataRequestPermit(dataRequestPermit){
      this.dataRequestPermit = dataRequestPermit
    },
    setNewDataModel(newDataModel){
      this.newDataModel = newDataModel;
    },
    new(){
      let dataId = ++this.dataId;
      this.formItems = [{...this.newDataModel, dataId: dataId}, ...this.formItems]
      this.dataId = dataId;
    },
    setFormItems(formItems){
      this.formItems = formItems;
    },
    edit(dataId){
      this.formItems.push({...this.items.find(item => item.dataId === dataId), loading: false});
    },
    save(dataId){
      this.setLoadingItem(dataId, true);

      const data = this.formItems.find(item => item.dataId == dataId);
      if(!!data.id) this.update(data);
      else this.create(data);
    },
    update(data){
      this.apiService.update({id: data.id, data: this.dataRequestPermit(data)})
        .then(response => this.updateItemFromResponse(data, response))
        .catch((error) => this.errorFromResponse(data, error));
    },
    create(data){
      this.apiService.create({data: this.dataRequestPermit(data)})
        .then(response => this.addNewItemFromResponse(data, response))
        .catch((error) => this.errorFromResponse(data, error));
    },
    updateItemFromResponse(formData, response){
      this.items = [...this.items.map(item => item.dataId === formData.dataId ? {...toCamel(response.data), dataId: formData.dataId} : item)];
      this.closeEdit(formData.dataId);
      return response
    },
    addNewItemFromResponse(formData, response){
      this.items.unshift({...toCamel(response.data), dataId: formData.dataId});
      this.closeEdit(formData.dataId);
      return response;
    },
    errorFromResponse(formData, error){
      if(error.response.status == 422){
        this.pushError(formData.dataId, toCamel(error.response.data));
        this.setLoadingItem(formData.dataId, false);
      }
    },
    setLoadingItem(dataId, loading){
      this.formItems = this.formItems.map(item => item.dataId === dataId ? {...item, loading: loading} : item);
    },
    closeEdit(dataId){
      this.cleanError(dataId);
      this.formItems = [...this.formItems.filter(item => item.dataId !== dataId)];
    },
    async destroy(id){
      this.items = this.items.map(item => item.id == id ? {...item, loading: true} : item);
      await this.apiService.destroy({id: id});
      this.items = this.items.filter(item => item.id !== id);
      this.total--;
      this.totalFiltered--;
    },
    setApiService(controllerName){
      this.apiService = new ApiCrudService(controllerName);
    },
    setFilters(filters){
      this.filters = {...this.filters, ...filters};
    },
    setAttribute(dataId, attribute, value){
      this.formItems = [...this.formItems.map(item => item.dataId === dataId ? ({...item, [attribute] : value}) : item)];
    },
    cleanError(dataId){
      this.errorsByItem = this.errorsByItem.filter(item => item.dataId !== dataId);
    },
    pushError(dataId, errors){
      this.errorsByItem = [{dataId: dataId, errors: errors}, ...this.errorsByItem];
    },
    fillData(dataId, data){
      this.formItems = this.formItems.map(item => item.dataId === dataId ? {...item, ...data} : item);
    },
    index(limit=this.fetchLimit){
      this.renderList({offset: 0, limit: limit, term: this.term});
    },
    seeMore(){
      const rest = (this.items.length + this.createFormItems.length) % this.fetchLimit
      const limit = rest > 0 ? this.fetchLimit + (this.fetchLimit-rest) : this.fetchLimit;
      this.renderList({offset: this.items.length, limit: limit, term: this.term});
    },
    async renderList({offset, limit, term}){
      this.loading=true;
      const responseData = (await this.apiService.index({offset: offset, limit: limit, term: term})).data;

      let dataId = this.dataId;
      this.items = [...this.items, ...toCamel(responseData).items.map(item => {
        dataId++;
        return {... item, dataId: dataId}          
      })];
      this.dataId=dataId;
      this.total = responseData.total;
      this.totalFiltered = responseData.totalFiltered;
      this.loading=false;
    }
  }
}
