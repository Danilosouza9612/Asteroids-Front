<template>
  <div class="row justify-center items-center">
    <div max-w="w">
      <q-img 
        src="../assets/asteroid.png"
        style="width: 200px"
      />
    </div>
    <div class="q-pl-md">
      <div class="text-h2">Asteroids API</div>
      <div class="text-h5">Database for nearest asteroids</div>
    </div>
  </div>
  <div>
    <div class="row justify-end q-mt-sm q-mr-sm">
      <q-btn color="primary" label="New Asteroid" @click="create()"></q-btn>
    </div>
    <dynamic-list
      v-model="formItems"
      :items="items"
      :can-see-more="canSeeMore"
      @save="save"
      @destroy="destroy"
      @see-more="seeMore"
      v-slot="{ item, destroy, edit, closeForm, setAttribute, submitLabel }"
    >
      <q-card flat class="card-min-height column ">
        <q-card-section class="q-pb-none col-auto">
          <div class="row justify-between items-center">
            <div class="col q-mr-sm">
              <q-input
                class="card-title"
                :filled="item.form"
                placeholder="Title"
                @update:model-value="setAttribute('title', $event)" 
                :borderless="!item.form" 
                :model-value="item.title"  
                :readonly="!item.form"
                dense="true"
                bottom-slots=""
                :rules="[val => val.length > 0 || 'Cannot be blank', val => val.length <= 2000 || 'Maximum 2000 characters']"
              >
                <template v-slot:error>
                </template>
              </q-input>
            </div>
            <div class="q-pb-md">
              <template v-if="!item.form">
                <q-btn color="grey-7" round flat icon="more_vert">
                  <q-menu cover auto-close>
                    <q-list>
                      <q-item clickable>
                        <q-item-section @click="edit()">Edit</q-item-section>
                      </q-item>
                      <q-item clickable>
                        <q-item-section class="remove-item" @click="destroy()">Destroy</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </template>
              <template v-else>
                <q-btn v-if="!item.id" class="q-mr-sm" title="Export from NASA" flat round color="gray" icon="download" size="sm" @click="initExport(item.dataId)" />
                <q-btn flat color="gray" class="q-mr-sm" label="Close" @click="closeForm()" />    
                <q-btn color="primary" type="submit" :label="submitLabel" />                    
              </template>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none q-pb-none col">
          <q-input
            :filled="item.form"
            class="q-pt-none"
            @update:model-value="setAttribute('description', $event)"
            placeholder="Description"
            type="textarea"
            :autogrow="isMobile"
            :model-value="item.description" 
            :readonly="!item.form" 
            :borderless="!item.form"
            :rules="[val => val.length > 0 || 'Cannot be blank', val => val.length <= 2000 || 'Maximum 2000 characters']"
          />
        </q-card-section>

        <q-card-section class="q-pt-none col-auto">
          <div v-if="!!item.id" class="text-overline">Created: {{ formatCreatedAt(item.createdAt) }}</div>
          <div v-else class="text-overline">Fill the informations above to create new card</div>
        </q-card-section>
      </q-card>
    </dynamic-list>
    <create-card-from-nasa-dialog />
  </div>
</template>

<script setup>
import DynamicList from 'src/components/shared/dynamicList.vue';
import createCardFromNasaDialog from 'src/components/createCardFromNasaDialog.vue';
import { useAsteroidsStore } from 'src/stores/pages/MainPage/asteroidsListStore';
import { useCreateAsteroidsModalStore } from 'src/stores/pages/MainPage/createAsteroidsModalStore';
import { useQuasar } from 'quasar';
import { computed } from 'vue';
import { format } from 'date-fns';

const $q = useQuasar();

const isMobile = computed(() => $q.screen.lt.md );

const asteroidsStore = useAsteroidsStore();
asteroidsStore.setApiService('asteroids');
asteroidsStore.setDataRequestPermit(data => ({title: data.title, description: data.description}));
asteroidsStore.setNewDataModel({title: '', description: ''});
asteroidsStore.index(9);

const items = computed(() => asteroidsStore.getItems);
const formItems = computed({
  get: () => asteroidsStore.getFormItems,
  set: asteroidsStore.setFormItems
});
const canSeeMore = computed(() => asteroidsStore.canSeeMore);

const save = (dataId) => asteroidsStore.save(dataId);
const destroy = (dataId) => asteroidsStore.destroy(dataId);
const seeMore = () => asteroidsStore.seeMore();

const createAsteroidsModalStore = useCreateAsteroidsModalStore();

function initExport(id){
  createAsteroidsModalStore.initExport(id);
}

function formatCreatedAt(dateJSON){
  return new Date(dateJSON).toLocaleString();
}

function create(){
  asteroidsStore.new();
}

defineOptions({
  name: 'IndexPage'
});
</script>
<style>
  .card-title{
    font-size: 1.25em !important
  }
  .card-min-height {
    min-height: 296px;
  }
  .remove-item{
    color: red
  }
</style>
