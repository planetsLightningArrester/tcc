let _analogActivesDAq = [true, false, false, false, false, false];
let _analogLabels = [{
    daqName: "DAq0",
    channelName: ["Canal 0", "Canal 1", "Canal 2", "Canal 3"],
    activesChannels: [true, false, false, false],
}];

let analogStarted = false;

function analogVibration() {
    _sampleRate = 5000;

    $('body').append("<img src = \"./art/kotLogoSVGColorida.svg\" id = \"bottomRightKotBackgroundImage\"/>");

    //Append control panels
    $('body').append("<div id = \"controlPanelDiv\" class = \"flex\" style = \"position: absolute; top: 5vh; left: 27vw; width: 65vh; height: 70vh; margin-top: 0.5vh\"></div>");

    setTimeout(function () {
        /*Upper control panel*/

        /*Test name*/
        $('#controlPanelDiv').append("<div id = \"testInfos\" class = \"flex\" style = \"background: linear-gradient(to bottom right, #70b9f4, #63a4d8); border: .05vh solid #43a044; border-radius: .7vh 1.4vh; width: 65vh; height: 8vh; margin-top: 0.3vh\"></div>");
        $('#testInfos').append("<input type = \"text\" value = \"Cliente\" id = \"clientId\" style = \"position: relative; top: 1.7vh; margin-left: 4.3vh; text-align: center; font-size: 2.3vh; border-radius: 1.3vh; width: 18vh; height: 4vh\" onchange = \"changeClient(this.value)\"></input>");
        $('#testInfos').append("<input type = \"text\" value = \"Máquina\" id = \"machineId\" style = \"position: relative; top: 1.7vh; margin-left: .3vh; text-align: center; font-size: 2.3vh; border-radius: 1.3vh; width: 18vh; height: 4vh\" onchange = \"changeMachine(this.value)\"></input>");
        $('#testInfos').append("<input type = \"text\" value = \"Responsável\" id = \"workerId\" style = \"position: relative; top: 1.7vh; margin-left: .3vh; text-align: center; font-size: 2.3vh; border-radius: 1.3vh; width: 18vh; height: 4vh\" onchange = \"changeWorker(this.value)\"></input>");

        /*DAq0 */
        $('#controlPanelDiv').append("<div id = \"daq0Div\" class = \"flex\" style = \"background: linear-gradient(to bottom right, #81e282, #62ad63); border: .05vh solid #43a044; border-radius: .7vh 1.4vh; width: 65vh; height: 15vh; margin-top: 0.3vh\"></div>");
        $('#daq0Div').append("<input type = \"text\" class = \"accName\" value = \"DAq0\" id = \"daq0Name\" size = 6 onchange = \"changeDAqName(this.value, \'0\')\"></input>");
        $('#daq0Div').append("<div class = \"flex\" style = \"position: relative; left: 44vh; top: -3vh\"><a class = \"blinkButton\" id = \"daq0Button\" onclick = \"blinkDAq(\'0\')\">Piscar</a></div>");
        $('#daq0Div').append("<input type = \"checkbox\" id = \"daq0channel0CheckBox\" style = \"position: relative; top: 3vh; left: 5vh; width: 2.2vh; height: 2.8vh; transition: 0.5s;\" onchange = \"channelEnableCheck(this.id)\"></input>");
        $('#daq0Div').append("<input type = \"text\" value = \"Canal 0\" id = \"channel0Name\" size = 5 style = \"position: relative; top: 2vh; left: 5vh; text-align: center; width: 16vh; height: 3.5vh; border-radius: 1.3vh; font-size: 2vh; transition: 0.5s;\" onchange = \"changeChannelName(this.value)\"></input>");
        $('#daq0Div').append("<input type = \"checkbox\" id = \"daq0channel1CheckBox\" style = \"position: relative; top: 7vh; left: -14vh; width: 2.2vh; height: 2.8vh; transition: 0.5s;\" onchange = \"channelEnableCheck(this.id)\"></input>");
        $('#daq0Div').append("<input disabled type = \"text\" value = \"Canal 1\" id = \"channel1Name\" size = 5 style = \"position: relative; top: 6vh; left: -14vh; text-align: center; width: 16vh; height: 3.5vh; border-radius: 1.3vh; font-size: 2vh; transition: 0.5s;\" onchange = \"changeChannelName(this.value)\"></input>");
        $('#daq0Div').append("<input type = \"checkbox\" id = \"daq0channel2CheckBox\" style = \"position: relative; top: 3vh; left: -8vh; width: 2.2vh; height: 2.8vh; transition: 0.5s;\" onchange = \"channelEnableCheck(this.id)\"></input>");
        $('#daq0Div').append("<input disabled type = \"text\" value = \"Canal 2\" id = \"channel2Name\" size = 5 style = \"position: relative; top: 2vh; left: -8vh; text-align: center; width: 16vh; height: 3.5vh; border-radius: 1.3vh; font-size: 2vh; transition: 0.5s;\" onchange = \"changeChannelName(this.value)\"></input>");
        $('#daq0Div').append("<input type = \"checkbox\" id = \"daq0channel3CheckBox\" style = \"position: relative; top: 7vh; left: -27vh; width: 2.2vh; height: 2.8vh; transition: 0.5s;\" onchange = \"channelEnableCheck(this.id)\"></input>");
        $('#daq0Div').append("<input disabled type = \"text\" value = \"Canal 3\" id = \"channel3Name\" size = 5 style = \"position: relative; top: 2.5vh; left: 33vh; text-align: center; width: 16vh; height: 3.5vh; border-radius: 1.3vh; font-size: 2vh; transition: 0.5s;\" onchange = \"changeChannelName(this.value)\"></input>");

        //Add daq button
        $('#controlPanelDiv').append("<div id = \"addDAqPanelDiv\" class = \"flex\" style = \"cursor: pointer; border: .2vh solid #43a044; border-radius: 1.4vh 1.4vh; width: 65vh; height: 8vh; margin-top: 0.3vh; transition: 0.5s;\" onclick = \"addDAq()\"><img src = \"./art/plus.png\" style = \"position: relative; top: 1vh; left: 30vh; height: 5vh; transition: 0.5s;\"/></div>");

        //Partition div
        $('#controlPanelDiv').append("<div id = \"partitionDiv\" class = \"flex\" style = \"background: linear-gradient(to bottom right, #70b9f4, #63a4d8); border: .05vh solid #38a1f4; border-radius: .7vh 1.4vh; width: 65vh; height: 9.5vh; margin-top: 0.3vh; transition: 0.5s;\"></div>");
        //Partition options
        $('#partitionDiv').append("<label style = \"position: relative; top: -0.5vh; left: 19vh; font-size: 2.3vh; transition: 0.5s;\">Particionar arquivo a cada:</label>");
        $('#partitionDiv').append("<input type = \"checkbox\" id = \"partitionCheckBox\" style = \"position: relative; top: 4vh; left: -6vh; width: 2.2vh; height: 2.8vh; transition: 0.5s;\" onchange = \"partitionEnableCheck(this.id)\"></input>");
        $('#partitionDiv').append("<input disabled type = \"text\" value = 15 id = \"partitionTimeSizeId\" size = 5 style = \"position: relative; top: 3vh; left: -5vh; text-align: center; width: 11vh; height: 3.5vh; border-radius: .3vh; font-size: 2vh; transition: 0.5s;\" onchange = \"changePartitionSize(this.value)\"></input>");
        $('#partitionDiv').append("<select disabled id = \"partitionTypeId\" style = \"position: relative; top: 3vh; left: -4vh; width: 8vh; height: 3vh; border-radius: 0.3vh; font-size: 2vh; transition: 0.5s;\" onchange = \"changePartitionType(this.value)\" name = \"tipo\"><option value = \"min\" selected>min</option><option value = \"MB\">MB</option></select>");

        //Folder div
        $('#controlPanelDiv').append("<div id = \"folderDiv\" class = \"flex\" style = \"background: linear-gradient(to bottom right, #70b9f4, #63a4d8); border: .05vh solid #38a1f4; border-radius: .7vh 1.4vh; width: 65vh; height: 8vh; margin-top: 0.3vh\"></div>");
        //Path options
        $('#folderDiv').append("<label style = \"position: relative; top: 0.3vh; left: 2vh; font-size: 2.3vh;\">Diretório</label>");
        $('#folderDiv').append("<input type = \"text\" value = \"" + pathToSave + "\" id = \"pathId\" style = \"position: relative; top: 3vh; left: -2vh; text-align: center; font-size: 2vh; border-radius: .3vh; width: 50vh; height: 3vh\" onchange = \"changePath(this.value)\"></input>");

        //Start stop button
        $('#controlPanelDiv').append("<div class = \"flex\"><a class = \"startButton\" id = \"startStopButtonId\" onclick = \"startAnalogCmd()\">Iniciar</a></div>");

    }, 0);

    //Comentar a linha abaixo quando parar de carregar o analogVibration direto na inicializacao
    comSelected = "COM23";

    var serialport = require("serialport");

    var STM32port = new serialport(comSelected, {
        baudRate: 12000000,
        parser: new serialport.parsers.Readline("OK")
    }, function (err) {
        if (err) {
            console.log((err.message).toString());
        }

    });
    globalSTMport = STM32port;

    globalSTMport.on('data', function (data) {
        if (analogStarted)
            updateAnalogData(data);
    });
    globalSTMport.write("analog");

    sampleCounter = 0;
    //millisecondsCounter = +new Date();

}

