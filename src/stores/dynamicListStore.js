import { ApiCrudService } from 'src/services/apiCrudService';

export const dynamicListStore = {
  state: () => ({
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
    editItems: [],
    createItems: [],
    errorsByItem: [] //{id, errors}
  }),

  getters: {
    getPage: state => state.page,
    totalPages: state => Math.ceil(state.total/state.perPage),
    isModalDestroyVisible: state => state.modalDestroyData.visible,
    idToDestroy: state => state.modalDestroyData.id,
    seeMoreEnabled: (state, getters) => state.page < getters.totalPages,
    getItems: state => {
      let editItemsIds = state.editItems.map(item => item.id);
      return state.items.map(
        item => editItemsIds.includes(item.id) ? {
          ...state.editItems.find(eItem => eItem.id === item.id), edit: true
        } : {
          ...item, edit: false
        }
      );
    },
    hasErrorByAttribute: state => (id, attribute) => {
      let errorByItem = state.errorsByItem.find(item => item.id === id);
      return errorByItem!==undefined && errorByItem.errors[attribute]!==undefined;
    },
    errorsByAttribute: state => (id, attribute) => {
      let errorByItem = state.errorsByItem.find(item => item.id === id);
      if(!!errorByItem) {
        return errorByItem.errors[attribute].join(". ");
      }
      return null;
    }
  },

  actions: {
    edit(id){
      this.editItems.push(this.items.find(item => item.id === id));
    },
    update(id){
      this.apiService.update({id: id, data: this.editItems.find(item => item.id == id)}).then(response => {
        this.closeEdit(id);
        this.items = [...this.items.map(item => item.id === id ? response.data : item)];
      }).catch((error) => {
        if(error.response.status == 422){
          this.pushError(id, error.response.data);
        }
      })
    },
    closeEdit(id){
      this.editItems = [...this.editItems.filter(item => item.id !== id)];
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
    setAttribute(id, attribute, value){
      this.editItems = [...this.editItems.map(item => item.id === id ? ({...item, [attribute] : value}) : item)];
    },
    cleanError(id){
      this.errorsByItem = this.errorsByItem.filter(item => item.id !== id);
    },
    pushError(id, errors){
      this.errorsByItem = [{id: id, errors: errors}, ...this.errorsByItem]
    },
    confirmDestroy(){
      this.apiService.destroy({id: this.modalDestroyData.id}).then(() => {
        this.items = [...this.items.filter(item => item.id !== this.modalDestroyData.id)];
        if(this.items.length == 0) this.setPage(this.page-1);
        else this.renderList();
      })
    },
    renderList(){
      this.apiService.index({page: this.page, perPage: this.perPage, term: this.filters.term}).then(response => {
        let dataId = this.dataId;
        this.items = [...this.items, ...response.data.items.map(item => {
          this.dataId++;
          return {... item, dataId: dataId}          
        })];
        this.total = response.data.total,
        this.totalFiltered = response.data.totalFiltered
      })
    },
  }
}
