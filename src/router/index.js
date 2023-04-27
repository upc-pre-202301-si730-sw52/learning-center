// Routing Module

import { createRouter, createWebHistory } from "vue-router";

import HomeComponent from "../public/pages/home.component.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/home", component: HomeComponent },
        { path: "/", redirect: "/home" },
        { path: "/about", component: () => import("../public/pages/about.component.vue") },
        { path: "/tutorials", name: "tutorials", component: () => import("../learning/pages/tutorial-list.component.vue")}
        ]
});

export default router;
