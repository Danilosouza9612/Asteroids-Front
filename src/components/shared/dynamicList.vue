<template>
  <div style="min-width:100%">
    <div class="row">
      <div class="col-4" v-for="item in items" :key="item.dataId">
        <q-form @submit.prevent="submitHandler(item)">
          <slot 
            :item="item" 
            :destroy="destroy(item)" 
            :edit="edit(item)" 
            :closeEdit="closeEdit(item)" 
            :setAttribute="setAttribute(item)"
            :errorsByAttribute="errorsByAttribute(item)"
            :submitLabel="submitLabel(item)"
            :hasErrorByAttribute="hasErrorByAttribute(item)"
          ></slot>
        </q-form>
      </div>
    </div>
    <div class="row justify-center ">
      <q-btn flat label="SEE MORE" color="primary" @click="seeMore()" :disable="!seeMoreEnabled"></q-btn>
    </div>
  </div>
  <q-dialog v-model="modalDestroyVisibility" backdrop-filter="hue-rotate(120deg)">
    <q-card>
      <q-card-section>
        <div class="text-h6">Remove #{{ idToDestroy }}</div>
      </q-card-section>
      <q-card-section>
        Do you really want to remove this card?
      </q-card-section>
      <q-card-actions>
        <q-btn flat label="Yes" color="red" v-close-popup @click="confirmDestroy()"></q-btn>
        <q-btn flat label="No" color="primary" v-close-popup></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script>
  import { defineStore } from 'pinia';
  import { dynamicListStore } from 'src/stores/dynamicListStore';
  import { computed } from 'vue';

  export default {
    name: 'dynamic-list',
    props: {
      storeName: String,
      controllerName: String,
      storeDefinition: Function
    },
    setup(props){
      const store = props.storeDefinition!=null ? props.storeDefinition() : defineStore(props.storeName, dynamicListStore)();

      const items = computed(() => store.getItems);
      const page = computed(() => store.getPage);
      const isModalDestroyVisible = computed(() => store.isModalDestroyVisible);
      const idToDestroy = computed(() => store.idToDestroy);
      const seeMoreEnabled = computed(() => store.seeMore);

      const setFilters = filters => store.setFilters(filters);
      const seeMore = () => store.seeMore();
      const destroy = item => () => store.destroy(item.id);
      const confirmDestroy = () => store.confirmDestroy();
      const edit = item => () => store.edit(item.dataId)
      const closeEdit = item => () => store.closeEdit(item.dataId);
      const setAttribute = item => (attribute, value) => store.setAttribute(item.dataId, attribute, value);
      const submitHandler = item => store.save(item.dataId);
      const errorsByAttribute = item => attribute => store.errorsByAttribute(item.dataId, attribute);
      const hasErrorByAttribute = item => attribute => store.hasErrorByAttribute(item.dataId, attribute);
      const submitLabel = (item) => !!item.id ? 'Save' : 'Create';


      if(!props.storeDefinition){
        store.setApiService(props.controllerName);
        store.renderList();
      }

      const modalDestroyVisibility = computed({
        get: () => store.isModalDestroyVisible,
        set: () => store.hideModal()
      })

      return {
        items, 
        page, 
        isModalDestroyVisible,
        idToDestroy,
        modalDestroyVisibility,
        seeMoreEnabled,

        setFilters, 
        seeMore,
        destroy,
        confirmDestroy,
        edit,
        closeEdit,
        setAttribute,
        submitHandler,
        errorsByAttribute,
        hasErrorByAttribute,
        submitLabel,
      }
    }
  }
</script>