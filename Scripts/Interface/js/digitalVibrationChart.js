let globalSTMport;
let xChart, yChart, zChart;
let pathToSave, _sampleRate = 500;
let _labels = ["Acc0"];
let _activesAcc = [true, false, false, false, false, false];
let renderChartsInterval;
let _chartUpdateTime = 1000;

let socket = io('http://localhost:8013');

socket.on('current folder', function(data){
    pathToSave = data;
    pathToSave += '\\log\\';
});

socket.on('show alert', function(msg){
    alert(msg);
});

function digitalVibration(){

    $('body').css('background', 'lightgrey');

    //Append control panels
    $('body').append("<div id = \"rightControlPanelDiv\" style = \"position: absolute; top: 65%; left: 80%; border: 3px solid black; border-radius: 10px 20px; width: 300; height: 280\"></div>");
    $('body').append("<div id = \"leftControlPanelDiv\" style = \"position: absolute; top: 45%; left: 3%; border: 3px solid black; border-radius: 10px 20px; width: 340; height: 430\"></div>");

    $('body').append("<div id = \"startStopSavePanel\" style = \"position: absolute; top: 50%; left: 80%; border: 3px solid black; border-radius: 10px 20px; width: 300; height: 100\"></div>");

    setTimeout(function(){
        /*Right control panel*/
        $('#rightControlPanelDiv').append("<div class = \"flex\"><a class = \"blinkButton\" id = \"acc0Button\" style = \"top: 10;\" onclick = \"blinkAcc(\'0\')\">Piscar</a></div>");
        $('#rightControlPanelDiv').append("<div class = \"flex\"><a class = \"blinkButton\" id = \"acc1Button\" style = \"top: 50;\" onclick = \"blinkAcc(\'1\')\">Piscar</a></div>");
        $('#rightControlPanelDiv').append("<div class = \"flex\"><a class = \"blinkButton\" id = \"acc2Button\" style = \"top: 90;\" onclick = \"blinkAcc(\'2\')\">Piscar</a></div>");
        $('#rightControlPanelDiv').append("<div class = \"flex\"><a class = \"blinkButton\" id = \"acc3Button\" style = \"top: 130;\" onclick = \"blinkAcc(\'3\')\">Piscar</a></div>");
        $('#rightControlPanelDiv').append("<div class = \"flex\"><a class = \"blinkButton\" id = \"acc4Button\" style = \"top: 170;\" onclick = \"blinkAcc(\'4\')\">Piscar</a></div>");
        $('#rightControlPanelDiv').append("<div class = \"flex\"><a class = \"blinkButton\" id = \"acc5Button\" style = \"top: 210;\" onclick = \"blinkAcc(\'5\')\">Piscar</a></div>");

        $('#rightControlPanelDiv').append("<input type = \"text\" value = \"Acc0\" id = \"acc0Name\" style = \"position: absolute; top: 20; left: 20; text-align: center; \" size = 6 onchange = \"changeAccName(this.value, \'0\')\"></input>");
        $('#rightControlPanelDiv').append("<input disabled type = \"text\" value = \"Acc1\" id = \"acc1Name\" style = \"position: absolute; top: 60; left: 20; text-align: center; \" size = 6 onchange = \"changeAccName(this.value, \'1\')\"></input>");
        $('#rightControlPanelDiv').append("<input disabled type = \"text\" value = \"Acc2\" id = \"acc2Name\" style = \"position: absolute; top: 100; left: 20; text-align: center; \" size = 6 onchange = \"changeAccName(this.value, \'2\')\"></input>");
        $('#rightControlPanelDiv').append("<input disabled type = \"text\" value = \"Acc3\" id = \"acc3Name\" style = \"position: absolute; top: 140; left: 20; text-align: center; \" size = 6 onchange = \"changeAccName(this.value, \'3\')\"></input>");
        $('#rightControlPanelDiv').append("<input disabled type = \"text\" value = \"Acc4\" id = \"acc4Name\" style = \"position: absolute; top: 180; left: 20; text-align: center;\" size = 6 onchange = \"changeAccName(this.value, \'4\')\"></input>");
        $('#rightControlPanelDiv').append("<input disabled type = \"text\" value = \"Acc5\" id = \"acc5Name\" style = \"position: absolute; top: 220; left: 20; text-align: center;\" size = 6 onchange = \"changeAccName(this.value, \'5\')\"></input>");

        $('#rightControlPanelDiv').append("<input checked type = \"checkbox\" id = \"acc0CheckBox\" style = \"position: absolute; top: 20; left: 0;\" onchange = \"changeAccEnable(this.id)\"></input>");
        $('#rightControlPanelDiv').append("<input type = \"checkbox\" id = \"acc1CheckBox\" style = \"position: absolute; top: 60; left: 0;\" onchange = \"changeAccEnable(this.id)\"></input>");
        $('#rightControlPanelDiv').append("<input type = \"checkbox\" id = \"acc2CheckBox\" style = \"position: absolute; top: 100; left: 0;\" onchange = \"changeAccEnable(this.id)\"></input>");
        $('#rightControlPanelDiv').append("<input type = \"checkbox\" id = \"acc3CheckBox\" style = \"position: absolute; top: 140; left: 0;\" onchange = \"changeAccEnable(this.id)\"></input>");
        $('#rightControlPanelDiv').append("<input type = \"checkbox\" id = \"acc4CheckBox\" style = \"position: absolute; top: 180; left: 0;\" onchange = \"changeAccEnable(this.id)\"></input>");
        $('#rightControlPanelDiv').append("<input type = \"checkbox\" id = \"acc5CheckBox\" style = \"position: absolute; top: 220; left: 0;\" onchange = \"changeAccEnable(this.id)\"></input>");


        //$('#rightControlPanelDiv').append("<img src = \"./art/gear.png\" height = \"20\" style = \"position: absolute; top: 255; left: 280;\"></img>");
    
        /*Left control panel*/
        //Path options
        $('#leftControlPanelDiv').append("<label style = \"position: absolute; top: 5; left: 2; text-align: center;\">Salvar em:</label>");
        $('#leftControlPanelDiv').append("<input type = \"text\" value = \"" + pathToSave + "\" id = \"pathId\" style = \"position: absolute; top: 25; left: 2; text-align: center; \" onchange = \"changePath(this.value)\"></input>");
        //Partition options
        $('#leftControlPanelDiv').append("<label style = \"position: absolute; top: 65; left: 2; text-align: center;\">Particionar arquivo a cada:</label>");
        $('#leftControlPanelDiv').append("<input type = \"checkbox\" id = \"partitionCheckBox\" style = \"position: absolute; top: 90; left: 0;\" onchange = \"partitionEnableCheck(this.id)\"></input>");
        $('#leftControlPanelDiv').append("<input disabled type = \"text\" value = 15 id = \"partitionTimeSizeId\" size = 5 style = \"position: absolute; top: 90; left: 20; text-align: center; \" onchange = \"changePartitionSize(this.value)\"></input>");
        $('#leftControlPanelDiv').append("<select disabled id = \"partitionTypeId\" style = \"position: absolute; top: 90; left: 90\" onchange = \"changePartitionType(this.value)\" name = \"tipo\"><option value = \"min\" selected>min</option><option value = \"MB\">MB</option></select>");
        //Sample rate options
        $("#leftControlPanelDiv").append("<label style = \"position: absolute; top: 130; left: 2\">Frequência de aquisição</label><select style = \"position: absolute; top: 155; left: 2\" onchange = \"changeSampleRate(this.value)\" name = \"Frequência de aquisição\"><option value = 500 selected>500Hz</option><option value = 250>250Hz</option><option value = 125>125Hz</option></select>");
        //Start stop button
        $('#leftControlPanelDiv').append("<div class = \"flex\"><a class = \"startButton\" id = \"startStopButtonId\" style = \"top: 370;\" onclick = \"startCmd()\">Começar</a></div>");

    }, 1000);

    //X axis
    $("<div id = \"graphContainerX\" style=\"position: absolute; top: 50px; left: 100px;\"></div>").appendTo('body');
    $('#graphContainerX').append("<canvas id=\"xAcc\" style=\"position: absolute;height: 300px;width: 600px;top: 10%;left: 15%; background: white; border-radius: 25px 10px;\"></canvas>");

    var ctx = document.getElementById('xAcc').getContext('2d');
    var xchart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: 0,
            datasets: [{
                label: "Acc0",
                fill: false,
                borderColor: 'rgb(0, 0, 0)',
                data: 0
            },{
                label: "Acc1",
                fill: false,
                borderColor: 'rgb(0, 0, 255)',
                data: 0,
                hidden: true
            },{
                label: "Acc2",
                fill: false,
                borderColor: 'rgb(0, 255, 0)',
                data: 0,
                hidden: true
            },{
                label: "Acc3",
                fill: false,
                borderColor: 'rgb(255, 0, 0)',
                data: 0,
                hidden: true
            },{
                label: "Acc4",
                fill: false,
                borderColor: 'rgb(0, 255, 255)',
                data: 0,
                hidden: true
            },{
                label: "Acc5",
                fill: false,
                borderColor: 'rgb(255, 0, 255)',
                data: 0,
                hidden: true
            }]
        },

        // Configuration options go here
        options: {
            animation: {duration: 0},
            hover: {animationDuration: 0},
            responsiveAnimationDuration: 0,
            responsive: false,
            title:{
                display: true,
                text: "Eixo X"
            },
            elements:{
                point:{
                    radius: 0
                }
            }
        }
    });

    //Y axis
    $("<div id = \"graphContainerY\" style=\"position: absolute; top: 50px; left: 800px;\"></div>").appendTo('body');
    $('#graphContainerY').append("<canvas id=\"yAcc\" style=\"position: absolute;height: 300px;width: 600px;top: 10%;left: 15%; background: white; border-radius: 25px 10px;\"></canvas>");

    var cty = document.getElementById('yAcc').getContext('2d');
    var ychart = new Chart(cty, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: 0,
            datasets: [{
                label: "Acc0",
                fill: false,
                borderColor: 'rgb(0, 0, 0)',
                data: 0
            },{
                label: "Acc1",
                fill: false,
                borderColor: 'rgb(0, 0, 255)',
                data: 0,
                hidden: true
            },{
                label: "Acc2",
                fill: false,
                borderColor: 'rgb(0, 255, 0)',
                data: 0,
                hidden: true
            },{
                label: "Acc3",
                fill: false,
                borderColor: 'rgb(255, 0, 0)',
                data: 0,
                hidden: true
            },{
                label: "Acc4",
                fill: false,
                borderColor: 'rgb(0, 255, 255)',
                data: 0,
                hidden: true
            },{
                label: "Acc5",
                fill: false,
                borderColor: 'rgb(255, 0, 255)',
                data: 0,
                hidden: true
            }]
        },

        // Configuration options go here
        options: {
            animation: {duration: 0},
            hover: {animationDuration: 0},
            responsiveAnimationDuration: 0,
            responsive: false,
            title:{
                display: true,
                text: "Eixo Y"
            },
            elements:{
                point:{
                    radius: 0
                }
            }
        }
    });

    //Z axis
    $("<div id = \"graphContainerZ\" style=\"position: absolute; top: 400px; left: 450px;\"></div>").appendTo('body');
    $('#graphContainerZ').append("<canvas id=\"zAcc\" style=\"position: absolute;height: 300px;width: 600px;top: 10%;left: 15%; background: white; border-radius: 25px 10px;\"></canvas>");
    $('#graphContainerZ').append("<select style = \"position: absolute; top: 300px; left: 250px; border-radius: 5px;\" onchange = \"axisTimeChange(this.value)\" name = \"Eixo X\"><option value=\"sample\" selected>Amostras</option> <option value=\"time\">Tempo</option><option value=\"realTime\">Horario</option></select>");

    var ctz = document.getElementById('zAcc').getContext('2d');
    var zchart = new Chart(ctz, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: 0,
            datasets: [{
                label: "Acc0",
                fill: false,
                borderColor: 'rgb(0, 0, 0)',
                data: 0
            },{
                label: "Acc1",
                fill: false,
                borderColor: 'rgb(0, 0, 255)',
                data: 0,
                hidden: true
            },{
                label: "Acc2",
                fill: false,
                borderColor: 'rgb(0, 255, 0)',
                data: 0,
                hidden: true
            },{
                label: "Acc3",
                fill: false,
                borderColor: 'rgb(255, 0, 0)',
                data: 0,
                hidden: true
            },{
                label: "Acc4",
                fill: false,
                borderColor: 'rgb(0, 255, 255)',
                data: 0,
                hidden: true
            },{
                label: "Acc5",
                fill: false,
                borderColor: 'rgb(255, 0, 255)',
                data: 0,
                hidden: true
            }]
        },

        // Configuration options go here
        options: {
            animation: {duration: 0},
            hover: {animationDuration: 0},
            responsiveAnimationDuration: 0,
            responsive: false,
            title:{
                display: true,
                text: "Eixo Z"
            },
            elements:{
                point:{
                    radius: 0
                }
            }
        }
    });

    xChart = xchart;
    yChart = ychart;
    zChart = zchart;
 
    //Comentar a linha abaixo quando parar de carregar o digitalVibration direto na inicializacao
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
    globalSTMport = STM32port;

    globalSTMport.on('data', function(data) {
        updateDigitalChart(data);
    });

    sampleCounter = 0;
    //millisecondsCounter = +new Date();

}

