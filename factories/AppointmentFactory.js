class AppointmentFactory{
    Build(simpleAppointment){
        let day = simpleAppointment.date.getDate()+1;
        let month = simpleAppointment.date.getMonth();
        let year = simpleAppointment.date.getFullYear();
        let hour = Number.parseInt(simpleAppointment.time.split(":")[0]);
        let minute = Number.parseInt(simpleAppointment.time.split(":")[1]);

        let startDate = new Date(year,month,day,hour,minute,0,0);
        let endDate = new Date(year,month,day,hour+1,minute,0,0);
        let appo = {
            id: simpleAppointment._id,
            title: simpleAppointment.name + " - " + simpleAppointment.description,
            start: startDate,
            end: endDate,
            notified: simpleAppointment.notified,
            email: simpleAppointment.email
        }
        return appo;
    }
}

module.exports = new AppointmentFactory();