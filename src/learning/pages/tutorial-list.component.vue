<template>

</template>

<script>
import {TutorialsApiService} from "../services/tutorials-api.service.js";

export default {
    name: "tutorial-list",
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
        // TODO: Get Tutorials from API and translate to displayable tutorials
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
        }

    }
}
</script>

<style scoped>

</style>