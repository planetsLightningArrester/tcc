let globalSTMport;
let _sampleRate = 800;
let _digitalLabels = ["Acc0"];
let _digitalActivesAcc = [true, false, false, false, false, false];
let _digitalBatteriesLevel = ['0', '0', '0', '0', '0', '0'];
let digitalBatteriesUpdateInterval;
let _absFlag = true;

let digitalStarted = false;

function digitalVibration(){
    $('body').append("<img src = \"./art/kotLogoSVGColorida.svg\" id = \"bottomRightKotBackgroundImage\"/>");

    //Append control panels
    $('body').append("<div id = \"controlPanelDiv\" class = \"flex\" style = \"position: absolute; top: 5vh; left: 27vw; width: 65vh; height: 70vh; margin-top: 0.5vh\"></div>");

    setTimeout(function(){
        /*Upper control panel*/
        
        /*Test name*/
        $('#controlPanelDiv').append("<div id = \"testInfos\" class = \"flex\" style = \"background: linear-gradient(to bottom right, #70b9f4, #63a4d8); border: .05vh solid #43a044; border-radius: .7vh 1.4vh; width: 65vh; height: 11vh; margin-top: 0.3vh\"></div>");
        $('#testInfos').append("<input type = \"text\" value = \"Cliente\" id = \"clientId\" style = \"position: relative; top: 1.7vh; margin-left: 4.3vh; text-align: center; font-size: 2.3vh; border-radius: 1.3vh; width: 18vh; height: 4vh\" onchange = \"changeClient(this.value)\"></input>");
        $('#testInfos').append("<input type = \"text\" value = \"Máquina\" id = \"machineId\" style = \"position: relative; top: 1.7vh; margin-left: .3vh; text-align: center; font-size: 2.3vh; border-radius: 1.3vh; width: 18vh; height: 4vh\" onchange = \"changeMachine(this.value)\"></input>");
        $('#testInfos').append("<input type = \"text\" value = \"Responsável\" id = \"workerId\" style = \"position: relative; top: 1.7vh; margin-left: .3vh; text-align: center; font-size: 2.3vh; border-radius: 1.3vh; width: 18vh; height: 4vh\" onchange = \"changeWorker(this.value)\"></input>");
        $('#testInfos').append("<input type = \"checkbox\" id = \"absValueId\" style = \"position: relative; top: 7vh; left: -42vh; text-align: center; font-size: 2.3vh; border-radius: 1.3vh; width: 2vh; height: 2vh\" onchange = \"changeDisplayAbsValue(this.id)\"></input>");
        $('#testInfos').append("<label style = \"position: relative; top: 3.5vh; left: 20vh; font-weight: bold; font-size: 2vh; color: white\">Adicionar valor absoluto</label>");

        /*Acc0 */
        $('#controlPanelDiv').append("<div id = \"acc0Div\" class = \"flex\" style = \"background: linear-gradient(to bottom right, #81e282, #62ad63); border: .05vh solid #43a044; border-radius: .7vh 1.4vh; width: 65vh; height: 8vh; margin-top: 0.3vh\"></div>");
        $('#acc0Div').append("<input type = \"text\" class = \"accName\" value = \"Acc0\" id = \"acc0Name\" size = 6 onchange = \"changeAccName(this.value, \'0\')\"></input>");
        $('#acc0Div').append("<label id = \"acc0BatteryLevel\" class = \"accBatteryLevel\">100%</label>");
        $('#acc0Div').append("<img src = \"./art/half-battery.png\" class = \"accBatteryImage\"/>");
        $('#acc0Div').append("<div class = \"flex\" style = \"position: relative; left: 44vh; top: -3vh\"><a class = \"blinkButton\" id = \"acc0Button\" onclick = \"blinkAcc(\'0\')\">Piscar</a></div>");

        //Add acc button
        $('#controlPanelDiv').append("<div id = \"addAccPanelDiv\" class = \"flex\" style = \"cursor: pointer; border: .2vh solid #43a044; border-radius: 1.4vh 1.4vh; width: 65vh; height: 8vh; margin-top: 0.3vh; transition: 0.5s;\" onclick = \"addAcc()\"><img src = \"./art/plus.png\" style = \"position: relative; top: 1vh; left: 30vh; height: 5vh; transition: 0.5s;\"/></div>");

        //SampleRate div
        $('#controlPanelDiv').append("<div id = \"sampleRateDiv\" class = \"flex\" style = \"background: linear-gradient(to bottom right, #70b9f4, #63a4d8); border: .05vh solid #38a1f4; border-radius: .7vh 1.4vh; width: 32vh; height: 9.5vh; margin-top: 0.3vh; float: right; transition: 0.5s;\"></div>");
        //Sample rate options
        $("#sampleRateDiv").append("<label style = \"position: relative; top: 0.5vh; left: 2vh; font-size: 2.3vh; transition: 0.5s;\">Frequência de aquisição</label>");
        $("#sampleRateDiv").append("<select id = \"sampleRateSelectId\" style = \"position: relative; top: 1.5vh; left: 9.5vh; text-align: center; font-size: 2vh; border-radius: .3vh; width: 9.5vh; height: 3vh; transition: 0.5s;\" onchange = \"changeSampleRate(this.value)\" name = \"Frequência de aquisição\"><option value = 1600>1600Hz</option><option value = 800 selected>800Hz</option><option value = 400>400Hz</option><option value = 200>200Hz</option><option value = 100>100Hz</option><option value = 50>50Hz</option><option value = 25>25Hz</option><option value = 12>12.5Hz</option><option value = 6>6.25Hz</option></select>");
        
        //Partition div
        $('#controlPanelDiv').append("<div id = \"partitionDiv\" class = \"flex\" style = \"background: linear-gradient(to bottom right, #70b9f4, #63a4d8); border: .05vh solid #38a1f4; border-radius: .7vh 1.4vh; width: 32.5vh; height: 9.5vh; margin-top: 0.3vh; transition: 0.5s;\"></div>");
        //Partition options
        $('#partitionDiv').append("<label style = \"position: relative; top: -0.5vh; left: 2vh; font-size: 2.3vh; transition: 0.5s;\">Particionar arquivo a cada:</label>");
        $('#partitionDiv').append("<input type = \"checkbox\" id = \"partitionCheckBox\" style = \"position: relative; top: 4vh; left: -26vh; width: 2.2vh; height: 2.8vh; transition: 0.5s;\" onchange = \"partitionEnableCheck(this.id)\"></input>");
        $('#partitionDiv').append("<input disabled type = \"text\" value = 15 id = \"partitionTimeSizeId\" size = 5 style = \"position: relative; top: 0vh; left: 6vh; text-align: center; width: 11vh; height: 3.5vh; border-radius: .3vh; font-size: 2vh; transition: 0.5s;\" onchange = \"changePartitionSize(this.value)\"></input>");
        $('#partitionDiv').append("<select disabled id = \"partitionTypeId\" style = \"position: relative; top: 0vh; left: 8vh; width: 8vh; height: 3vh; border-radius: 0.3vh; font-size: 2vh; transition: 0.5s;\" onchange = \"changePartitionType(this.value)\" name = \"tipo\"><option value = \"min\" selected>min</option><option value = \"MB\">MB</option></select>");

        //Folder div
        $('#controlPanelDiv').append("<div id = \"folderDiv\" class = \"flex\" style = \"background: linear-gradient(to bottom right, #70b9f4, #63a4d8); border: .05vh solid #38a1f4; border-radius: .7vh 1.4vh; width: 65vh; height: 8vh; margin-top: 0.3vh\"></div>");
        //Path options
        $('#folderDiv').append("<label style = \"position: relative; top: 0.3vh; left: 2vh; font-size: 2.3vh;\">Diretório</label>");
        $('#folderDiv').append("<input type = \"text\" value = \"" + pathToSave + "\" id = \"pathId\" style = \"position: relative; top: 3vh; left: -2vh; text-align: center; font-size: 2vh; border-radius: .3vh; width: 50vh; height: 3vh\" onchange = \"changePath(this.value)\"></input>");
        
        //Start stop button
        $('#controlPanelDiv').append("<div class = \"flex\"><a class = \"startButton\" id = \"startStopButtonId\" onclick = \"startCmd()\">Iniciar</a></div>");

    }, 0);

    //Comentar a linha abaixo quando parar de carregar o digitalVibration direto na inicializacao
    comSelected = "COM23";

    var serialport = require("serialport");

    var STM32port = new serialport(comSelected, {
        baudRate: 12000000,
        parser: new serialport.parsers.Readline("OK")
    }, function(err) {
        if(err){	
            console.log((err.message).toString());
        }
        
    });
    globalSTMport = STM32port;

    globalSTMport.on('data', function(data) {
        if(digitalStarted)
            updateDigitalData(data);
    });
    globalSTMport.write("digital");

    sampleCounter = 0;
    //millisecondsCounter = +new Date();

}