function addDigitalData(label, data) {

    xChart.data.labels.push(label);
    xChart.data.datasets[0].data.push(data[0]);

    yChart.data.labels.push(label);
    yChart.data.datasets[0].data.push(data[1]);

    zChart.data.labels.push(label);
    zChart.data.datasets[0].data.push(data[2]);
/*
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(data);
*/
    /*
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
    */
}

function removeDigitalData() {

    xChart.data.labels.shift();
    xChart.data.datasets[0].data.shift();

    yChart.data.labels.shift();
    yChart.data.datasets[0].data.shift();

    zChart.data.labels.shift();
    zChart.data.datasets[0].data.shift();

/*
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
*/
    // chart.data.labels.shift();
    // chart.data.datasets.forEach((dataset) => {
    //     dataset.data.shift();
    // });
    // chart.update();
}

async function renderCharts(){
    xChart.update();
    yChart.update();
    zChart.update();
}

function updateDigitalChart(data){
    //console.log(data);
    
    let pipe = data[4] - 48;

    let dataPipe = new Array(5);

    //X
    dataPipe[0] = +(_2Complement2Float((0xFF00 & (data[6]<<8)) + (0x00FF & data[7]))*(16/4095)).toFixed(3);
    //Y
    dataPipe[1] = +(_2Complement2Float((0xFF00 & (data[8]<<8)) + (0x00FF & data[9]))*(16/4095)).toFixed(3);
    //Z
    dataPipe[2] = +(_2Complement2Float((0xFF00 & (data[10]<<8)) + (0x00FF & data[11]))*(16/4095)).toFixed(3);
    //Bateria
    dataPipe[3] = +(data[12]/10).toFixed(1);
    //Tempo
    dataPipe[4] = 0xFFFFFFFF & ((0xFF000000 & (data[13]<<24)) + (0xFF0000 & (data[14]<<16)) + (0xFF00 & (data[15]<<8)) + (0xFF & data[16]));
    //console.log(data[6]);
    
    sampleCounter++;
    //let realTimeClock = new Date();

    if(axisDisplayng == "sample"){
        addDigitalData(sampleCounter, dataPipe);
    }
    else if(axisDisplayng == "realTime"){
        addDigitalData((realTimeClock.getHours()<10?("0").concat(getHours().toString()):realTimeClock.getHours().toString()).concat(":").concat(realTimeClock.getMinutes()<10?("0").concat(getMinutes().toString()):realTimeClock.getMinutes().toString()).concat(":").concat(realTimeClock.getSeconds()<10?("0").concat(realTimeClock.getSeconds().toString()):realTimeClock.getSeconds().toString()), dataPipe);
    }
    else if(axisDisplayng == "time"){
        realTimeClock = +realTimeClock;
        addDigitalData(realTimeClock - millisecondsCounter, dataPipe);
    }
    if(sampleCounter>500){
        removeDigitalData();
    }
    //renderCharts();
    
    //realTimeClock = +realTimeClock;

    sendToServer(pipe, dataPipe, dataPipe[4]);

}