function updateAnalogData(data) {
    //console.log(data);

    let pipe = data[4] - 48;

    let dataPipe = new Array(4);

    //Ch0
    if (_analogLabels[pipe].activesChannels[0])
        dataPipe[0] = ((((data[6] << 8) & 0xFF00) + (data[7] & 0xFF)) * 0.05 - 50).toFixed(2);
    else
        dataPipe[0] = 0;
    //Ch1
    if (_analogLabels[pipe].activesChannels[1])
        dataPipe[1] = ((((data[8] << 8) & 0xFF00) + (data[9] & 0xFF)) * 0.05 - 50).toFixed(2);
    else
        dataPipe[1] = 0;
    //Ch2
    if (_analogLabels[pipe].activesChannels[2])
        dataPipe[2] = ((((data[10] << 8) & 0xFF00) + (data[11] & 0xFF)) * 0.05 - 50).toFixed(2);
    else
        dataPipe[2] = 0;
    //Ch3
    if (_analogLabels[pipe].activesChannels[3])
        dataPipe[3] = ((((data[12] << 8) & 0xFF00) + (data[13] & 0xFF)) * 0.05 - 50).toFixed(2);
    else
        dataPipe[3] = 0;

    //Tempo
    dataPipe[4] = 0xFFFFFFFF & ((0xFF000000 & (data[14] << 24)) + (0xFF0000 & (data[15] << 16)) + (0xFF00 & (data[16] << 8)) + (0xFF & data[17]));
    dataPipe[4] = dataPipe[4] / _sampleRate;

    // console.log(dataPipe[0]);
    // console.log(dataPipe[1]);
    // console.log(dataPipe[2]);
    // console.log(dataPipe[3]);

    // //X
    // dataPipe[0] = +(_2Complement2Float((0xFF00 & (data[6]<<8)) + (0x00FF & data[7]))*(16/4095)).toFixed(3);
    // //Y
    // dataPipe[1] = +(_2Complement2Float((0xFF00 & (data[8]<<8)) + (0x00FF & data[9]))*(16/4095)).toFixed(3);
    // //Z
    // dataPipe[2] = +(_2Complement2Float((0xFF00 & (data[10]<<8)) + (0x00FF & data[11]))*(16/4095)).toFixed(3);
    // //Bateria
    // dataPipe[3] = +(2*data[12]/100).toFixed(2);
    // //Tempo
    // dataPipe[4] = 0xFFFFFFFF & ((0xFF000000 & (data[13]<<24)) + (0xFF0000 & (data[14]<<16)) + (0xFF00 & (data[15]<<8)) + (0xFF & data[16]));
    // dataPipe[4] = 1000*dataPipe[4]/_sampleRate;

    // _analogBatteriesLevel[pipe] = batteryLevel.toFixed(0);

    // //$("#daq" + pipe.toString() + "BatteryLevel").html(batteryLevel.toFixed(0) + "%");

    analogSendToServer(pipe, dataPipe, dataPipe[4]);

}