function updateDigitalData(data){
    //console.log(data);
    let radio = data[1] - 48;
    let pipe = data[4] - 48;
    let batteryLevel;
    pipe=radio;

    let dataPipe = new Array(5);

    //X
    dataPipe[0] = +(_2Complement2Float((0xFF00 & (data[6]<<8)) + (0x00FF & data[7]))*(16/4095)).toFixed(3);
    //Y
    dataPipe[1] = +(_2Complement2Float((0xFF00 & (data[8]<<8)) + (0x00FF & data[9]))*(16/4095)).toFixed(3);
    //Z
    dataPipe[2] = +(_2Complement2Float((0xFF00 & (data[10]<<8)) + (0x00FF & data[11]))*(16/4095)).toFixed(3);
    //Bateria
    dataPipe[3] = +(2*data[12]/100).toFixed(2);
    //Tempo
    dataPipe[4] = 0xFFFFFFFF & ((0xFF000000 & (data[13]<<24)) + (0xFF0000 & (data[14]<<16)) + (0xFF00 & (data[15]<<8)) + (0xFF & data[16]));
    dataPipe[4] = dataPipe[4]/_sampleRate;
    
    batteryLevel = 100*((0.7 - (4.2 - dataPipe[3]))/0.7);
    if(batteryLevel > 100){
        batteryLevel = 100;
    }
    else if(batteryLevel < 0){
        batteryLevel = 0;
    }

    _digitalBatteriesLevel[pipe] = batteryLevel.toFixed(0);
    
    //$("#acc" + pipe.toString() + "BatteryLevel").html(batteryLevel.toFixed(0) + "%");

    if(_absFlag)
        dataPipe[3] = Math.sqrt(Math.pow(parseFloat(dataPipe[0]), 2) + Math.pow(parseFloat(dataPipe[1]), 2) + Math.pow(parseFloat(dataPipe[2]), 2)).toFixed(3);
    
    digitalSendToServer(pipe, dataPipe, dataPipe[4]);

}

