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
            let service_url = 'https://storetodoapp001.table.core.windows.net/';
            let table_name = 'todos';
            let sas = '?sv=2019-02-02&ss=t&srt=sco&sp=rwlacu&se=2020-02-29T06:06:35Z&st=2020-02-11T22:06:35Z&spr=https&sig=XYRJzKv1WM18RSWb2XhORFIz6e5JNQsBdzlw%2FB1mttw%3D';

            let url = `${service_url}${table_name}${sas}`;

            superagent.post(url)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({
                    PartitionKey: 'personal',
                    RowKey: title,
                    title: title,
                    done: false
                })
                .then(res => {
                    superagent.get(url)
                        .set('Accept', 'application/json')
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
                })
                .catch(err => {
                    console.log('>>> ERROR');
                    console.log(err);
                });
        },

        doneTodo(key, row) {
            let service_url = 'https://storetodoapp001.table.core.windows.net/';
            let table_name = 'todos';
            let sas = '?sv=2019-02-02&ss=t&srt=sco&sp=rwlacu&se=2020-02-29T06:06:35Z&st=2020-02-11T22:06:35Z&spr=https&sig=XYRJzKv1WM18RSWb2XhORFIz6e5JNQsBdzlw%2FB1mttw%3D';

            let url = `${service_url}${table_name}(PartitionKey='${key}',RowKey='${row}')${sas}`;

            superagent.put(url)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({
                    PartitionKey: key,
                    RowKey: row,
                    title: this.todos.filter(x => x.PartitionKey === key && x.RowKey === row)[0].title,
                    done: !this.todos.filter(x => x.PartitionKey === key && x.RowKey === row)[0].done
                })
                .then(res => {
                    url = `${service_url}${table_name}${sas}`;
                    superagent.get(url)
                        .set('Accept', 'application/json')
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
                            console.log(err);
                        });
                })
                .catch(err => {
                    console.log('>>> ERROR');
                    console.log(err);
                });
        }
    },
    beforeCreate() {
        let service_url = 'https://storetodoapp001.table.core.windows.net/';
        let table_name = 'todos';
        let sas = '?sv=2019-02-02&ss=t&srt=sco&sp=rwlacu&se=2020-02-29T06:06:35Z&st=2020-02-11T22:06:35Z&spr=https&sig=XYRJzKv1WM18RSWb2XhORFIz6e5JNQsBdzlw%2FB1mttw%3D';

        let url = `${service_url}${table_name}${sas}`;

        superagent.get(url)
            .set('Accept', 'application/json')
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