function analogSendToServer(pipe, dataPipe, time) {
    socket.emit("daq" + pipe.toString() + "data", dataPipe, time);
}


function addDAq() {
    if (_analogLabels.length >= 6) {
        alert("Numero máximo de DAqs atingido");
        return 0;
    } else {
        let newDAq;
        for (var i = 0; i < 6; i++) {
            if (!_analogActivesDAq[i]) {
                newDAq = i;
                _analogActivesDAq[i] = true;
                _analogLabels.splice(newDAq, 0, "DAq" + newDAq.toString());
                i = 6;
            }
        }
        globalSTMport.write('enablePipe' + newDAq.toString());
        $("<div id = \"daq" + newDAq.toString() + "Div\" class = \"flex\" style = \"background: linear-gradient(to bottom right, #81e282, #62ad63); border: .05vh solid #43a044; border-radius: .7vh 1.4vh; width: 65vh; height: 8vh; margin-top: 0.3vh\"></div>").insertBefore("#addDAqPanelDiv");
        $('#daq' + newDAq.toString() + 'Div').append("<input type = \"text\" class = \"daqName\" value = \"DAq" + newDAq.toString() + "\" id = \"daq" + newDAq.toString() + "Name\" size = 6 onchange = \"changeDAqName(this.value, \'" + newDAq.toString() + "\')\"></input>");
        //$('#daq' + newDAq.toString() + 'Div').append("<label id = \"daq" + newDAq.toString() + "BatteryLevel\" class = \"daqBatteryLevel\">100%</label>");
        //$('#daq' + newDAq.toString() + 'Div').append("<img src = \"./art/half-battery.png\" class = \"daqBatteryImage\"/>");
        $('#daq' + newDAq.toString() + 'Div').append("<div class = \"flex\" style = \"position: relative; left: 44vh; top: -3vh\"><a class = \"blinkButton\" id = \"daq" + newDAq.toString() + "Button\" onclick = \"blinkDAq(\'" + newDAq.toString() + "\')\">Piscar</a></div>");
        $('#daq' + newDAq.toString() + 'Div').append("<img src = \"./art/remove.png\" id = \"daq" + newDAq.toString() + "RemoveImg\" class = \"daqRemoveImage\" onclick = \"removeDAq(\'" + newDAq.toString() + "\')\"/>");
    }
    console.log(_analogLabels);
}

