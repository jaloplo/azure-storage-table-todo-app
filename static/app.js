let business = feathers();

business.use('table', {
    async find(params) {
        let url = `${this.base_url}${this.table}${this.sas}`;

        return superagent
            .get(url)
            .set('Accept', 'application/json');
    },

    async create(data, params) {
        let url = `${this.base_url}${this.table}${this.sas}`;

        return new Promise((resolve, reject) => {
            superagent
                .post(url)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({
                    PartitionKey: 'personal',
                    RowKey: data.title,
                    title: data.title,
                    done: false
                })
                .then(res => resolve(res))
                .catch(err => reject(err));
            });
    },

    async update(id, data, params) {
        let url = `${this.base_url}${this.table}(PartitionKey='${data.key}',RowKey='${data.row}')${this.sas}`;

        return new Promise((resolve, reject) => {
            superagent
                .put(url)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({
                    PartitionKey: data.key,
                    RowKey: data.row,
                    title: data.title,
                    done: data.done
                })
                .then(res => resolve(res))
                .catch(err => reject(err));
            });
    },

    setup(app, path) {
        this.name = 'storetodoapp001';
        this.base_url = `https://${this.name}.table.core.windows.net/`;
        this.table = 'todos';
        this.sas = '?sv=2019-02-02&ss=t&srt=sco&sp=rwlacu&se=2020-02-29T06:06:35Z&st=2020-02-11T22:06:35Z&spr=https&sig=XYRJzKv1WM18RSWb2XhORFIz6e5JNQsBdzlw%2FB1mttw%3D';
    }
});

business.setup();

/*
    TODO COMPONENT
*/

let TodoTitle = Vue.extend({
    props: ['title'],
    template: '<div class="todos__title">{{ title }}</div>'
});

let TodoDone = Vue.extend({
    props: ['id', 'row', 'done'],
    template: '<div class="todos__done"> \
                    <input type="checkbox" :id="\'check\' + id + row" v-model="done" /> \
                    <label :for="\'check\' + id + row" @click="$emit(\'done\', id, row)"></label> \
                </div>'
});

let TodoItem = Vue.extend({
    props: ['todo'],
    components: {
        TodoTitle,
        TodoDone,
    },
    template: '<li class="todos__item"><TodoDone :id="todo.PartitionKey" :row="todo.RowKey" :done="todo.done" @done="(key, row) => $emit(\'done\', key, row)" /><TodoTitle :title="todo.title" /></li>'
});

let TodoList = Vue.extend({
    props: ['todos'],
    components: {
        TodoItem
    },
    template: '<ul class="todos"><TodoItem v-for="item in todos" :todo="item" @done="(key, row) => $emit(\'done\', key, row)"/></ul>'
});


/*
    INTRO COMPONENT
*/

let IntroText = Vue.extend({
    template: '<input class="input intro__text" type="text" placeholder="Add a task" v-model="text" @keyup="sendTodo" />',
    data: () => {
        return {
            text: '',
        }
    },
    methods: {
        sendTodo(e) {
            if (e.keyCode === 13 && this.text !== '') {
                this.$emit('add', this.text);
                this.text = '';
            }
        }
    }
});

let IntroContent = Vue.extend({
    components: {
        IntroText
    },
    template: '<div class="intro__content"><IntroText @add="(text) => { $emit(\'add\', text); }" /></div>'
});

let Intro = Vue.extend({
    components: {
        IntroContent,
    },
    template: '<div class="intro"><IntroContent @add="(text) => { $emit(\'add\', text); }"/></div>'
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
    components: {
        TodoList,
        Intro
    },
    data: () => {
        return {
            todos: []
        };
    },
    template: '<div class="app__content"><TodoList :todos="todos" @done="doneTodo"/><Intro @add="addTodo"/></div>',
    methods: {
        addTodo(title) {
            business
                .service('table')
                .create({
                    title: title
                })
                .then(() => {
                    return business.service('table').find();
                })
                .then((res) => { 
                    let response = res.text;
                    this.todos = JSON.parse(response).value.map(x => {
                        return {
                            PartitionKey: x.PartitionKey,
                            RowKey: x.RowKey,
                            title: x.title,
                            done: x.done === true
                        };
                    });
                })
                .catch(err => {
                    console.log('>>> ERROR');
                    console.log(err);
                });
        },

        doneTodo(key, row) {
            let todo = this.todos.filter(x => x.PartitionKey === key && x.RowKey === row)[0];

            business
                .service('table')
                .update(null, {
                    key: key,
                    row: row,
                    title: todo.title,
                    done: !todo.done
                })
                .then(() => {
                    return business.service('table').find();
                })
                .then((res) => { 
                    let response = res.text;
                    this.todos = JSON.parse(response).value.map(x => {
                        return {
                            PartitionKey: x.PartitionKey,
                            RowKey: x.RowKey,
                            title: x.title,
                            done: x.done === true
                        };
                    });
                })
                .catch(err => {
                    console.log('>>> ERROR');
                    console.log(err);
                });
        }
    },
    beforeCreate() {
        business
            .service('table')
            .find()
            .then(res => {
                let response = res.text;
                this.todos = JSON.parse(response).value.map(x => {
                    return {
                        PartitionKey: x.PartitionKey,
                        RowKey: x.RowKey,
                        title: x.title,
                        done: x.done === true
                    };
                });
            })
            .catch(err => {
                console.log('>>> ERROR');
            });
    }
});

let App = Vue.extend({
    props: ['title'],
    components: {
        AppHeader,
        AppContent
    },
    template: '<div class="app"><AppHeader :title="title" /><AppContent /></div>'
});

new Vue({
    el: '.app',
    components: {
        App
    },
    data: {
        title: 'Azure Todo App'
    },
    template: '<App :title="title"/>',
});

Vue.config.devtools = true;