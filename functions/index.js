// firebase emulators:start --import=./savedData --export-on-exit; 

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp()


async function createPatientAccount() {
    let code = Math.floor(Math.random()*100000);
    let password = Math.floor(1000000+Math.random()*1000000);
    try {

        const patient = await admin.auth().createUser({
            email: `${code}@ganna.com`,
            uid: `${code}`,
            password: `${password}`
        });

        return [patient, password, code];
    }catch(e){
        console.log(e.message);
        
        return await createPatientAccount(); // an account exists with this code
    }
}


exports.createAdmin = functions.https.onCall((data, context) => {
    if(context.auth.token.adminDegree < 2 || !context.auth.token.adminDegree) {
        return {message: 'access denied'};
    }
    return (async function() {
                
        let user = await admin.auth().createUser(data);
        await admin.auth().setCustomUserClaims(user.uid, {adminDegree: data.adminDegree});
        return {ok: true, adminID: user.uid};
    })();
});

exports.deleteAdmin = functions.https.onCall((data, context) => {
    if(context.auth.token.adminDegree < 2 || !context.auth.token.adminDegree) {
        return {message: 'access denied'};
    }
    
    return admin.auth().deleteUser(data.adminID).then(() => {
        return {ok: true};
    });
});

exports.createAccountant = functions.https.onCall((data, context) => {
    if(context.auth.token.adminDegree < 2 || !context.auth.token.adminDegree) {
        return {message: 'access denied'};
    }
    return (async function() {

        let user = await admin.auth().createUser({
            email: data.email,
            password: data.password,
        });

        await admin.auth().setCustomUserClaims(user.uid, {clinicID: data.clinicID});

        await admin.firestore().collection('clinics')
        .doc(data.clinicID)
        .collection('accountants').doc(user.uid).set({
            name: data.name,
            phoneNumber: data.phoneNumber,
            password: data.password
        });

        return {ok: true};
    })();
});

exports.createDoctor = functions.https.onCall((data, context) => {
    if(context.auth.token.adminDegree < 2 || !context.auth.token.adminDegree) {
        return {message: 'access denied'};
    }

    return (async function() {
        try {
            let doctor = await admin.auth().createUser({
                email: `${data.code}@ganna.com`,
                password: data.password,
                uid: data.code
            });

            admin.auth().setCustomUserClaims(doctor.uid, {
                isDoctor: true,
                doctorClinic: data.clinicID
            });
            return {ok: true};
        }catch(e) {
            console.log(e.message);
            return {message: 'غالبا هذا الكود ملك لطبيب اخر'}
        }
    })();
    
})

exports.makeReservation = functions.https.onCall((data, context) => {
    console.log(data.birthDate);
    // window.alert(' From makeReservation Function');
    
    return (async function() {
        // console.log(data.doctor);
        console.log(data);

        if (data.type !=='inside'){

        //     let radiations = [];
        //     if (data.radiations.length != 0){
        //     for(let i=0;i<data.radiations.length;i++) {

        //         let doc = await admin.firestore().collection('radiations').doc(data.radiations[i]).get();
        //         if(!doc.exists) {
        //             return {message: 'something went wrong'};
        //         }
        //         radiations.push(doc.data());
        //     }
        // }
         await admin.firestore().collection('reservations').doc(data.phoneNumber).set({
             type: data.type,
            accepted: false,
            name: data.name,
            phoneNumber: data.phoneNumber,
                    // suggestedDate: new Date(data.suggestedDate),
            birthDate: data.birthDate ? new Date(data.birthDate) : null,
            date: null,
                    // moneyToPay: null,
                    // doctorEarns: null,
            radiations: data.radiations,
            doctor: data.doctor ? {
                name: data.doctor.name,
                id: data.doctor.id
                        } : null               
        });
        return {
            ok: true,
            reservation: 'outside' } ;

    }else {    // The Reservation is from inside the Site
        await admin.firestore().collection('reservations').doc(data.phoneNumber).set({
            type: data.type,
            accepted: true,
            name: data.name,
            phoneNumber: data.phoneNumber,
            // suggestedDate: new Date(data.suggestedDate),
            birthDate: data.birthDate ? new Date(data.birthDate) : null,
            date: new Date(data.date),
            moneyToPay: data.moneyToPay,
            doctorEarns: data.doctorEarns,
            radiations: data.radiations,
            doctor: data.doctor ,
            paid: data.paid ? data.paid : null ,
            afterDiscount: data.afterDiscount ,
            user: data.user 
        });
        return {
            ok: true,
            reservation: 'inside' } ;
      }
        
    })();
});


exports.createPatient = functions.https.onCall((reservation, context) => {
    if(!context.auth.token.adminDegree) return {message: 'access denied'};

    return (async () => {
        let patientData = await admin.firestore()
        .collection('studies').where('phoneNumber', '==', reservation.phoneNumber).get();
        if(patientData.docs.length === 0) {
            
            const [patient, password, code] = await createPatientAccount(reservation.phoneNumber);
            
            await admin.firestore().collection('studies').doc(`${code}`).set({

                name: reservation.name,
                password: password,
                doctorID: reservation.doctor ? reservation.doctor.id : null,
                doctorName: reservation.doctor ? reservation.doctor.name : null,
                birthDate: reservation.birthDate,
                phoneNumber: reservation.phoneNumber,
                radiations: []
            });
            await admin.auth().setCustomUserClaims(`${code}`, {isPatient: true});

            return {patientCode: `${code}`, password: password, isFirstTime: true};
        }

        return {ok: true, patientCode: patientData.docs[0].id};

    })();
});

exports.updateDoctorPassword = functions.https.onCall((data, context) => {
    if(context.auth.token.adminDegree < 2 || !context.auth.token.adminDegree) {
        return {message: 'access denied'};
    }

    return admin.auth().updateUser(data.doctorID, {
        password: data.password,

    }).then(() => {
        return {ok: true};
    });
});