function sendToServer(pipe, dataPipe, time){
    socket.emit("acc" + pipe.toString() + "data", _labels[parseInt(pipe)], dataPipe, time);
}

function _2Complement2Float(number){
    number = number & 0xFFFF;
    if((number & 0x8000) != 0)
        return -(0xFFFF & (-number));
    else
        return (0xFFFF & number);

}

function blinkAcc(pipe){
    $('#acc' + pipe.toString() + 'Button').css('animation', 'blink 1s alternate infinite');
    globalSTMport.write("pipe" + pipe.toString() + ":blink");

    setTimeout(function(){
        $('#acc' + pipe.toString() + 'Button').attr("onclick", "NotBlinkAcc('"+pipe+"')");
    }, 10);
}

function NotBlinkAcc(pipe){
    $('#acc' + pipe.toString() + 'Button').css('animation', '');
    globalSTMport.write("pipe" + pipe.toString() + ":!blink");

    setTimeout(function(){
        $('#acc' + pipe.toString() + 'Button').attr("onclick", "blinkAcc('"+pipe+"')");
    }, 10);
}

function startCmd(){
    socket.emit("create header", _labels);

    Object.keys(_labels).forEach((index)=>{
        globalSTMport.write("pipe" + index.toString() + ":start");
        //globalSTMport.write("pipe" + index.toString() + ":IniciarSemFiltro1");
    });

    $("#startStopButtonId").html("Parar");
    
    setTimeout(function(){
        $("#startStopButtonId").attr("onclick", "stopCmd()");
        $("#startStopButtonId").attr("class", "stopButton");
    }, 10);

    renderChartsInterval = setInterval(function(){
        renderCharts();
    }, _chartUpdateTime);

}

