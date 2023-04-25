<template>
  <div>
      <div class="card">
          <!-- Toolbar Section -->
          <pv-toolbar class="mb-4">
            <template #start>
                <pv-button label="New" icon="pi pi-plus"
                           class="p-button-success mr-2"
                           @click="openNew"></pv-button>
                <pv-button label="Delete" icon="pi pi-trash"
                           class="p-button-danger"
                           @click="confirmDeleteSelected"
                            :disabled="!selectedTutorials || !selectedTutorials.length"></pv-button>
            </template>
              <template #end>
                  <pv-button label="Export" icon="pi pi-download"
                             class="p-button-help"
                             @click="exportToCsv($event)"></pv-button>
              </template>
          </pv-toolbar>

          <!-- Data Table Section -->
          <pv-data-table ref="dt" :value="tutorials"
                         v-model:selection="selectedTutorials"
                         dataKey="id"
                         :paginator="true"
                         :rows="10"
                         :filters="filters"
                         paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                         :rowsPerPageOptions="[5, 10, 25]"
                         currentPageReportTemplate="Showing {first} to {last} of {totalRecords} tutorials"
                         responsiveLayout="scroll">
              <template #header>
                  <div class="table-header flex flex-column md:flex-row md:justify-content-between">
                      <h5 class="mb-2 md:m-0 p-as-md-center text-xl">Manage Tutorials</h5>
                      <span class="p-input-icon-left">
                          <i class="pi pi-search"></i>
                          <pv-input-text v-model="filters['global'].value"
                                         placeholder="Search..."></pv-input-text>
                      </span>
                  </div>
              </template>

              <pv-column selectionMode="multiple" style="width: 3rem" :exportable="false"></pv-column>
              <pv-column field="id" header="Id" :sortable="true" style="min-width: 12rem"></pv-column>
              <pv-column field="title" header="Title" :sortable="true" style="min-width: 16rem"></pv-column>
              <pv-column field="description" header="Description" :sortable="true" style="min-width: 16rem"></pv-column>
              <pv-column field="status" header="Status" :sortable="true" style="min-width: 12rem">
                  <template #body="slotProps">
                      <pv-tag v-if="slotProps.data.status === 'Published'"
                              severity="success">{{ slotProps.data.status }}</pv-tag>
                      <pv-tag v-else severity="info">{{ slotProps.data.status }}</pv-tag>
                  </template>
              </pv-column>
              <pv-column :exportable="false" style="min-width: 8rem">
                  <template #body="slotProps">
                      <pv-button icon="pi pi-pencil" class="p-button-text p-button-rounded"
                                 @click="editTutorial(slotProps.data)"></pv-button>
                      <pv-button icon="pi pi-trash" class="p-button-text p-button-rounded"
                                 @click="confirmDeleteTutorial(slotProps.data)"></pv-button>
                  </template>
              </pv-column>
          </pv-data-table>


      </div>
  </div>
</template>

<script>
import {TutorialsApiService} from "../services/tutorials-api.service.js";
import {FilterMatchMode} from "primevue/api";

