<template>
  <div class="row justify-end q-mt-sm q-mr-sm">
    <q-btn color="primary" label="NEW ASTEROIDS" @click="create()"></q-btn>
  </div>
  <dynamic-list
    :store-definition="useAsteroidsStore"
     v-slot="{ item, destroy, edit, closeEdit, setAttribute, errorsByAttribute, hasErrorByAttribute, submitLabel }"
  >
    <q-card class="q-ma-sm">
      <q-card-section>
        <div class="row justify-between items-center">
          <div class="text-h6">
            <q-input 
              :error="hasErrorByAttribute('title')"
              placeholder="Title"
              :error-message="errorsByAttribute('title')" 
              @update:model-value="setAttribute('title', $event)" 
              :borderless="!item.form" 
              :model-value="item.title" 
              style="width: 100%; font-size: 1.2em;" 
              :readonly="!item.form"
            />
          </div>
          <div>
            <template v-if="!item.form">
              <q-btn flat round color="primary" icon="edit" size="sm" @click="edit()" />
              <q-btn flat round color="red" icon="delete" size="sm" @click="destroy()" />
            </template>
            <template v-else>
              <q-btn flat color="gray" label="Close" @click="closeEdit()" />    
              <q-btn color="primary" type="submit" :label="submitLabel" />                    
            </template>
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <q-input 
          @update:model-value="setAttribute('description', $event)"
          placeholder="Description"
          type="textarea"
          :model-value="item.description" 
          style="width: 100%" 
          :readonly="!item.form" 
          :borderless="!item.form"
        />
      </q-card-section>
    </q-card>
  </dynamic-list>
  <create-card-from-nasa-dialog />
</template>

<script setup>
import DynamicList from 'src/components/shared/dynamicList.vue';
import createCardFromNasaDialog from 'src/components/createCardFromNasaDialog.vue';
import { useAsteroidsStore } from 'src/stores/pages/MainPage/asteroidsListStore';
import { useCreateAsteroidsModalStore } from 'src/stores/pages/MainPage/createAsteroidsModalStore';

const asteroidsStore = useAsteroidsStore();
asteroidsStore.setApiService('asteroids');
asteroidsStore.setDataRequestPermit(data => ({title: data.title, description: data.description}));
asteroidsStore.setNewDataModel({title: '', description: ''});
asteroidsStore.renderList();

const createAsteroidsModalStore = useCreateAsteroidsModalStore();

function showCreateAsteroidsModal(){
  createAsteroidsModalStore.showModal();
}

function create(){
  asteroidsStore.new();
}

defineOptions({
  name: 'IndexPage'
});
</script>
