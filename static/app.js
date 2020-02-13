/*
    TODO COMPONENT
*/

let TodoTitle = Vue.extend({
    props: ['title'],
    template: '<div class="todos__title">{{ title }}</div>'
});

let TodoDone = Vue.extend({
    props: ['id'],
    template: '<div class="todos__done"> \
                    <input type="checkbox" :id="\'check\' + id" checked/> \
                    <label :for="\'check\' + id"></label> \
                </div>'
});

let TodoItem = Vue.extend({
    props: ['todo'],
    components: {
        TodoTitle,
        TodoDone,
    },
    template: '<li class="todos__item"><TodoDone :id="todo.id" /><TodoTitle :title="todo.title" /></li>'
});

let TodoList = Vue.extend({
    props: ['todos'],
    components: {
        TodoItem
    },
    template: '<ul class="todos"><TodoItem v-for="item in todos" :todo="item" /></ul>'
});


/*
    INTRO COMPONENT
*/

let IntroText = Vue.extend({
    template: '<input class="input intro__text" type="text" placeholder="Add a task" v-model="text" />',
    data: () => {
        return {
            text: '',
        }
    }
});

let IntroContent = Vue.extend({
    components: {
        IntroText
    },
    template: '<div class="intro__content"><IntroText /></div>'
});

let Intro = Vue.extend({
    components: {
        IntroContent,
    },
    template: '<div class="intro"><IntroContent /></div>'
});


/*
    APP HEADER COMPONENT
*/

let AppSubtitle = Vue.extend({
    template: '<p class="app__subtitle">{{ currentDate }}</p>',
    data: () => {
        return {
            currentDate: new Date().toDateString()
        };
    }
});

let AppTitle = Vue.extend({
    props: ['title'],
    template: '<h1 class="app__title">{{ title }}</h1>'
});

let AppHeader = Vue.extend({
    props: ['title'],
    components: {
        AppTitle,
        AppSubtitle,
    },
    template: '<header class="app__header"><AppTitle :title="title" /><AppSubtitle /></header>'
});

let AppContent = Vue.extend({
    props: ['todos'],
    components: {
        TodoList,
        Intro
    },
    template: '<div class="app__content"><TodoList :todos="todos"/><Intro /></div>'
});

let App = Vue.extend({
    props: ['todos', 'title'],
    components: {
        AppHeader,
        AppContent
    },
    template: '<div class="app"><AppHeader :title="title" /><AppContent :todos="todos" /></div>'
});

new Vue({
    el: '.app',
    components: {
        App
    },
    data: {
        title: 'Azure Todo App',
        todos: [
            { id: 1, title: 'Lorem ipsum A' },
            { id: 2, title: 'Lorem ipsum B' }
        ]
    },
    template: '<App :title="title" :todos="todos" />'
});

Vue.config.devtools = true;