const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const moment = require('moment');
const session = require('express-session');
const flash = require('connect-flash');
const Pagamento = require("./models/Pagamento");

//FORMATAR DATA
app.engine('handlebars', handlebars({
    defaultLayout: 'main',
    helpers: {
        formatDate: (date) => {
            return moment(date).format('DD/MM/YYYY');
        }
    }
}));

//HANDLEBARS
app.set('view engine', 'handlebars');

//BODY-PARSE
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Sessão
app.use(session({
    secret: 'julioonesession',
    resave: true,
    saveUninitialized: true
}))
app.use(flash())

//Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    next();
})

//ROTAS

//LISTAR PAGAMENTO
app.get('/pagamento', function (req, res) {
    Pagamento.findAll({ order: [['id', 'Desc']] }).then(function (pagamentos) {
        res.render('pagamento', { pagamentos: pagamentos.map(id => id.toJSON()) });
    })

});

//MOSTRAR FORMULARIO DE CADASTRO
app.get('/cad-pagamento', function (req, res) {
    res.render("cad-pagamento");
});

//CADASTRAR UM NOVO PAGAMENTO
app.post('/add-pagamento', function (req, res) {
    Pagamento.create({
        nome: req.body.nome,
        valor: req.body.valor
    }).then(function () {
        req.flash("success_msg", "Pagemneto cadastrado com sucesso!");
        res.redirect('/pagamento');
    }).catch(function (erro) {
        req.flash("error_msg", "Erro: Pagamento não foi cadastrado com sucesso!");
    });
});

//MOSTRAR FORMULARIO DE EDITAR PAGAMENTO
app.get('/edit-pagamento/:id', function (req, res) {
    Pagamento.findByPk(req.params.id)
        .then(post => {
            res.render('edit-pagamento', {
                id: req.params.id,
                nome: post.nome,
                valor: post.valor
            })
        })
        .catch(function (erro) {
            req.flash('error_msg', 'Erro: Pagamento não encontrado!')
        })
});

//EDITAR NO BANCO DE DADOS O PAGAMENTO
app.post('/upadte-pagamento/:id', function (req, res) {
    Pagamento.update({
        nome: req.body.nome,
        valor: req.body.valor
    },{
        where: {id: req.params.id}
    }).then(function(){
        req.flash("success_msg", "Pagamento editado com sucesso!");
        res.redirect('/pagamento');
    }).catch(function(error){
        req.flash("error_msg", "Erro: Pagamento não editado com sucesso!");
    })
});


//DELETAR UM PAGAMENTO
app.get('/del-pagamento/:id', function (req, res) {
    Pagamento.destroy({
        where: { 'id': req.params.id }
    }).then(function () {
        req.flash("success_msg", "Pagamento apagado com sucesso!");
        res.redirect('/pagamento');
    }).catch(function (error) {
        req.flash("error_msg", "Erro: Pagamento não apagado com sucesso!");
    })
})

//INICIAR API NA PORTA 3000
app.listen(3000, () => {
    console.log("API ONLINE");
});