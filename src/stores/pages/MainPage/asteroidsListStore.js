import { defineStore } from "pinia";
import { dynamicListStore } from "src/stores/dynamicListStore";

export const useAsteroidsStore = defineStore('asteroids', dynamicListStore);