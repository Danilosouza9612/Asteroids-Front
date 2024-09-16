<template>
  <q-form ref="form" @submit.prevent="submitHandler" class="q-ma-sm">
      <slot 
        :item="item" 
        :destroy="destroy" 
        :edit="edit" 
        :closeForm="closeForm" 
        :setAttribute="setAttribute"
        :errorByAttribute="errorByAttribute"
        :submitLabel="submitLabel"
      ></slot>
    <q-inner-loading :showing="item.loading">
      <q-spinner size="25px" color="primary" />
    </q-inner-loading>
  </q-form>
</template>
<script>
import { computed, ref } from 'vue';

export default {
  name: 'dynamic-list-item',
  emits: ['save', 'edit', 'destroy', 'closeEdit', 'setAttribute'],
  props: {
    item: Object,
    errors: Object
  },
  setup(props, { emit }){
    const form = ref(null);

    const destroy = () => emit('destroy', props.item.id);
    const edit = () => emit('edit', props.item);
    const closeForm = () => {
      form.value.resetValidation();
      emit('closeEdit', props.item.dataId)
    };
    const submitHandler = () => {
      emit('save', props.item.dataId);
    }
    const setAttribute = (attribute, value) => emit('setAttribute', {dataId: props.item.dataId, attribute: attribute, value: value});
    const submitLabel = computed(() => !!props.item.id ? 'Save' : 'Create');

    const errorByAttribute = attribute => !!props.errors && props.errors[attribute] ? props.errors[attribute].join('. ') : null

    return { 
      form,

      destroy,
      edit,
      closeForm,
      setAttribute,
      submitHandler,
      errorByAttribute,

      submitLabel,
    }
  }
}
</script>