export default {
    name: "tutorial-list",
    components: {PvColumn, PvInputText, PvButton},
    data() {
        return {
            tutorials: [],
            tutorialDialog: false,
            deleteTutorialDialog: false,
            deleteTutorialsDialog: false,
            tutorial: {},
            selectedTutorials: null,
            filters: {},
            submitted: false,
            statuses: [
                { label: "Published", value: "published"},
                { label: "Unpublished", value: "unpublished"},
            ],
            tutorialsService: null,
        };

    },
    created() {
        this.tutorialsService = new TutorialsApiService();
        this.tutorialsService.getAll()
            .then((response) => {
                this.tutorials = response.data.forEach((tutorial) =>
                    this.getDisplayableTutorial(tutorial));
                console.log(response);
            });
        this.initFilters();
    },

    methods: {
        getDisplayableTutorial(tutorial) {
            tutorial.status = tutorial.published
            ? this.statuses[0].label
                : this.statuses[1].label;
            return tutorial;
        },
        getStorableTutorial(displayableTutorial) {
            return {
                id: displayableTutorial.id,
                title: displayableTutorial.title,
                description: displayableTutorial.description,
                published: displayableTutorial.status.label === "Published",
            }
        },
        openNew() {
            this.tutorial = {};
            this.submitted = false;
            this.tutorialDialog = true;
        },
        hideDialog() {
            this.tutorialDialog = false;
            this.submitted = false;
        },
        findIndexById(id) {
          console.log(`current id is ${id}`);
          return this.tutorials
              .findIndex((tutorial) => tutorial.id === id);
        },
        saveTutorial() {
            this.submitted = true;
            if (this.tutorial.title.trim()) {
                if (this.tutorial.id) {
                    console.log(this.tutorial);
                    this.tutorial = this.getStorableTutorial(this.tutorial);
                    this.tutorialsService
                        .update(this.tutorial.id, this.tutorial)
                        .then((response) => {
                            console.log(response.data.id);
                            this.tutorials[this.findIndexById(response.data.id)] =
                                this.getDisplayableTutorial(response.data);
                            this.$toast.add({
                                severity: "success",
                                summary: "Success",
                                detail: "Tutorial Updated",
                                life: 3000,
                            });
                            console.log(response);
                        });
                } else {
                    this.tutorial.id = 0;
                    console.log(this.tutorial);
                    this.tutorial = this.getStorableTutorial(this.tutorial);
                    this.tutorialsService.create(this.tutorial)
                        .then((response) => {
                            console.log(response.data.id);
                            this.tutorial = this.getDisplayableTutorial(response.data);
                            this.tutorials.push(this.getDisplayableTutorial(this.tutorial));
                            this.$toast.add({
                                severity: "success",
                                summary: "Success",
                                detail: "Tutorial Created",
                                life: 3000,
                            });
                            console.log(response);
                        });
                }
                this.tutorialDialog = false;
                this.tutorial = {};
            }

        },
        editTutorial(tutorial) {
            console.log(tutorial);
            this.tutorial = { ...tutorial };
            console.log(this.tutorial);
            this.tutorialDialog = true;
        },
        confirmDeleteTutorial(tutorial) {
            this.tutorial = tutorial;
            this.deleteTutorialDialog = true;
        },

        deleteTutorial() {
            this.tutorialsService.delete(this.tutorial.id)
                .then((response) => {
                    this.tutorials = this.tutorials.filter(
                        (t) => t.id != this.tutorial.id
                    );
                    this.deleteTutorialDialog = false;
                    this.tutorial = {};
                    this.$toast.add({
                        severity: "success",
                        summary: "Success",
                        detail: "Tutorial Deleted",
                        life: 3000,
                    });
                    console.log(response);
                });
        },

        exportToCsv() {
            this.$refs.dt.exportToCsv();
        },

        confirmDeleteSelected() {
            this.deleteTutorialsDialog = true;
        },

        deleteSelectedTutorials() {
            this.selectedTutorials.forEach((tutorial) => {
                this.tutorialsService.delete(tutorial.id).then((response) => {
                  this.tutorials = this.tutorials.filter((t) => t.id !== this.tutorial.id);
                  console.log(response);
                });
            });
            this.deleteTutorialsDialog = false;
        },

        initFilters() {
            this.filters = { global: { value: null, matchMode: FilterMatchMode.CONTAINS } };
        }

    }
}
</script>

<style scoped>

  .table-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
  }

  .confirmation-content {
      display: flex;
      align-items: center;
      justify-content: center;
  }

  @media screen and (max-width: 960px) {
      :deep(.p-toolbar) {
          flex-wrap: wrap;
          .p-button {
              marging-bottom: 0.25rem;
          }
  }

  }
</style>