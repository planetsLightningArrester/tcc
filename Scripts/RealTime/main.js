let SerialPort = require('serialport');
let daqMaster;

process.stdin.resume();

SerialPort.list(function (err, ports) {
    // console.log(ports);
    ports.forEach(function (port) {
        if (port.vendorId == '0001' && port.productId == '0001') {
            daqMaster = new SerialPort(port.comName.toString(), {
                baudRate: 2000000
            }, function (err) {
                if (err) {
                    console.log(err.message);
                } else {
                    console.log("Conectado ao DAq Master");

                    daqMaster.write("start");

                    daqMaster.on('data', function (data) {
                        console.log(data);
                    })
                    daqMaster.on("error", function (err) {
                        console.log(err.message)
                    })
                    daqMaster.on("close", function () {
                        console.log("Porta fechada");
                    })
                }
            });
        }
    });
});
process.on('uncaughtException', function () {
    console.log("Fechando");
    if (daqMaster) {
        daqMaster.close();
    }
});

// let fft = require("ezfft").fft
// var express = require('express');
// var appExpress = express();
// var http = require('http').Server(appExpress);

// /*Express configuration*/
// appExpress.use("/", express.static(__dirname + "/"));

// appExpress.get('/', function (req, res) {
//     res.sendFile(__dirname + '/index.html');    //Name of your local web page
// });

// http.listen(8013, function () {
//     console.log('With your browser, access "localhost:8013"');
// });

// //npm install socket.io
// var io = require('socket.io')(http);

// /*Socket configuration*/
// io.on('connection', function (socket) {

//     console.log("LETS START");

//     setInterval(function () {
//         let signal = [];        //Array with the Y axis (amplitude in time)
//         let time = [];          //Array with the X axis (time)

//         let amplitude = [];     //Array with the Y axis (amplitude in frequency)
//         let frequency = [];     //Array with the X axis (frequency)

//         let f =60;              //Your signal frequency
//         let fs = 1000;          //Your sample rate
//         let samplingTime = 1;   //Period that the signal was sampled

//         for(let t = 0; t < samplingTime; t += 1/fs){
//             signal.push(180*Math.sin(2*Math.PI*f*t) + 20*Math.sin(2*Math.PI*2*f*t) + 2*Math.sin(2*Math.PI*3*f*t));
//             time.push(t);
//         }

//         socket.emit("time", signal, time);

//         [amplitude, frequency] = fft(signal, fs); 

//         socket.emit("fft", amplitude, frequency);

//     }, 2000);       //Update rate in sec
// });