function stopCmd(){

    clearInterval(renderChartsInterval);

    Object.keys(_labels).forEach((index)=>{
        globalSTMport.write("pipe" + index.toString() + ":stop");
        //globalSTMport.write("pipe" + index.toString() + ":Parar");
    });

    $("#startStopButtonId").html("Começar");
    
    setTimeout(function(){
        $("#startStopButtonId").attr("onclick", "startCmd()");
        $("#startStopButtonId").attr("class", "startButton");
        socket.emit("stop", _labels);
    }, 10);
}

function changeSampleRate(sampleRate){
    globalSTMport.write("pipe0:f" + sampleRate.toString());
    globalSTMport.write("pipe1:f" + sampleRate.toString());
    globalSTMport.write("pipe2:f" + sampleRate.toString());
    globalSTMport.write("pipe3:f" + sampleRate.toString());
    globalSTMport.write("pipe4:f" + sampleRate.toString());
    globalSTMport.write("pipe5:f" + sampleRate.toString());
    socket.emit("change sample rate", sampleRate);
}

function changeAccName(val, acc){
    xChart.data.datasets[acc].label = val;
    yChart.data.datasets[acc].label = val;
    zChart.data.datasets[acc].label = val;
    xChart.update();
    yChart.update();
    zChart.update();
    _labels[acc] = val;
}

