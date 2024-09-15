<template>
  <div style="min-width:100%">
    <div class="row">
      <div class="col-12 col-md-4" v-for="item in itemsWithForms" :key="item.dataId">
        <dynamic-list-item
          :item="item"
          @destroy="destroy"
          @edit="editItem"
          @save="save"
          @close-edit="closeEdit"
          @set-attribute="setAttribute"
          v-slot="{item, destroy, edit, closeForm, setAttribute, submitLabel}"
        >
          <slot 
            :item="item" 
            :destroy="destroy" 
            :edit="edit" 
            :closeForm="closeForm" 
            :setAttribute="setAttribute"
            :submitLabel="submitLabel"
          ></slot>
        </dynamic-list-item>
      </div>
    </div>
    <div v-if="canSeeMore" class="row justify-center ">
      <q-btn flat label="See More" color="primary" @click="seeMore()"></q-btn>
    </div>
    <q-inner-loading :showing="loading">
      <q-spinner size="50px" color="primary" />
    </q-inner-loading>
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
  import DynamicListItem from './dynamicListItem.vue';
  import { computed, ref } from 'vue';

  export default {
    name: 'dynamic-list',
    emits: ['save', 'destroy', 'seeMore', 'update:modelValue'],
    components: {
      DynamicListItem
    },
    props: {
      modelValue: Array,
      items: Array,
      loading: Boolean,
      canSeeMore: {
        type: Boolean,
        default: false
      }
    },
    setup(props, { emit }){
      const modalDestroyVisibility = ref(false);
      const idToDestroy = ref(null);

      const seeMore = () => emit('seeMore');
      const confirmDestroy = () => emit('destroy', idToDestroy.value);

      const editItem = (data) => emit('update:modelValue', [...props.modelValue, {...data, loading: false}]);
      const setAttribute = (data) => {
        emit('update:modelValue', props.modelValue.map(item => item.dataId === data.dataId ? {...item, [data.attribute]: data.value} : item));
      }
      const closeEdit = (dataId) => emit('update:modelValue', props.modelValue.filter(item => item.dataId !== dataId));

      const itemsWithForms = computed(() => {
        let formItemsIds = props.modelValue
          .filter(item => !!item.id)
          .map(item => item.dataId);

        let newFormItems = props.modelValue.filter(item => !item.id).map(item => ({...item, form: true}));

        return newFormItems.concat(props.items.map(
          item => formItemsIds.includes(item.dataId) ? {
            ...props.modelValue.find(eItem => eItem.dataId === item.dataId), form: true
          } : {
            ...item, edit: false
          }
        ));
      });

      const destroy = (id) => {
        modalDestroyVisibility.value = true;
        idToDestroy.value = id;
      }
      const save = (dataId) => emit('save', dataId);


      return {
        idToDestroy,
        modalDestroyVisibility,
        itemsWithForms,

        seeMore,
        confirmDestroy,
        editItem,
        setAttribute,
        destroy,
        save,
        closeEdit
      }
    }
  }
</script>