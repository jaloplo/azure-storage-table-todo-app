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
                .send(data)
                .then(res => resolve(res))
                .catch(err => reject(err));
            });
    },

    async update(id, data, params) {
        let url = `${this.base_url}${this.table}(PartitionKey='${data.PartitionKey}',RowKey='${data.RowKey}')${this.sas}`;

        return new Promise((resolve, reject) => {
            superagent
                .put(url)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(data)
                .then(res => resolve(res))
                .catch(err => reject(err));
            });
    },

    async remove(id, params) {
        let url = `${this.base_url}${this.table}(PartitionKey='${id.PartitionKey}',RowKey='${id.RowKey}')${this.sas}`;

        return new Promise((resolve, reject) => {
            superagent
                .delete(url)
                .set('If-Match', '*')
                .then(res => resolve(res))
                .catch(err => reject(err));
            });
    },

    setup(app, path) {
        this.name = 'storetodoapp001';
        this.base_url = `https://${this.name}.table.core.windows.net/`;
        this.table = 'todos';
        this.sas = '?sv=2019-02-02&ss=t&srt=sco&sp=rwdlacu&se=2020-02-29T09:00:30Z&st=2020-02-14T01:00:30Z&spr=https&sig=wXm9yTtv5HTmgD9v6HzHQrsxewPt5g7KM0%2FJH0VFFzs%3D';
    }
});

business.setup();

const app = new Vue({
    el: '.app',
    data: {
        task: '',
        todos: [
            { id: 1, title: 'lorem ipsum A', done: false, edit_mode: false },
            { id: 2, title: 'lorem ipsum B', done: true, edit_mode: false },
            { id: 3, title: 'lorem ipsum C', done: false, edit_mode: false }
        ],
        query: (t) => t === t,
    },
    computed: {
        get_todos() {
            return this.todos.filter(this.query);
        }
    },
    methods: {
        add() {
            let sorted = this.todos.sort((a,b) => b.id - a.id);
            
            business.service('table').create({
                PartitionKey: 'personal',
                RowKey: new String(parseInt(sorted[0].id) + 1),
                title: this.task,
                done: false
            })
                .then(() => {
                    this.task = '';
                    return business.service('table').find();
                })
                .then(this.set_todos);
        },

        done(id) {
            let todo = this.todos.filter(t => t.id === id)[0];
            business.service('table').update(todo.id, {
                PartitionKey: todo.partition,
                RowKey: todo.id,
                title: todo.title,
                done: !todo.done
            })
                .then(() => {
                    return business.service('table').find();
                })
                .then(this.set_todos);
        },

        edit(id) {
            let todo = this.todos.filter(t => t.id === id)[0];
            if(todo.edit_mode === false) {
                todo.edit_mode = !todo.edit_mode;
            } else {
                business.service('table').update(todo.id, {
                    PartitionKey: todo.partition,
                    RowKey: todo.id,
                    title: todo.title,
                    done: todo.done
                })
                    .then(() => {
                        return business.service('table').find();
                    })
                    .then(this.set_todos);
            }
        },

        filter_all() {
            this.query = (t) => t === t;
        },

        filter_not_done() {
            this.query = (t) => t.done === false;
        },

        remove(id) {
            let todo = this.todos.filter(t => t.id === id)[0];
            business.service('table').remove({
                PartitionKey: todo.partition,
                RowKey: todo.id,
                title: todo.title,
                done: todo.done
            })
                .then(() => {
                    return business.service('table').find();
                })
                .then(this.set_todos);
        },

        remove_done() {
            this.todos = this.todos.filter(t => t.done === false);
        },

        set_todos(res) {
            this.todos = JSON.parse(res.text).value.map(i => {
                return {
                    partition: i.PartitionKey,
                    id: i.RowKey,
                    title: i.title,
                    done: i.done,
                    edit_mode: false,
                    date: new Date(i.Timestamp)
                };
            });
        }
    },

    beforeMount() {
        this.todos = [];
        business.service('table').find().then(this.set_todos);
    }
});

Vue.config.devtools = true;