function digitalSendToServer(pipe, dataPipe, time){
    socket.emit("acc" + pipe.toString() + "data", dataPipe, time, _absFlag);
}

function _2Complement2Float(number){
    number = number & 0xFFFF;
    if((number & 0x8000) != 0)
        return -(0xFFFF & (-number));
    else
        return (0xFFFF & number);
}

function addAcc(){
    if(_digitalLabels.length >= 6){
        alert("Numero máximo de acelerometros atingido");
        return 0;
    }
    else{
        let newAcc;
        for(var i = 0; i < 6; i++){
            if(!_digitalActivesAcc[i]){
                newAcc = i;
                _digitalActivesAcc[i] = true;
                _digitalLabels.splice(newAcc, 0, "Acc" + newAcc.toString());
                i = 6;
            }
        }
        globalSTMport.write('enablePipe' + newAcc.toString());
        $("<div id = \"acc" + newAcc.toString()  + "Div\" class = \"flex\" style = \"background: linear-gradient(to bottom right, #81e282, #62ad63); border: .05vh solid #43a044; border-radius: .7vh 1.4vh; width: 65vh; height: 8vh; margin-top: 0.3vh\"></div>").insertBefore("#addAccPanelDiv");
        $('#acc' + newAcc.toString() + 'Div').append("<input type = \"text\" class = \"accName\" value = \"Acc" + newAcc.toString() + "\" id = \"acc" + newAcc.toString() + "Name\" size = 6 onchange = \"changeAccName(this.value, \'" + newAcc.toString() + "\')\"></input>");
        $('#acc' + newAcc.toString() + 'Div').append("<label id = \"acc" + newAcc.toString() + "BatteryLevel\" class = \"accBatteryLevel\">100%</label>");
        $('#acc' + newAcc.toString() + 'Div').append("<img src = \"./art/half-battery.png\" class = \"accBatteryImage\"/>");
        $('#acc' + newAcc.toString() + 'Div').append("<div class = \"flex\" style = \"position: relative; left: 44vh; top: -3vh\"><a class = \"blinkButton\" id = \"acc" + newAcc.toString() + "Button\" onclick = \"blinkAcc(\'" + newAcc.toString() + "\')\">Piscar</a></div>");
        $('#acc' + newAcc.toString() + 'Div').append("<img src = \"./art/remove.png\" id = \"acc" + newAcc.toString() + "RemoveImg\" class = \"accRemoveImage\" onclick = \"removeAcc(\'" + newAcc.toString() + "\')\"/>");
    }
    console.log(_digitalLabels);
}

