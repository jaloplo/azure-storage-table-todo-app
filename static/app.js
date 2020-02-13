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
    components: {
        AppTitle,
        AppSubtitle,
    },
    template: '<header class="app__header"><AppTitle title="Azure Todo App" /><AppSubtitle /></header>'
});

new AppHeader().$mount('.app__header');