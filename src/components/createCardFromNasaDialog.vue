<template>
  <q-dialog v-model="modalVisibility" backdrop-filter="hue-rotate(120deg)" :full-width="true">
    <q-card>
      <q-card-section>
        <div class="row justify-between">
          <div class="text-h6">Add asteroids</div>
          <div>
            <q-btn flat label="Close" color="gray" v-close-popup></q-btn>
            <q-btn label="Export" color="primary" v-close-popup @click="exportData()"></q-btn>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <q-form class="row" ref="form" @submit="submitHandler">
          <div class="col-md-2 q-mr-sm">
            <q-input v-model="startDate" label="Start Date" mask="date" :rules="['date']">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy>
                    <q-date v-model="startDate" mask="YYYY-MM-DD"/>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col-md-2 q-ml-sm">
            <q-input v-model="endDate" label="End date" mask="date" :rules="['date']">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy>
                    <q-date v-model="endDate"/>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions>
        <div class="full-width">
          <q-table
            flat
            v-model:selected="selected"
            :rows="fetchedItems"
            :columns="columns"
            selection="single"
            row-key="name"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script>
import { compareAsc, format } from 'date-fns';
import { useCreateAsteroidsModalStore } from 'src/stores/pages/MainPage/createAsteroidsModalStore';
import { computed, ref } from 'vue';

import * as nasaApiDataHelpers from 'src/helpers/nasaApiDataHelpers';

export default {
  name: 'create-card-from-nasa-dialog',
  setup(){
    const createAsteroidsModalStore = useCreateAsteroidsModalStore();

    const form = ref(null)

    const modalVisibility = computed({
      get: () => createAsteroidsModalStore.getShow,
      set: () => createAsteroidsModalStore.hideModal(),
    });
    const startDate = computed({
      get: () => createAsteroidsModalStore.getStartDate,
      set: (value) => {
        createAsteroidsModalStore.setStartDate(value)
        submitForm()
      }
    })
    const endDate = computed({
      get: () => createAsteroidsModalStore.getEndDate,
      set: (value) => {
        createAsteroidsModalStore.setEndDate(value);
        submitForm()
      }
    })
    const selected = computed({
      get: () => [createAsteroidsModalStore.getSelected],
      set: value => createAsteroidsModalStore.setSelected(value.length > 0 ? value[0]: [])
    })
    const fetchedItems = computed(() => createAsteroidsModalStore.getFetchedItems);


    const submitForm = () => {
      form.value.submit()
    }
    const submitHandler = (evt) => {
      createAsteroidsModalStore.fetchData();
    }
    const exportData = () => createAsteroidsModalStore.export();

    const diameterSorter = (a,b) => {
      if(a.max < b.max) return -1;
      if(a.max > b.max) return 1;
      if(a.min < b.min) return -1;
      if(a.min > b.min) return 1;
      return 0;
    }

    const columns = ([
      {
        name: 'name', 
        required: true, 
        label: 'Name', 
        align: 'left', 
        sortable: true, 
        field: row => row.name
      },
      {
        name: 'absoluteMagnitudeH', 
        label: 'Absolute Magnitude',
        field: row => row.absoluteMagnitudeH,
        sortable: true
      },
      {
        name: 'estimatedDiameter', 
        label: 'Estimated Diameter', 
        field: nasaApiDataHelpers.parseEstimatedDiameter,
        format: nasaApiDataHelpers.formatEstimatedDiameter,
        sortable: true,
        sort: diameterSorter
      },
      {
        name: 'isPontentiallyHazardousAsteroid', 
        label: 'Is Pontentially Hazardous?', 
        field: row => row.isPontentiallyHazardousAsteroid,
        sortable: true,
        format: nasaApiDataHelpers.formatIsHazardousAsteroid
      },
      {
        name: 'closeApproachDateFull', 
        label: 'Close Approach Date',
        field: nasaApiDataHelpers.parseCloseApproachDateFromString,
        format: nasaApiDataHelpers.formatCloseApproachDate,
        sortable: true,
        sort: compareAsc
      },
      {
        name: 'relativeVelocity', 
        label: 'Relative Velocity', 
        field: nasaApiDataHelpers.parseRelativeVelocity,
        format: nasaApiDataHelpers.formatRelativeVelocity,
      },
      {
        name: 'missDistance', 
        label: 'Miss Distance', 
        field: nasaApiDataHelpers.parseMissDistance,
        format: nasaApiDataHelpers.formatMissDistance
      }
    ])

    return {
      form,

      modalVisibility,
      startDate,
      endDate,
      fetchedItems,
      selected,

      submitForm,
      submitHandler,
      exportData,

      columns,
    }
  }
}
</script>