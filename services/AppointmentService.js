const appointment = require("../models/Appointments");
const mongoose = require("mongoose");
const AppointmentFactory = require("../factories/AppointmentFactory");
const Appo = mongoose.model("Appointment",appointment)
const mailer = require("nodemailer");



class AppointmentService{
    async Create(data){
        let {name, email, description, cpf, date, time} = data;
        var newAppo = new Appo({
            name,
            email,
            description,
            cpf,
            date,
            time,
            finished: false,
            notified: false
        })
        try {
            await newAppo.save();
            return true;
        } catch (err) {
            console.log(err)
            return false;
        }
    }
    async GetAll(showFinished){
        if(showFinished){
            return await Appo.find().sort({date:1});
        } else{
            let appos =  await Appo.find({'finished':false})
            let buildedAppos = [];
            appos.forEach((appo) => {
                let buildedAppo = AppointmentFactory.Build(appo);
                buildedAppos.push(buildedAppo);
            })
            return buildedAppos;
        }
    }
    async FindById(id){
        try {
            return await Appo.find({_id:id})
        } catch (err) {
            console.log(err)
        }
    }
    async Finish(id){
        try {
            await Appo.findByIdAndUpdate(id,{finished:true});
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    async Search(query){
        try {
            let appos = await Appo.find().or([{email: {$regex : query}},{cpf:{$regex : query}}]);
            return appos;
        } catch (err) {
            console.log(err);
            return [];
        }
        
    }
    async SendNotification(){
        try {
            let appos = await this.GetAll(false);
            var transporter = mailer.createTransport({
                host:"sandbox.smtp.mailtrap.io",
                port: 2525,
                auth:{
                    user:"f284005545301f",
                    pass:"05d5be1ead3a66"
                }
            })
            appos.forEach(app=>{
                let date = app.start.getTime();
                let hour = 1000 * 60 * 60;
                let gap = date-Date.now();
                if(gap <= hour&&gap>0){
                    if(!app.notified){
                        transporter.sendMail({
                            from: "Bruno Alcantara <bruno@gmail.com>",
                            to: app.email,
                            subject: "1 hora ou menos para sua consulta!",
                            text: "Consulta vai acontecer em breve"
                        }).then(async ()=>{
                            console.log("Email enviado para: " + app.email)
                            await Appo.findByIdAndUpdate(app.id,{notified: true})
                        }).catch(err=>{ console.log(err)})
                    }
                }
            })
        } catch (err) {
            console(err)
        }
    }
}

module.exports = new AppointmentService();