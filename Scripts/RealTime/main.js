require('console-super');
let SerialPort = require('serialport');
let daqMaster = 0;
let gotCtrlC = false;
let timer = 0;
let counter = 0;

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

                    // daqMaster.write("r3p0:blink");
                    daqMaster.write("start");
                    timer = new Date();
                    daqMaster.on('data', function (data) {
                        console.log(data.toString());
                        counter += data.length;
                        if (counter >= 31*1340) {
                            counter -= 31*1340;
                            timer = (new Date()) - timer;
                            console.inlineTimeTag(timer);
                            timer = new Date();
                        }
                    })
                    daqMaster.on("error", function (err) {
                        console.log(err.message)
                    })
                    daqMaster.on("close", function () {
                        console.log("Porta fechada");
                        if (gotCtrlC) {
                            process.exit();
                        }
                    })
                }
            });
        }
    });
});
process.on('SIGINT', function () {
    console.log("Closing app");
    if (daqMaster != 0) {
        gotCtrlC = true;
        daqMaster.write("stop");
        setTimeout(function(){
            try{
                daqMaster.close();
            }
            catch (error){
                process.exit();
            }
        }, 1)
    } else {
        process.exit();
    }
})

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