function changeAccEnable(id){
    id = id.toString();
    if($("#" + id).prop("checked")){
        /*Frontend changes*/
        $("#acc" + id[3] + "Name").removeAttr("disabled");
        xChart.data.datasets[parseInt(id[3])].hidden = false;
        yChart.data.datasets[parseInt(id[3])].hidden = false;
        zChart.data.datasets[parseInt(id[3])].hidden = false;
        xChart.update();
        yChart.update();
        zChart.update();

        /*Backend changes*/
        _labels.splice(parseInt(id[3]), 0, xChart.data.datasets[parseInt(id[3])].label);
        _activesAcc[parseInt(id[3])] = true;
    }
    else{
        $("#acc" + id[3] + "Name").attr("disabled", "true");
        xChart.data.datasets[parseInt(id[3])].hidden = true;
        yChart.data.datasets[parseInt(id[3])].hidden = true;
        zChart.data.datasets[parseInt(id[3])].hidden = true;
        xChart.update();
        yChart.update();
        zChart.update();

        _labels.splice(parseInt(id[3]), 1);
        _activesAcc[parseInt(id[3])] = false;
    }
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
        $("#" + "partitionTypeId").removeAttr("disabled");
        $("#" + "partitionTimeSizeId").removeAttr("disabled");
        socket.emit('turn partition', true);
    }
    else{
        $("#" + "partitionTypeId").attr("disabled", "true");
        $("#" + "partitionTimeSizeId").attr("disabled", "true");
        socket.emit('turn partition', false);
    }
    
}

function changePartitionType(newType){
    socket.emit('change partition type', newType);
}

function changePartitionSize(newSize){
    socket.emit('change partition size', newSize);
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

  //socket.emit("create header", _sampleRate, 3, true, 100, "MB", _labels);
  