function removeDAq(daq) {
    let numbOfActivesDAqs = 0;
    _analogActivesDAq[parseInt(daq)] = false;

    _analogActivesDAq.forEach(function (element) {
        if (element)
            numbOfActivesDAqs++;
    });

    _analogLabels.splice(_analogLabels.indexOf($("#daq" + daq + "Name").val()), 1);
    //_analogLabels.splice(parseInt(daq) - Math.abs(parseInt(daq) - numbOfActivesDAqs + 1), 1);
    $("#daq" + daq + "Div").detach();
    globalSTMport.write('disablePipe' + daq.toString());
    console.log(daq);
    console.log(_analogLabels);
}

function blinkDAq(pipe) {
    $('#daq' + pipe.toString() + 'Button').css('animation', 'blink 1s alternate infinite');
    globalSTMport.write("pipe" + pipe.toString() + ":blink");

    setTimeout(function () {
        $('#daq' + pipe.toString() + 'Button').attr("onclick", "NotBlinkDAq('" + pipe + "')");
    }, 10);
}

function NotBlinkDAq(pipe) {
    $('#daq' + pipe.toString() + 'Button').css('animation', '');
    globalSTMport.write("pipe" + pipe.toString() + ":!blink");

    setTimeout(function () {
        $('#daq' + pipe.toString() + 'Button').attr("onclick", "blinkDAq('" + pipe + "')");
    }, 10);
}

function startAnalogCmd() {
    analogStarted = true;
    socket.emit("create analog header", _analogLabels, _analogActivesDAq);

    _analogActivesDAq.forEach((elements, index) => {
        if (elements) {
            setTimeout(function () {
                globalSTMport.write("pipe" + index.toString() + ":start");
            }, 10 * index);
        }
        //globalSTMport.write("pipe" + index.toString() + ":IniciarSemFiltro1");
    });

    $("#startStopButtonId").html("Parar");

    setTimeout(function () {
        $("#startStopButtonId").attr("onclick", "stopAnalogCmd()");
        $("#startStopButtonId").attr("class", "stopButton");
    }, 10);

    //disableAllElements();

    console.log(_analogLabels);

}

function stopAnalogCmd() {
    analogStarted = false;

    _analogActivesDAq.forEach((elements, index) => {
        if (elements) {
            setTimeout(function () {
                globalSTMport.write("pipe" + index.toString() + ":stop");
            }, 200 * index);
        }
        //globalSTMport.write("pipe" + index.toString() + ":Parar");
    });
    // Object.keys(_analogLabels).forEach((index)=>{
    //     setTimeout(function(){
    //         globalSTMport.write("pipe" + index.toString() + ":stop");
    //     }, 10*index);
    //     //globalSTMport.write("pipe" + index.toString() + ":Parar");
    // });

    $("#startStopButtonId").html("Iniciar");

    setTimeout(function () {
        $("#startStopButtonId").attr("onclick", "startAnalogCmd()");
        $("#startStopButtonId").attr("class", "startButton");
        socket.emit("stop analog", _analogLabels);
    }, 10);

    //enableAllelements();
}

