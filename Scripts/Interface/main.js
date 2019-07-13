/*File system configuration*/
const fs = require('fs');
const pathModule = require('path');
let _path = __dirname;
let pathToSave;
let _client = "Cliente";
let _machine = "Maquina";
let _worker = "Responsável";
let _sampleRate = 500;
let _partitionEnabled = false;
let _partitionByTime, _partitionBySize, _partitionSize;
let _partitionInterval;
let _labels;
let _activesAcc;
let _activesDAqs;
let closeConfirmation = false;

/*Express configuration*/
var express = require('express');
var appExpress = express();
var http = require('http').Server(appExpress);

appExpress.use("/", express.static(__dirname + "/"));

appExpress.get('/', function (req, res) {
  res.sendFile(__dirname + '/sandbox.html');
});

http.listen(8013, function () {
  console.log('listening on *:8013');
});

/*Electron configuration*/
const electron = require('electron');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

app.on('ready', function () {
  mainWindow = new BrowserWindow({
    frame: false,
    width: 900,
    height: 700,
    minWidth: 900,
    minHeight: 700,
    icon: './art/logo_kot.PNG',
    autoHideMenuBar: true,
    show: false
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  setTimeout(function () {
    //mainWindow.loadURL("file:/C:\\Users\\Felipe\ Gomes\\Desktop\\Francisco\\08-STM32F103C8T6\\Interface\\daqjs\\index.html");
    mainWindow.loadURL("file:/" + __dirname + "\\sandbox.html");
  }, 2000);

});

app.on('window-all-closed', app.quit);
app.on('before-quit', () => {
  mainWindow.removeAllListeners('close');
  mainWindow.close();
});

/*Socket.io configuration*/
var io = require('socket.io')(http);
let accFiles = [0, 0, 0, 0, 0, 0];
let daqFiles = [0, 0, 0, 0, 0, 0];

io.on('connection', function (socket) {
  console.log("Connection opened");

  socket.on('disconnecting', function () {
    console.log("Connection closed");
  });

  _path = pathModule.join(__dirname, '..', '..', "log");
  socket.emit('current folder', _path);

  socket.on('change client', function (client) {
    _client = client;
  });

  socket.on('change machine', function (machine) {
    _machine = machine;
  });

  socket.on('change worker', function (worker) {
    _worker = worker;
  });

  socket.on('change sample rate', function (newSample) {
    _sampleRate = newSample;
  });

  socket.on('turn partition', function (enableDisable, size, type) {
    if (_partitionEnabled = enableDisable) {
      _partitionSize = size;
      if (type == "MB") {
        _partitionByTime = false;
        _partitionBySize = true;
      } else {
        _partitionByTime = true;
        _partitionBySize = false;
      }
    }
  });

  socket.on('change partition type', function (type) {
    _partitionBySize = type.includes("MB");
    _partitionByTime = type.includes("min");
  });

  socket.on('change partition size', function (siz) {
    _partitionSize = siz;
  });

  socket.on('change path', function (path) {
    _path = path;
  });

  socket.on('create digital header', function (labels = [0, 0, 0], activesAcc) {
    let date = new Date;
    let dateAux = (parseInt(date.getDate())).toString() + '.' + (parseInt(date.getMonth()) + 1).toString() + '.' + date.getFullYear();
    pathToSave = _path;
    _labels = labels;
    _activesAcc = activesAcc;

    //Create the specified folder
    try {
      fs.mkdirSync(pathToSave);
    } catch (err) {
      if (err.message.includes("ENOENT"))
        socket.emit('show alert', 'Nao foi possivel acessar o diretorio especificado. Tenha certeza que ele existe.');
    }

    //Create the folder with the current day
    try {
      fs.mkdirSync(pathToSave + "\\" + dateAux);
    } catch (err) {}

    let timeNow = new Date;
    timeNow = timeNow.getHours() + '_' + timeNow.getMinutes();

    //Create the folder with the current time
    try {
      fs.mkdirSync(pathToSave + "\\" + dateAux + "\\" + timeNow);
    } catch (err) {}

    pathToSave = _path + "\\" + dateAux + "\\" + timeNow;

    //Header file text
    let numberOfAccs = +_labels.length;
    let fileText = "**Ensaio de vibração com acelerometro digital - " + dateAux + "**\r\n\r\nFrequência de amostragem: " + _sampleRate.toString() + "Hz\r\nAcelerometros: " + numberOfAccs.toString() + "\r\n";
    fileText += "-----------------------------------------\r\n";
    fileText += "Cliente: " + _client + "\r\n";
    fileText += "Máquina: " + _machine + "\r\n";
    fileText += "Responsável: " + _worker + "\r\n";
    fileText += "-----------------------------------------\r\n";
    if (_partitionEnabled)
      fileText += "Arquivos particionados: sim\r\nParticoes de: " + (_partitionSize).toString() + (_partitionBySize ? "MB" : "min") + "\r\n";
    else
      fileText += "Arquivos particionados: nao\r\n";

    fileText += "-----------------------------------------\r\n";
    fileText += "Início: " + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + "\r\n";

    //Create the header file
    try {
      fs.writeFileSync(pathToSave + "\\cabecalho.txt", fileText);
    } catch (err) {}

    timeNow = new Date;
    timeNow = '_' + timeNow.getHours() + '_' + timeNow.getMinutes() + '_' + timeNow.getSeconds();
    //Create the log files
    Object.keys(_labels).forEach((index) => {
      //Create the folder with the acc
      try {
        fs.mkdirSync(pathToSave + "\\" + _labels[index]);
      } catch (err) {}

      //Initialize the stream data
      for (let i = 0, counter = 0; i < 6; i++) {
        if (_activesAcc[i]) {
          counter++;
          if (counter > index) {
            accFiles[i] = fs.createWriteStream(pathToSave + '\\' + _labels[index] + "\\" + _labels[index] + timeNow + ".txt");
            i = 6;
          }
        }
      }

      //accFiles[index] = fs.createWriteStream(pathToSave + '\\' + _labels[index] + "\\" + _labels[index] + timeNow + ".txt");
    });

    /*Creates partition's routine and set its flags*/
    if (_partitionEnabled) {
      if (_partitionByTime) {

        _partitionInterval = setInterval(function () {
          let timeNow = new Date;
          timeNow = '_' + timeNow.getHours() + '_' + timeNow.getMinutes() + '_' + timeNow.getSeconds();

          Object.keys(_labels).forEach((index) => {
            try {
              fs.mkdirSync(pathToSave + "\\" + _labels[index]);
            } catch (err) {
              if (err.message.includes("ENOENT"))
                socket.emit('show alert', 'Nao foi possivel acessar o diretorio do acelerometro');
            }

            for (let i = 0, counter = 0; i < 6; i++) {
              if (_activesAcc[i]) {
                counter++;
                if (counter > index) {
                  if (accFiles[i])
                    accFiles[i].end();
                  accFiles[i] = fs.createWriteStream(pathToSave + '\\' + _labels[index] + "\\" + _labels[index] + timeNow + ".txt");
                  i = 6;
                }
              }
            }

            // if (accFiles[index])
            //   accFiles[index].end();
            // accFiles[index] = fs.createWriteStream(pathToSave + '\\' + _labels[index] + "\\" + _labels[index] + timeNow + ".txt");
          });

        }, _partitionSize * 60000);
      } else {
        _partitionSize = _partitionSize * 1000000;
        timeNow = [timeNow, timeNow, timeNow, timeNow, timeNow, timeNow];

        _partitionInterval = setInterval(function () {
          let siz;
          // let timeNow = new Date;
          //timeNow = '_' + timeNow.getHours() + '_' + timeNow.getMinutes() + '_' + timeNow.getSeconds();

          Object.keys(_labels).forEach((index) => {
            siz = fs.statSync(pathToSave + '\\' + _labels[index] + "\\" + _labels[index] + timeNow[index] + ".txt").size;
            if (siz >= _partitionSize) {
              timeNow[index] = new Date;
              timeNow[index] = '_' + timeNow[index].getHours() + '_' + timeNow[index].getMinutes() + '_' + timeNow[index].getSeconds();
              for (let i = 0, counter = 0; i < 6; i++) {
                if (_activesAcc[i]) {
                  counter++;
                  if (counter > index) {
                    accFiles[i].end();
                    accFiles[i] = fs.createWriteStream(pathToSave + '\\' + _labels[index] + "\\" + _labels[index] + timeNow[index] + ".txt");
                    i = 6;
                  }
                }
              }
            }
          });
        }, 500);
      }
    }

  });

  socket.on('create analog header', function (labels, activesDAqs) {
    let date = new Date;
    let dateAux = (parseInt(date.getDate())).toString() + '.' + (parseInt(date.getMonth()) + 1).toString() + '.' + date.getFullYear();
    pathToSave = _path;
    _labels = labels;
    _activesDAqs = activesDAqs;
    _sampleRate = 2500;

    //Create the specified folder
    try {
      fs.mkdirSync(pathToSave);
    } catch (err) {
      if (err.message.includes("ENOENT"))
        socket.emit('show alert', 'Nao foi possivel acessar o diretorio especificado. Tenha certeza que ele existe.');
    }

    //Create the folder with the current day
    try {
      fs.mkdirSync(pathToSave + "\\" + dateAux);
    } catch (err) {}

    let timeNow = new Date;
    timeNow = timeNow.getHours() + '_' + timeNow.getMinutes();

    //Create the folder with the current time
    try {
      fs.mkdirSync(pathToSave + "\\" + dateAux + "\\" + timeNow);
    } catch (err) {}

    pathToSave = _path + "\\" + dateAux + "\\" + timeNow;

    //Header file text
    let numberOfDAqs = +_labels.length;
    let fileText = "**Ensaio de vibração com acelerometro analógico - " + dateAux + "**\r\n\r\n";
    fileText += "Frequência de amostragem: " + _sampleRate.toString() + "Hz\r\n";
    fileText += "DAqs: " + numberOfDAqs.toString() + "\r\n";
    fileText += "-----------------------------------------\r\n";
    fileText += "Cliente: " + _client + "\r\n";
    fileText += "Máquina: " + _machine + "\r\n";
    fileText += "Responsável: " + _worker + "\r\n";
    fileText += "-----------------------------------------\r\n";
    if (_partitionEnabled)
      fileText += "Arquivos particionados: sim\r\nParticoes de: " + (_partitionSize).toString() + (_partitionBySize ? "MB" : "min") + "\r\n";
    else
      fileText += "Arquivos particionados: nao\r\n";

    fileText += "-----------------------------------------\r\n";
    fileText += "Início: " + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + "\r\n";

    //Create the header file
    try {
      fs.writeFileSync(pathToSave + "\\cabecalho.txt", fileText);
    } catch (err) {}

    timeNow = new Date;
    timeNow = '_' + timeNow.getHours() + '_' + timeNow.getMinutes() + '_' + timeNow.getSeconds();
    //Create the log files
    Object.keys(_labels).forEach((index) => {
      //Create the folder with the daq's name
      try {
        fs.mkdirSync(pathToSave + "\\" + _labels[index].daqName);
        //Create the header file for channels
        try {
          fileText = 'Canais analogicos - ' + dateAux + '\r\n\r\n';
          (_labels[index].activesChannels).forEach(function (element, index) {
            if (element) {
              fileText += 'Canal ' + index.toString() + ': ';
              fileText += _labels[index].channelName[i] + '\r\n';
            } else {
              fileText += "Canal " + index.toString() + ' inativo\r\n'
            }
          });
          fs.writeFileSync(pathToSave + "\\" + _labels[index].daqName + "\\cabecalho.txt", fileText);
        } catch (err) {}
      } catch (err) {}

      //Initialize the stream data
      for (let i = 0, counter = 0; i < 6; i++) {
        if (_activesDAqs[i]) {
          counter++;
          if (counter > index) {
            daqFiles[i] = fs.createWriteStream(pathToSave + '\\' + _labels[index].daqName + "\\" + _labels[index].daqName + timeNow + ".txt");
            i = 6;
          }
        }
      }
    });

    /*Creates partition's routine and set its flags*/
    if (_partitionEnabled) {
      if (_partitionByTime) {

        _partitionInterval = setInterval(function () {
          let timeNow = new Date;
          timeNow = '_' + timeNow.getHours() + '_' + timeNow.getMinutes() + '_' + timeNow.getSeconds();

          Object.keys(_labels).forEach((index) => {
            try {
              fs.mkdirSync(pathToSave + "\\" + _labels[index].daqName);
            } catch (err) {
              if (err.message.includes("ENOENT"))
                socket.emit('show alert', 'Nao foi possivel acessar o diretorio do acelerometro');
            }

            for (let i = 0, counter = 0; i < 6; i++) {
              if (_activesDAqs[i]) {
                counter++;
                if (counter > index) {
                  if (daqFiles[i])
                    daqFiles[i].end();
                  daqFiles[i] = fs.createWriteStream(pathToSave + '\\' + _labels[index].daqName + "\\" + _labels[index] + timeNow + ".txt");
                  i = 6;
                }
              }
            }
          });

        }, _partitionSize * 60000);
      } else {
        _partitionSize = _partitionSize * 1000000;
        timeNow = [timeNow, timeNow, timeNow, timeNow, timeNow, timeNow];

        _partitionInterval = setInterval(function () {
          let siz;

          Object.keys(_labels).forEach((index) => {
            siz = fs.statSync(pathToSave + '\\' + _labels[index].daqName + "\\" + _labels[index].daqName + timeNow[index] + ".txt").size;
            if (siz >= _partitionSize) {
              timeNow[index] = new Date;
              timeNow[index] = '_' + timeNow[index].getHours() + '_' + timeNow[index].getMinutes() + '_' + timeNow[index].getSeconds();
              for (let i = 0, counter = 0; i < 6; i++) {
                if (_activesDAqs[i]) {  
                  counter++;
                  if (counter > index) {
                    daqFiles[i].end();
                    daqFiles[i] = fs.createWriteStream(pathToSave + '\\' + _labels[index].daqName + "\\" + _labels[index].daqName + timeNow[index] + ".txt");
                    i = 6;
                  }
                }
              }
            }
          });
        }, 500);
      }
    }

  });

  socket.on('daq0data', function (data, time) {
    let dataAux = '';
    for (let i = 0; i < 4; i++) {
      dataAux += data[i].toString() + '\t';
    }
    dataAux += time.toString() + "\r\n";

    daqFiles[0].write(dataAux);
    //console.log(dataAux);
  });

  socket.on('daq1data', function (data, time) {
    let dataAux = '';
    for (let i = 0; i < 4; i++) {
      dataAux += data[i].toString() + '\t';
    }
    dataAux += time.toString() + "\r\n";

    daqFiles[1].write(dataAux);
  });

  socket.on('daq2data', function (data, time) {
    let dataAux = '';
    for (let i = 0; i < 4; i++) {
      dataAux += data[i].toString() + '\t';
    }
    dataAux += time.toString() + "\r\n";

    daqFiles[2].write(dataAux);
  });

  socket.on('daq3data', function (data, time) {
    let dataAux = '';
    for (let i = 0; i < 4; i++) {
      dataAux += data[i].toString() + '\t';
    }
    dataAux += time.toString() + "\r\n";

    daqFiles[3].write(dataAux);
  });

  socket.on('daq4data', function (data, time) {
    let dataAux = '';
    for (let i = 0; i < 4; i++) {
      dataAux += data[i].toString() + '\t';
    }
    dataAux += time.toString() + "\r\n";

    daqFiles[4].write(dataAux);
  });

  socket.on('daq5data', function (data, time) {
    let dataAux = '';
    for (let i = 0; i < 4; i++) {
      dataAux += data[i].toString() + '\t';
    }
    dataAux += time.toString() + "\r\n";

    daqFiles[5].write(dataAux);
  });

  socket.on('stop analog', function (labels) {
    _activesDAqs.forEach(function (element, index) {
      if (element)
        daqFiles[index].end();
    });

    let date = new Date;
    let fileText = "Termino: " + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + "\r\n";

    //Finish the header file
    try {
      fs.appendFileSync(pathToSave + "\\cabecalho.txt", fileText);
    } catch (err) {
      socket.emit('show alert', "Erro ao tentar acessar o diretorio especificado. Tenha certeza que o programa possui permissao para acessar a pasta");
    }

    if (_partitionEnabled)
      clearInterval(_partitionInterval);

  });

  socket.on('acc0data', function (data, time, absFlag) {
    if (absFlag)
      accFiles[0].write(data[0].toString() + '\t' + data[1].toString() + '\t' + data[2].toString() + '\t' + data[3].toString() + '\t' + time.toString() + '\r\n');
    else
      accFiles[0].write(data[0].toString() + '\t' + data[1].toString() + '\t' + data[2].toString() + '\t' + time.toString() + '\r\n');
  });

  socket.on('acc1data', function (data, time, absFlag) {
    if (absFlag)
      accFiles[1].write(data[0].toString() + '\t' + data[1].toString() + '\t' + data[2].toString() + '\t' + data[3].toString() + '\t' + time.toString() + '\r\n');
    else
      accFiles[1].write(data[0].toString() + '\t' + data[1].toString() + '\t' + data[2].toString() + '\t' + time.toString() + '\r\n');
  });

  socket.on('acc2data', function (data, time, absFlag) {
    if (absFlag)
      accFiles[2].write(data[0].toString() + '\t' + data[1].toString() + '\t' + data[2].toString() + '\t' + data[3].toString() + '\t' + time.toString() + '\r\n');
    else
      accFiles[2].write(data[0].toString() + '\t' + data[1].toString() + '\t' + data[2].toString() + '\t' + time.toString() + '\r\n');
  });

  socket.on('acc3data', function (data, time, absFlag) {
    if (absFlag)
      accFiles[3].write(data[0].toString() + '\t' + data[1].toString() + '\t' + data[2].toString() + '\t' + data[3].toString() + '\t' + time.toString() + '\r\n');
    else
      accFiles[3].write(data[0].toString() + '\t' + data[1].toString() + '\t' + data[2].toString() + '\t' + time.toString() + '\r\n');
  });

  socket.on('acc4data', function (data, time, absFlag) {
    if (absFlag)
      accFiles[4].write(data[0].toString() + '\t' + data[1].toString() + '\t' + data[2].toString() + '\t' + data[3].toString() + '\t' + time.toString() + '\r\n');
    else
      accFiles[4].write(data[0].toString() + '\t' + data[1].toString() + '\t' + data[2].toString() + '\t' + time.toString() + '\r\n');
  });

  socket.on('acc5data', function (data, time, absFlag) {
    if (absFlag)
      accFiles[5].write(data[0].toString() + '\t' + data[1].toString() + '\t' + data[2].toString() + '\t' + data[3].toString() + '\t' + time.toString() + '\r\n');
    else
      accFiles[5].write(data[0].toString() + '\t' + data[1].toString() + '\t' + data[2].toString() + '\t' + time.toString() + '\r\n');
  });

  socket.on('stop digital', function (labels) {
    _activesAcc.forEach(function (element, index) {
      if (element)
        accFiles[index].end();
    });

    let date = new Date;
    let fileText = "Termino: " + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + "\r\n";

    //Finish the header file
    try {
      fs.appendFileSync(pathToSave + "\\cabecalho.txt", fileText);
    } catch (err) {
      socket.emit('show alert', "Erro ao tentar acessar o diretorio especificado. Tenha certeza que o programa possui permissao para acessar a pasta");
    }

    if (_partitionEnabled)
      clearInterval(_partitionInterval);

  });

  socket.on('window', function (cmd) {
    if (cmd.includes('minimize')) {
      mainWindow.minimize();
    } else if (cmd.includes('maximize')) {
      if (!mainWindow.isMaximized())
        mainWindow.maximize();
      else {
        mainWindow.restore();
      }
    } else if (cmd.includes('close')) {
      mainWindow.close();


    }
  });

  mainWindow.on('close', function (event) {
    if (closeConfirmation == false) {
      event.preventDefault();
      socket.once('close', function (confirm) {
        if (confirm) {
          closeConfirmation = true;
          mainWindow.close();
          app.quit();
        }
      });
      socket.emit('close');
    }
  })

  mainWindow.on('closed', function () {
    mainWindow.removeAllListeners('close');
  })

});