const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const AppointmentService = require("./services/AppointmentService")

app.use(express.static("public"))

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());

app.set('view engine','ejs')

mongoose.connect("mongodb://localhost:/stealth-mongodb",{useNewUrlParser: true, useUnifiedTopology: true})

app.get("/",(req,res)=>{
    res.send("Bem-vindo ao app agendamento.")
})

app.get("/cadastro",(req,res)=>{
    res.render("Create");
})
app.get("/sistema",async (req,res)=>{
    res.render("Index");
})
app.post("/create", async (req,res)=>{
    let status = await AppointmentService.Create(req.body);
    if(status){
        res.redirect("/sistema?s=1");
    }else{
        res.send("Erro ao criar consulta")
    }
})
app.get("/consultas", async (req,res)=>{
    var appointments  = await AppointmentService.GetAll(false);
    res.json(appointments)
})
app.get("/event/:id", async (req,res)=>{
    let appo =  await AppointmentService.FindById(req.params.id)
    appo[0].date.setDate(appo[0].date.getDate()+1);
    res.render("Appointment",{appo});
})

app.post("/finish",async (req,res)=>{
    var id = req.body.id;
    var result = await AppointmentService.Finish(id);
    if(result){
        res.status(200);
        res.redirect("/sistema?u=1");
    }else{
        res.redirect("/sistema?e=1");
    }
})

app.get("/list", async (req,res)=>{
    var appos = await AppointmentService.GetAll(true);
    res.render("List",{appos})
})

app.get("/findappo",async (req,res)=>{
    let query  = req.query.search;
    let appos = await AppointmentService.Search(query);
    res.render("List",{appos})

})

var polltime = 5000
setInterval(async() => {
    await AppointmentService.SendNotification();
},polltime)

app.listen(8080,()=>{
    console.log(`Servidor ligado na porta 8080...`);
})