function changeClient(client) {
    socket.emit("change client", client);
}

function changeMachine(machine) {
    socket.emit("change machine", machine);
}

function changeWorker(worker) {
    socket.emit("change worker", worker);
}

function changeDAqName(val, daq) {
    _analogLabels[daq] = val;
}

function channelEnableCheck(id) {
    id = id.toString();
    if ($("#" + id).prop("checked")) {
        $("#channel0Name").removeAttr("disabled");
        socket.emit('turn partition', true, $("#partitionTimeSizeId").val(), $("#partitionTypeId").val());
    } else {
        socket.emit('turn partition', false, $("#partitionTimeSizeId").val(), $("#partitionTypeId").val());
        $("#partitionTypeId").attr("disabled", "true");
        $("#partitionTimeSizeId").attr("disabled", "true");
    }
}

function changeChannelName(id) {

}

function changePath(newPath) {
    if (newPath.includes(".txt")) {
        alert("Selecione apenas o diretório. Os arquivos serão gerados com nomes de acordo com os acelerometros.");
        $('#pathId').attr('value', pathToSave);
    } else {
        pathToSave = newPath;
        socket.emit('change path', newPath);
    }
}

function partitionEnableCheck(id) {
    id = id.toString();
    if ($("#" + id).prop("checked")) {
        $("#partitionTypeId").removeAttr("disabled");
        $("#partitionTimeSizeId").removeAttr("disabled");
        socket.emit('turn partition', true, $("#partitionTimeSizeId").val(), $("#partitionTypeId").val());
    } else {
        socket.emit('turn partition', false, $("#partitionTimeSizeId").val(), $("#partitionTypeId").val());
        $("#partitionTypeId").attr("disabled", "true");
        $("#partitionTimeSizeId").attr("disabled", "true");
    }

}

function changePartitionType(newType) {
    socket.emit('change partition type', newType);
}

function changePartitionSize(newSize) {
    socket.emit('change partition size', newSize);
}

function analogDisableAllElements() {
    $("#clientId").attr("disabled", "true");
    $("#machineId").attr("disabled", "true");
    $("#workerId").attr("disabled", "true");

    for (let i = 0; i < 6; i++) {
        if ($("#acc" + i.toString() + "Name").length) {
            if (i != 0)
                $("#acc" + i.toString() + "RemoveImg").attr("disabled", "true");
            $("#acc" + i.toString() + "Name").attr("disabled", "true");
            $("#acc" + i.toString() + "Button").attr("disabled", "true");
        }
    }

    $(".blinkButton").hide();

    $("#addDAqPanelDiv").hide();

    $(".accRemoveImage").hide();

    $("#partitionCheckBox").attr("disabled", "true");

    $("#partitionTimeSizeId").attr("disabled", "true");
    $("#partitionTypeId").attr("disabled", "true");

    $("#pathId").attr("disabled", "true");

}

function analogEnableAllelements() {
    $("#clientId").removeAttr("disabled");
    $("#machineId").removeAttr("disabled");
    $("#workerId").removeAttr("disabled");

    for (let i = 0; i < 6; i++) {
        if ($("#acc" + i.toString() + "Name").length) {
            if (i != 0)
                $("#acc" + i.toString() + "RemoveImg").removeAttr("disabled");
            $("#acc" + i.toString() + "Name").removeAttr("disabled");
            $("#acc" + i.toString() + "Button").removeAttr("disabled");
        }
    }

    $(".blinkButton").show();

    $("#addDAqPanelDiv").show();

    $(".accRemoveImage").show();

    $("#partitionCheckBox").removeAttr("disabled");
    if ($("#partitionCheckBox:checked").length) {
        $("#partitionTimeSizeId").removeAttr("disabled");
        $("#partitionTypeId").removeAttr("disabled");
    }

    $("#pathId").removeAttr("disabled");

}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

//socket.emit("create header", _sampleRate, 3, true, 100, "MB", _analogLabels);