function removeAcc(acc){
    let numbOfActivesAccs = 0;
    _digitalActivesAcc[parseInt(acc)] = false;

    _digitalActivesAcc.forEach(function(element){
        if(element)
            numbOfActivesAccs++;
    });

    _digitalLabels.splice(_digitalLabels.indexOf($("#acc" + acc + "Name").val()), 1);
    //_digitalLabels.splice(parseInt(acc) - Math.abs(parseInt(acc) - numbOfActivesAccs + 1), 1);
    $("#acc" + acc + "Div").detach();
    globalSTMport.write('disablePipe' + acc.toString());
    console.log(acc);
    console.log(_digitalLabels);
}

function blinkAcc(pipe){
    $('#acc' + pipe.toString() + 'Button').css('animation', 'blink 1s alternate infinite');
    //globalSTMport.write("pipe" + pipe.toString() + ":blink");
    globalSTMport.write("r" + pipe.toString() + "p0:blink");

    setTimeout(function(){
        $('#acc' + pipe.toString() + 'Button').attr("onclick", "NotBlinkAcc('"+pipe+"')");
    }, 10);
}

function NotBlinkAcc(pipe){
    $('#acc' + pipe.toString() + 'Button').css('animation', '');
    //globalSTMport.write("pipe" + pipe.toString() + ":!blink");
    globalSTMport.write("r" + pipe.toString() + "p0:!blink");

    setTimeout(function(){
        $('#acc' + pipe.toString() + 'Button').attr("onclick", "blinkAcc('"+pipe+"')");
    }, 10);
}

function startCmd(){
    digitalStarted = true;
    socket.emit("create digital header", _digitalLabels, _digitalActivesAcc);

    globalSTMport.write("start");
/*
    _digitalActivesAcc.forEach((elements, index)=>{
        if(elements){
            setTimeout(function(){
                globalSTMport.write("pipe" + index.toString() + ":start");
            }, 10*index);
        }
        //globalSTMport.write("pipe" + index.toString() + ":IniciarSemFiltro1");
    });
*/
    $("#startStopButtonId").html("Parar");
    
    setTimeout(function(){
        $("#startStopButtonId").attr("onclick", "stopCmd()");
        $("#startStopButtonId").attr("class", "stopButton");
    }, 10);

    digitalBatteriesUpdateInterval = setInterval(function(){
        Object.keys(_digitalLabels).forEach(index => {
            $("#acc" + index.toString() + "BatteryLevel").html(_digitalBatteriesLevel[index] + "%");
        });
    }, 2000);

    digitalDisableAllElements();

    console.log(_digitalLabels);

}

function stopCmd(){
    digitalStarted = false;

    globalSTMport.write("stop");
/*
    _digitalActivesAcc.forEach((elements, index)=>{
        if(elements){
            setTimeout(function(){
                globalSTMport.write("pipe" + index.toString() + ":stop");
            }, 200*index);
        }
        //globalSTMport.write("pipe" + index.toString() + ":Parar");
    });*/
    // Object.keys(_digitalLabels).forEach((index)=>{
    //     setTimeout(function(){
    //         globalSTMport.write("pipe" + index.toString() + ":stop");
    //     }, 10*index);
    //     //globalSTMport.write("pipe" + index.toString() + ":Parar");
    // });

    $("#startStopButtonId").html("Iniciar");
    
    setTimeout(function(){
        $("#startStopButtonId").attr("onclick", "startCmd()");
        $("#startStopButtonId").attr("class", "startButton");
        socket.emit("stop digital", _digitalLabels);
    }, 10);

    clearInterval(digitalBatteriesUpdateInterval);

    digitalEnableAllelements();
}

function changeClient(client){
    socket.emit("change client", client);
}

function changeMachine(machine){
    socket.emit("change machine", machine);
}

function changeWorker(worker){
    socket.emit("change worker", worker);
}

function changeDisplayAbsValue(id){
    _absFlag = $("#" + id).prop("checked");
}

