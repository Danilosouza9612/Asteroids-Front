<template>
  <q-dialog v-model="modalVisibility" backdrop-filter="hue-rotate(120deg)" :full-width="true">
    <q-card>
      <q-card-section>
        <div class="row justify-between">
          <div class="text-h6">Add asteroids</div>
          <q-btn flat rounded icon="close" gray v-close-popup></q-btn>
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
      get: () => createAsteroidsModalStore.getSelected,
      set: createAsteroidsModalStore.setSelected
    })
    const fetchedItems = computed(() => createAsteroidsModalStore.getFetchedItems);


    const submitForm = () => {
      form.value.submit()
    }

    const submitHandler = (evt) => {
      createAsteroidsModalStore.fetchData();
    }

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
        field: row => ({
          min: Number.parseFloat(row.estimatedDiameter.meters.estimatedDiameterMin), 
          max: Number.parseFloat(row.estimatedDiameter.meters.estimatedDiameterMax)
        }),
        format: val => `${Math.round(val.min)} m - ${Math.round(val.max)} m`,
        sortable: true,
        sort: diameterSorter
      },
      {
        name: 'isPontentiallyHazardousAsteroid', 
        label: 'Is Pontentially Hazardous?', 
        field: row => row.isPontentiallyHazardousAsteroid,
        sortable: true,
        format: val => val ? 'Yes' : 'No'
      },
      {
        name: 'closeApproachDateFull', 
        label: 'Close Approach Date',
        field: row => new Date(row.closeApproachData[0].epochDateCloseApproach),
        format: val => format(val, ' dd MMM yyyy hh:MM'),
        sortable: true,
        sort: compareAsc
      },
      {
        name: 'relativeVelocity', 
        label: 'Relative Velocity', 
        field: row => Number.parseFloat(row.closeApproachData[0].relativeVelocity.kilometersPerHour),
        format: val => `${Math.round(val)} KPH`,
      },
      {
        name: 'missDistance', 
        label: 'Miss Distance', 
        field: row => Number.parseFloat(row.closeApproachData[0].missDistance.kilometers),
        format: val => `${Math.round(val)} KM`
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

      columns,
    }
  }
}
</script>