/*

let sampleCounter;

function analogVibration(){
    $("<div id = \"graphContainer\" style=\"position: absolute; top: 100px; left: 100px;\"></div>").appendTo('body');
    $('#graphContainer').append("<canvas id=\"myChart\" style=\"position: absolute;height: 400px;width: 800px;top: 10%;left: 15%\"></canvas>");
    $('#graphContainer').append("<select style = \"position: absolute; top: 400px; left: 250px;\" onchange = \"axisTimeChange(this.value)\" name = \"Eixo X\"><option value=\"sample\" selected>Amostras</option> <option value=\"time\">Tempo</option><option value=\"realTime\">Horario</option></select>");

    var ctx = document.getElementById('myChart').getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: 0,//["January", "February", "March", "April", "May", "June", "July"],
            datasets: [{
                label: "Pipe0",
                fill: false,
                borderColor: 'rgb(0, 0, 0)',
                data: 0,
            },{
                label: "Pipe1",
                fill: false,
                borderColor: 'rgb(0, 0, 255)',
                data: 0,
            },{
                label: "Pipe2",
                fill: false,
                borderColor: 'rgb(0, 255, 0)',
                data: 0,
            },{
                label: "Pipe3",
                fill: false,
                borderColor: 'rgb(255, 0, 0)',
                data: 0,
            },{
                label: "Pipe4",
                fill: false,
                borderColor: 'rgb(0, 255, 255)',
                data: 0,
            },{
                label: "Pipe5",
                fill: false,
                borderColor: 'rgb(255, 0, 255)',
                data: 0,
            }]
        },

        // Configuration options go here
        options: {
            animation: {duration: 0},
            hover: {animationDuration: 0},
            responsiveAnimationDuration: 0,
            responsive: false
        }
    });

    //
    comSelected = "COM23";

    var serialport = require("serialport");

    var STM32port = new serialport(comSelected, {
        baudRate: 115200,
        parser: new serialport.parsers.Readline("OK")
    }, function(err) {
        if(err){	
            alert((err.message).toString());
        }
        
    });

    STM32port.on('data', function(data) {
        updateChart(chart, data);
    });

    sampleCounter = 0;
    millisecondsCounter = +new Date();

}

// function addData(chart, label, data) {
//     for(var i = 0; i < 6; i++){
//         if(data[i] != -100){
//             chart.data.labels.push(label);
//             chart.data.datasets.forEach((dataset) => {
//                 dataset.data.push(data[i]);
//             });
//             chart.update();
//         }
//         else{

//         }
//     }
// }


// function removeData(chart) {
//     chart.data.labels.shift();
//     chart.data.datasets.forEach((dataset) => {
//         dataset.data.shift();
//     });
//     chart.update();
// }


function addData(chart, label, data) {
    for(var i = 0; i < 6; i++){
        for(var j = 0; j < 4; j++){
            if(data[i][j] != -100){
                alert(data[i][j]);
                chart.data.labels.push(label);
                chart.data.datasets[i].data.push(data[i][j]);
                chart.update();
            }
        }
    }
}


function removeData(chart) {
    chart.data.labels.shift();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.shift();
    });
    chart.update();
}

function getPosition(string, subString, index) {
    return string.split(subString, index).join(subString).length;
 }

function updateChart(chart, data){
    let dataPipe = [];
    for(var i=0; i<6; i++) {
        dataPipe[i] = [0,0,0,0];
    }
    data = data.toString();

    for(var i = 0; i<6; i++){
        if(data.includes('pipe' + i.toString())){
            for(var j = 0; j < 4; j++){
                if(data.includes('pipe' + i.toString() + j.toString())){
                    dataPipe[i][j] = data.substr(data.indexOf('pipe' + i.toString() + j.toString() +':') + 7, data.indexOf('\r'));
                }
            }
        }
    }

    sampleCounter++;
    if(axisDisplayng == "sample"){
        addData(chart, sampleCounter, dataPipe);
    }
    else if(axisDisplayng == "realTime"){
        let realTimeClock = new Date();
        addData(chart, (realTimeClock.getHours()<10?("0").concat(getHours().toString()):realTimeClock.getHours().toString()).concat(":").concat(realTimeClock.getMinutes()<10?("0").concat(getMinutes().toString()):realTimeClock.getMinutes().toString()).concat(":").concat(realTimeClock.getSeconds()<10?("0").concat(realTimeClock.getSeconds().toString()):realTimeClock.getSeconds().toString()), dataPipe);
    }
    else if(axisDisplayng == "time"){
        let realTimeClock = +new Date();
        addData(chart, realTimeClock - millisecondsCounter, dataPipe);
    }
    if(sampleCounter>20)
        removeData(chart);
}
*/