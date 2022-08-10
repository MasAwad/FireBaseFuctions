// firebase emulators:start --import=./savedData --export-on-exit; 
// firebase deploy --only functions

// 1-download country list with country code, currency code and currency name what you require:
// 2-convert it into csv.
// 3-convert csv into json from (https://codebeautify.org/csv-to-xml-json#).
// 4-validate json from https://jsonlint.com/
// 5-save in a file say test.json.
// 6-open firebase with login.
// 7-select database.
// 8-click on (...) in verticle, beside + - sign, 
// 9-click on import.
// 10-browse and select test.json file
// 11-import
// 12-now it is great!!!!!!! cheers!


const functions = require('firebase-functions');
const admin = require('firebase-admin');
// const { initializeApp } = require('firebase-admin/app');
// const { getAuth } = require('firebase-admin/auth');

  admin.initializeApp();
//   const app = initializeApp(firebaseConfig);
//   const auth = getAuth(app);

// ---------------------- Start ---------------------------
// async () => 
//           {
//             if(window.confirm('هل فعلا تريد غلق الحالة ؟')) {
//               setLoading(true);
                
//          if(reservation.doctor.id > 0 ) {
//             await firebase.firestore().collection('doctors').doc(reservation.doctor.id).get().then(doc => {

//                 const newDocData = docEARN(reservation.paid,doc.data());
//                 firebase.firestore().collection('doctors').doc(reservation.doctor.id).update({
                    
//                     balance: newDocData.balance ,
//                     earns: newDocData.earns ,
//                   });
//                 }
//                 );
//               }
           
//             let res = await firebase.functions().httpsCallable('createPatient')(reservation);
//               const closedDate = new Date();
//               await firebase.firestore().collection('logs').doc().set({
//                 code: parseInt(res.data.patientCode),
//                 phoneNumber: reservation.phoneNumber,
//                 date: reservation.date , // new Date(),
//                 closedDate: closedDate,
//                 doctorName: reservation.doctor ? reservation.doctor.name : 'غير متعاقد معه',
//                 doctorCode: parseInt(reservation.doctor.id) ,
//                 studyName: reservation.name ,
//                 radiations: reservation.radiations.map(r => r.name),
//                 totalPaied: reservation.moneyToPay ,
//                 totalRecieved: reservation.paid == null || reservation.paid == undefined ? 0 : reservation.paid,
//                 user: reservation.user ,
//                             });
// // localStorage.setItem('point',0); 
//               getBalance(reservation.paid);
//               firebase.firestore().collection('reservations').doc(reservation.phoneNumber).delete();
//               await firebase.firestore().collection('studies').doc(res.data.patientCode).update(
//                 {
//                 // name : reservation.name ,
//                 lastVisitDate: closedDate ,
//                 }
//               );

//               message.success('تمت عملية الدفع بنجاح !');

//             }
//           }

// ---------------------- END -----------------------------
async function createPatientAccount(phoneNumber) {
    let code = Math.floor(Math.random()*100000);
    // let password = Math.floor(1000000+Math.random()*1000000);
    try {
        // console.log("code > "+ code);
        // console.log("password > "+ password);
        
        const patient = await admin.auth().createUser({
            email: `${code}@ganna.com`,
            uid: `${code}`,
            password: `${phoneNumber}`
        });
        // const patient = await auth.createUser({
        //     email: `${code}@ganna.com`,
        //     uid: `${code}`,
        //     password: `${password}`,
        //     disabled: false,

        // });
        // return [patient, password, code];
        return code;
    }catch(e){
        console.log(e.message);
        console.log("No Patient Created ... ");
        return await createPatientAccount(); // an account exists with this code
    }
}
// ------------------ docEARN start 
async function docEARN(reservation){
    try {
        const docData = await admin.firestore().collection('doctors').doc(reservation.doctor.id).get() ;
    
        if (docData.exists){
            // docData.data();
            let waseet = {...docData.data()};
            let newEarn;
            newEarn = docData.data().earns.value[0] + reservation.paid ;
            // docData.data().earns.value[0] =  newEarn;
            waseet.earns.value[0] =  newEarn;
            // console.log("docData.data().earns.value[0] >> "+ docData.data().earns.value[0]);
            // console.log("waseet.earns.value[0] >> " + waseet.earns.value[0]);
            return waseet.earns ;
        }else {
            console.log("NO Doctor Data Returned");
            return null ;
        }
    }catch (e ){
        console.log(e.message);
         }
      
//    return docData;
}
  // ------------------- docEARN End 
