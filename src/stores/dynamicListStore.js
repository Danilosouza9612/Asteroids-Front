import { date } from 'quasar';
import { ApiCrudService } from 'src/services/apiCrudService';

export const dynamicListStore = {
  state: () => ({
    newDataModel: {},
    dataRequestPermit: data => data,
    items: [],
    total: 0,
    totalFiltered: 0,
    dataId: 0,
    modalDestroyData: {
      visible: false,
      id: null,
    },
    page: 1,
    perPage: 6,
    apiService: null,
    filters: {},
    formItems: [],
    errorsByItem: [] //{id, errors}
  }),

  getters: {
    getPage: state => state.page,
    totalPages: state => Math.ceil(state.total/state.perPage),
    isModalDestroyVisible: state => state.modalDestroyData.visible,
    idToDestroy: state => state.modalDestroyData.id,
    seeMoreEnabled: (state, getters) => state.page < getters.totalPages,
    getItems: state => {
      let formItemsIds = state.formItems
        .filter(item => !!item.id)
        .map(item => item.dataId);

      let newFormItems = state.formItems.filter(item => !item.id).map(item => ({...item, form: true}));

      return newFormItems.concat(state.items.map(
        item => formItemsIds.includes(item.dataId) ? {
          ...state.formItems.find(eItem => eItem.dataId === item.dataId), form: true
        } : {
          ...item, edit: false
        }
      ));
    },
    hasErrorByAttribute: state => (dataId, attribute) => {
      let errorByItem = state.errorsByItem.find(item => item.dataId === dataId);
      return errorByItem!==undefined && errorByItem.errors[attribute]!==undefined;
    },
    errorsByAttribute: state => (dataId, attribute) => {
      let errorByItem = state.errorsByItem.find(item => item.dataId === dataId);
      if(!!errorByItem) {
        return errorByItem.errors[attribute].join(". ");
      }
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
      this.formItems.unshift({...this.newDataModel, dataId: dataId})
      this.dataId = dataId;
    },
    edit(dataId){
      this.formItems.push(this.items.find(item => item.dataId === dataId));
    },
    save(dataId){
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
      this.closeEdit(formData.dataId);
      this.items = [...this.items.map(item => item.dataId === formData.dataId ? {...response.data, dataId: formData.id} : item)];
      return response
    },
    addNewItemFromResponse(formData, response){
      this.closeEdit(formData.dataId);
      this.items.unshift({...response.data, dataId: formData.dataId});
    },
    errorFromResponse(formData, error){
      if(error.response.status == 422){
        this.pushError(formData.itemId, error.response.data);
      }
    },
    closeEdit(dataId){
      this.formItems = [...this.formItems.filter(item => item.dataId !== dataId)];
    },
    destroy(id){
      this.modalDestroyData = {
        visible: true,
        id: id
      }
    },
    hideModal(){
      this.modalDestroyData = {
        ...this.modalDestroyData,
        visible: false,
      }
    },
    confirmDestroy(){
      this.apiService.destroy({id: this.modalDestroyData.id}).then(() => {
        this.items = [...this.items.filter(item => item.id !== this.modalDestroyData.id)];
        if(this.items.length == 0) this.setPage(this.page-1);
        else this.renderList();
      })
    },
    setApiService(controllerName){
      this.apiService = new ApiCrudService(controllerName);
    },
    setFilters(filters){
      this.filters = {...this.filters, ...filters};
    },
    /*setPage(page){
      this.page = page;
      this.renderList();
    },*/
    seeMore(){
      this.page++;
      this.renderList();
    },
    setAttribute(dataId, attribute, value){
      this.formItems = [...this.formItems.map(item => item.dataId === dataId ? ({...item, [attribute] : value}) : item)];
    },
    cleanError(id){
      this.errorsByItem = this.errorsByItem.filter(item => item.id !== id);
    },
    pushError(id, errors){
      this.errorsByItem = [{id: id, errors: errors}, ...this.errorsByItem]
    },
    renderList(){
      this.apiService.index({page: this.page, perPage: this.perPage, term: this.filters.term}).then(response => {
        let dataId = this.dataId;
        this.items = [...this.items, ...response.data.items.map(item => {
          dataId++;
          return {... item, dataId: dataId}          
        })];
        this.dataId=dataId;
        this.total = response.data.total,
        this.totalFiltered = response.data.totalFiltered
      })
    },
  }
}