function changeSampleRate(sampleRate){

    _digitalActivesAcc.forEach((elements, index)=>{
        if(elements){
            setTimeout(function(){
                globalSTMport.write("pipe" + index.toString() + ":f"  + sampleRate.toString());
            }, 10*index);
        }
        //globalSTMport.write("pipe" + index.toString() + ":Parar");
    });

    // globalSTMport.write("pipe0:f" + sampleRate.toString());
    // setTimeout(function(){
    //     globalSTMport.write("pipe1:f" + sampleRate.toString());
    // }, 10);
    // setTimeout(function(){
    //     globalSTMport.write("pipe2:f" + sampleRate.toString());
    // }, 20);
    // setTimeout(function(){
    //     globalSTMport.write("pipe3:f" + sampleRate.toString());
    // }, 30);
    // setTimeout(function(){
    //     globalSTMport.write("pipe4:f" + sampleRate.toString());
    // }, 40);
    // setTimeout(function(){
    //     globalSTMport.write("pipe5:f" + sampleRate.toString());
    // }, 50);
    socket.emit("change sample rate", sampleRate);
    _sampleRate = sampleRate;
}

function changeAccName(val, acc){
    _digitalLabels[acc] = val;
}

function changePath(newPath){
    if(newPath.includes(".txt")){
        alert("Selecione apenas o diretório. Os arquivos serão gerados com nomes de acordo com os acelerometros.");
        $('#pathId').attr('value', pathToSave);
    }
    else{
        pathToSave = newPath;
        socket.emit('change path', newPath);
    }
}

function partitionEnableCheck(id){
    id = id.toString();
    if($("#" + id).prop("checked")){
        $("#partitionTypeId").removeAttr("disabled");
        $("#partitionTimeSizeId").removeAttr("disabled");
        socket.emit('turn partition', true, $("#partitionTimeSizeId").val(), $("#partitionTypeId").val());
    }
    else{
        socket.emit('turn partition', false, $("#partitionTimeSizeId").val(), $("#partitionTypeId").val());
        $("#partitionTypeId").attr("disabled", "true");
        $("#partitionTimeSizeId").attr("disabled", "true");
    }
    
}

function changePartitionType(newType){
    socket.emit('change partition type', newType);
}

function changePartitionSize(newSize){
    socket.emit('change partition size', newSize);
}

function digitalDisableAllElements(){
    $("#clientId").attr("disabled", "true");
    $("#machineId").attr("disabled", "true");
    $("#workerId").attr("disabled", "true");
    $("#absValueId").attr("disabled", "true");
    
    for(let i = 0; i< 6; i++){
        if($("#acc" + i.toString() + "Name").length){
            if(i != 0)
            $("#acc" + i.toString() + "RemoveImg").attr("disabled", "true");
            $("#acc" + i.toString() + "Name").attr("disabled", "true");
            $("#acc" + i.toString() + "Button").attr("disabled", "true");
        }
    }
    
    $(".blinkButton").hide();

    $("#addAccPanelDiv").hide();
    
    $(".accRemoveImage").hide();

    $("#sampleRateSelectId").attr("disabled", "true");

    $("#partitionCheckBox").attr("disabled", "true");

    $("#partitionTimeSizeId").attr("disabled", "true");
    $("#partitionTypeId").attr("disabled", "true");

    $("#pathId").attr("disabled", "true");

}

function digitalEnableAllelements(){
    $("#clientId").removeAttr("disabled");
    $("#machineId").removeAttr("disabled");
    $("#workerId").removeAttr("disabled");
    $("#absValueId").removeAttr("disabled");
    
    for(let i = 0; i< 6; i++){
        if($("#acc" + i.toString() + "Name").length){
            if(i != 0)
                $("#acc" + i.toString() + "RemoveImg").removeAttr("disabled");
            $("#acc" + i.toString() + "Name").removeAttr("disabled");
            $("#acc" + i.toString() + "Button").removeAttr("disabled");
        }
    }

    $(".blinkButton").show();

    $("#addAccPanelDiv").show();
    
    $(".accRemoveImage").show();

    $("#sampleRateSelectId").removeAttr("disabled");

    $("#partitionCheckBox").removeAttr("disabled");
    if($("#partitionCheckBox:checked").length){
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

  //socket.emit("create header", _sampleRate, 3, true, 100, "MB", _digitalLabels);
  

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