exports.closePatient = functions.https.onCall(
  (reservation, context) => {
    console.log("DateString >> " + reservation.closedDate);
    console.log("reservation.date >> " + new Date(reservation.date.seconds*1000));
    console.log("New DateFunc >> " + new Date(reservation.closedDate));
    const getCurrenDate = (currentDate)=>{
       
        const currDay = (currentDate.getDate()< 10 ? '0' +currentDate.getDate() : currentDate.getDate()).toString();
        const monthNumber = ((currentDate.getMonth()+1) < 10 ? '0' + (currentDate.getMonth()+1) : (currentDate.getMonth()+1)).toString();
        const currYear = currentDate.getFullYear().toString();
        
        // localStorage.setItem('point1Date',currentDate.toDateString());
        const fullDate = currDay + monthNumber + currYear;
    
        // console.log('fullDate >>> ' + fullDate );
        return fullDate;
     }
    const getBalance = async (paid,currentDate) => {
        const fullDate= getCurrenDate(currentDate);
        console.log("fullDate >> " + fullDate);
    try{
            const pointBalance = await admin.firestore().collection('point1').doc(fullDate).get();
            if (pointBalance.exists){
                console.log('the Blanance is >>> ' + pointBalance.data().balance);
                const currentpoint = pointBalance.data().balance + paid ;
                // console.log('pointBalance.data().sumItems >> ' + pointBalance.data().sumItems);
                const lastSum = pointBalance.data().sumItems;
                const sell = paid + ' -- ' + (currentDate).toTimeString();
                // console.log ('sell >> ' + sell);
                lastSum.push(sell);
                // console.log('pointBalance.data().sumItems after > ' +'lastSum ' +lastSum+'  ' + pointBalance.data().sumItems);
                // setPoint(pointBalance.data().balance);
                // console.log('The point After adding the New Balance  ' + currentpoint);
                admin.firestore().collection('point1').doc(fullDate).update({
                        date : currentDate ,
                        balance: currentpoint ,
                        sumItems: lastSum,
                    });
                }
            else{ 
            await admin.firestore().collection('point1').doc(fullDate).set({
                    date : currentDate ,
                    balance: paid ,
                    sumItems: [paid],
                        });
            // console.log('This is the first case in The DAY is >> '+ point);
            }
        }catch (e ){
                console.log(e.message);
                }
    }
    if(!context.auth.token.adminDegree) return {message: 'access denied'};
    // if(reservation.doctor.id > 0 ) {
        
    //             }
        return ( async function(){
        
            // console.log(reservation.paid);
            // let newDocData = { mas:"Mohammed ",son:4500};
            let patientData = await admin.firestore()
            .collection('studies')
            .where('phoneNumber', '==', reservation.phoneNumber).get();
            let code ;
        if(patientData.docs.length === 0) {
            code = await createPatientAccount(reservation.phoneNumber);
            // return {patientCode: `${code}`, password: reservation.phoneNumber, isFirstTime: true};
            await admin.firestore().collection('studies').doc(`${code}`).set({
                name: reservation.name,
                password: reservation.phoneNumber,
                doctorID: reservation.doctor ? reservation.doctor.id : null,
                doctorName: reservation.doctor ? reservation.doctor.name : null,
                birthDate: reservation.birthDate,
                phoneNumber: reservation.phoneNumber,
                lastVisitDate:  new Date(reservation.date.seconds*1000) ,
                radiations: []
            });
        }else{
            code = patientData.docs[0].id ;

            // await admin.firestore().collection('studies').doc(res.data.patientCode).update(
            await admin.firestore().collection('studies').doc(code).update(
            
                {
                // name : reservation.name ,
                doctorID: reservation.doctor ? reservation.doctor.id : null,
                doctorName: reservation.doctor ? reservation.doctor.name : null,
                lastVisitDate: new Date(reservation.date.seconds*1000) ,
                }
              );
              
        }
      
        await admin.auth().setCustomUserClaims(`${code}`, {isPatient: true});
        
            // if(!context.auth.token.adminDegree) {console.log("Access Denied ");}
         
            // const [patient,code] = await createPatientAccount(reservation.phoneNumber);
            // console.log("patient >> " + patient)    ;
            // console.log("password >> " + password)    ;
            // console.log("code >> " + code);

            const newDocEarns = await docEARN(reservation);
            // console.log(newDocData);
            if (newDocEarns != null)
            {
                await admin.firestore().collection('doctors').doc(reservation.doctor.id).update(
                    {
                    // balance: newDocData.balance ,
                    // earns: newDocData.earns ,
                    earns: newDocEarns ,
                  }
                  );
            }
            // if(!context.auth.token.adminDegree) return {message: 'access denied'};
            
        
        await admin.firestore().collection('logs').doc().set({
            // code: parseInt(res.data.patientCode),
            code: parseInt(code),

            phoneNumber: reservation.phoneNumber,
            date:  new Date(reservation.date.seconds*1000) , // reservation.date , // new Date(),
            closedDate: new Date(reservation.closedDate),
            doctorName: reservation.doctor ? reservation.doctor.name : 'غير متعاقد معه',
            doctorCode: parseInt(reservation.doctor.id) ,
            studyName: reservation.name ,
            radiations: reservation.radiations.map(r => r.name),
            totalPaied: reservation.moneyToPay ,
            totalRecieved: reservation.paid == null || reservation.paid == undefined ? 0 : reservation.paid,
            user: reservation.user ,
                        });
        getBalance(reservation.paid,new Date(reservation.date.seconds*1000));
        
        await admin.firestore().collection('reservations').doc(reservation.phoneNumber).delete();

     // getBalance(reservation.paid,reservation.closedDate);
    
     // return {ok: true, patientCode: patientData.docs[0].id};
     console.log("CODE >> " + code);61394
     console.log("ClosedDate >> " + new Date(reservation.closedDate))
     return {ok: true, patientCode:code};
        
    }
      )();
  
  });

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
// |
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
        .collection('studies')
        .where('phoneNumber', '==', reservation.phoneNumber).get();
        if(patientData.docs.length === 0) {
            
            // const [patient, password, code] = await createPatientAccount(reservation.phoneNumber);
            const code = await createPatientAccount(reservation.phoneNumber);
            await admin.firestore().collection('studies').doc(`${code}`).set({

                name: reservation.name,
                // password: password,
                password: reservation.phoneNumber,
                doctorID: reservation.doctor ? reservation.doctor.id : null,
                doctorName: reservation.doctor ? reservation.doctor.name : null,
                birthDate: reservation.birthDate,
                phoneNumber: reservation.phoneNumber,
                radiations: []
             });
            await admin.auth().setCustomUserClaims(`${code}`, {isPatient: true});
// admin.js Line 212
            // return {patientCode: `${code}`, password: password, isFirstTime: true};
            return {patientCode: `${code}`, password: reservation.phoneNumber, isFirstTime: true};
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