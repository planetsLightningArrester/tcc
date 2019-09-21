let daqKOTconnected = false;
let testSelected = "analog";
let comSelected;

function loadIntroScreen() {
    /*Main initial container*/
    $("<div id = \"initialConainer\" class = \"flex\" style=\"position: absolute; top: 26vh; left: 30vw; width: 35vh; height: 40vh\"></div>").appendTo('body');
    //Intro animation elements
    $("<div id = \"blankBackground\" style=\"background:#ffffff; width: 22vh; height: 20vh\"></div>").appendTo("#initialConainer");
    $("<div id = \"kotName\"><img class=\"kotNameClass\" src=\"./art/nome_logo_kot.png\"></div>").appendTo("#initialConainer");
    $("<div id = \"kotButton\"><img class=\"kotLogoClass\" src=\"./art/logo_kot.png\"></div>").appendTo("#initialConainer");
    //portSelectScreen();
    //Menu buttons
    $('#initialConainer').append("<div class = \"flex\" id = \"initialVibrationButtonDiv\"  style = \"height: 8vh; margin-top: 3.2vh; margin-left: 10.5vh;\"><a class = \"menuButton\" id = \"initialVibrationButton\" style = \"animation: menuButtonShow 1s 3s forwards;\" onclick = \"vibrationButtonClick()\">Vibração</a></div>");
    $('#initialConainer').append("<div class = \"flex\" id = \"initialExtensometryButtonDiv\" style = \"height: 8vh; margin-top: 0.2vh; margin-left: 10.5vh;\"><a class = \"menuButton\" id = \"initialExtensometryButton\" style = \"animation: menuButtonShow 1s 3s forwards;\">Extensometria</a></div>");
    //ExpandLines
    $("#initialVibrationButtonDiv").append("<div style = \"position: absolute; top: 26.7vh; left: 38.2vh\"><img src = \" ./art/line.png\"  id = \"expandLine1\" style = \"position: absolute; height: .4vh; width: 0\"/><img src = \" ./art/line.png\"  id = \"expandLine2\" style = \"position: absolute; height: .4vh; width: 0; left: 0.5vh; transform: rotateZ(90deg);\"/></div>");
}

function vibrationButtonClick() {
    $("#initialVibrationButton").removeAttr('onclick');

    $("#expandLine1").velocity('finish');
    $("#expandLine2").velocity('finish');

    $("#expandLine1").velocity({
        width: ['7.6vh', 0]
    }, 300);

    $("#expandLine2").velocity({
        width: ['14vh', 0],
        left: ['0.5vh', '7.6vh']
    }, {
        duration: 300,
        delay: 300
    });

    $('#initialConainer').append("<div class = \"flex\" id = \"initialDigitalVibrationButtonDiv\"  style = \"height: 14vh; margin-top: -21vh; margin-left: 48vh;\"><a class = \"menuButton\" id = \"initialDigitalVibrationButton\" style = \"animation: menuButtonShow 1s forwards;\">Digital</a></div>");
    $("#initialDigitalVibrationButton").click(function () {
        initialDigitalVibrationButtonClick();
    });

    $('#initialConainer').append("<div class = \"flex\" id = \"initialAnalogVibrationButtonDiv\" style = \"height: 5vh; margin-top: -4.2vh; margin-left: 48vh;\"><a class = \"menuButton\" id = \"initialAnalogVibrationButton\" style = \"animation: menuButtonShow 1s forwards;\">Analógico</a></div>");
    $("#initialAnalogVibrationButton").click(function () {
        initialAnalogVibrationButtonClick();
    });

    $("#initialDigitalVibrationButton").css("opacity", "1");
    $("#initialAnalogVibrationButton").css("opacity", "1");
    $("#initialExtensometryButton").css("opacity", "1");

    $("#initialExtensometryButton").css("animation", "menuButtonHide 1s forwards");
    $("#initialVibrationButton").attr('onclick', 'vibrationButtonClickReverse()');
    
}

function vibrationButtonClickReverse() {
    $("#initialVibrationButton").removeAttr('onclick');
    $("#initialDigitalVibrationButton").css("animation", "menuButtonHide 1s forwards");
    $("#initialAnalogVibrationButton").css("animation", "menuButtonHide 1s forwards");
    $("#initialExtensometryButton").css("animation", "menuButtonShow 1s forwards");

    $("#expandLine1").velocity('finish');
    $("#expandLine2").velocity('finish');

    $("#expandLine2").velocity({
        width: [0, '14vh'],
        left: ['7.6vh', '0.5vh']
    }, 300);

    $("#expandLine1").velocity({
        width: [0, '7.6vh']
    }, {
        duration: 300,
        delay: 300
    });

    setTimeout(function () {
        $("#initialVibrationButton").attr('onclick', '');
        $("#initialDigitalVibrationButtonDiv").detach();
        $("#initialAnalogVibrationButtonDiv").detach();

        $("#initialVibrationButton").attr('onclick', 'vibrationButtonClick()');

    }, 1000);
}

function initialDigitalVibrationButtonClick() {
    testSelected = "digital";

    $("#initialVibrationButton").css("animation", "menuButtonHide 1s forwards");
    $("#initialAnalogVibrationButton").css("animation", "menuButtonHide 1s forwards");

    $("#expandLine1").velocity({
        width: [0, '7.6vh']
    }, {
        duration: 300,
        delay: 300
    });

    $("#expandLine2").velocity({
        width: [0, '14vh'],
        left: ['7.6vh', '0.5vh']
    }, 300);

    $("#initialDigitalVibrationButton").css("animation", "menuButtonHide 1s 1s forwards");

    setTimeout(function () {
        $("#initialVibrationButtonDiv").detach();
        $("#initialExtensometryButtonDiv").detach();
        $("#initialDigitalVibrationButtonDiv").detach();
        $("#initialAnalogVibrationButtonDiv").detach();
        portSelectScreen();
    }, 1000);

}

function initialAnalogVibrationButtonClick() {
    testSelected = "analog";

    $("#initialVibrationButton").css("animation", "menuButtonHide 1s forwards");
    $("#initialDigitalVibrationButton").css("animation", "menuButtonHide 1s forwards");

    $("#expandLine1").velocity({
        width: [0, '4vw']
    }, 1000);

    $("#expandLine2").velocity({
        width: [0, '7vw']
    }, 1000);

    $("#initialAnalogVibrationButton").css("animation", "menuButtonHide 1s 1s forwards");

    setTimeout(function () {
        $("#initialVibrationButtonDiv").detach();
        $("#initialExtensometryButtonDiv").detach();
        $("#initialDigitalVibrationButtonDiv").detach();
        $("#initialAnalogVibrationButtonDiv").detach();
        portSelectScreen();
    }, 1000);
}

function portSelectScreen() {
    var serialport = require("serialport");

    var SerialPort = serialport.SerialPort;

    let daqRecognized = false;

    daqKOTconnected = false;

    $("#initialConainer").append("<div id = \"portButtons\" class = \"flex\"><img id = \"refreshPortButton\" class=\"refreshCOMportsClass\" src=\"./art/reload.png\" onclick=\"refreshCOMports()\"/></div>");

    $("#portButtons").append("<select id = \"portSelectList\" class = \"selectCOMclass\" onchange = \"portSelectChange(this.value)\" name = \"Porta:\"></select>");

    serialport.list(function (err, ports) {
        ports.forEach(function (port) {
            $("#portSelectList").append($('<option>', {
                value: port.manufacturer.includes("STM") ? (port.comName.toString() + "(DAq KOT)") : port.comName.toString(),
                text: port.manufacturer.includes("STM") ? (port.comName.toString() + "(DAq KOT)") : port.comName.toString(),
                selected: port.manufacturer.includes("STM")
            }));

            daqKOTconnected = daqKOTconnected || port.manufacturer.includes("STM");
            if (port.manufacturer.includes("STM"))
                comSelected = port.comName.toString();

            
            console.log(port.comName);
            console.log(port.pnpId);
            console.log(port.manufacturer);
            

        });

        if (daqKOTconnected) {
            $("<img id = \"initialCheckIcon\" class=\"initialCheckIconClass\" src=\"./art/checkIcon.png\"/>").insertBefore("#portSelectList");
            $("#initialCheckIcon").attr("onclick", "checkIfItsPossibleToOpenConnection()");
        } else {
            $("<img id = \"initialCheckIcon\" class=\"initialCheckIconClass\" src=\"./art/uncheckIcon.png\"/>").insertBefore("#portSelectList");
            $("#initialCheckIcon").removeAttr("onclick");
        }
        $("#initialCheckIcon").css("animation", "initialCheckIconShowUp 1s forwards");

    });

}

function portSelectChange(value) {
    if (value.includes("DAq")) {
        $("#initialCheckIcon").css("animation", "initialCheckIconSpinOut 500ms forwards");
        setTimeout(function () {
            $("#initialCheckIcon").attr("src", "./art/checkIcon.png");
            $("#initialCheckIcon").css("animation", "initialCheckIconSpinIn 500ms forwards");
            $("#initialCheckIcon").attr("onclick", "checkIfItsPossibleToOpenConnection()");
        }, 500);
        comSelected = value.substr(0, value.indexOf('('));
    } else {
        $("#initialCheckIcon").css("animation", "initialCheckIconSpinOut 500ms forwards");
        $("#initialCheckIcon").removeAttr("onclick");
        setTimeout(function () {
            $("#initialCheckIcon").attr("src", "./art/uncheckIcon.png");
            $("#initialCheckIcon").css("animation", "initialCheckIconSpinIn 500ms forwards");
        }, 500);
        comSelected = null;
    }
}

function refreshCOMports() {
    $("#portSelectList").detach();

    $("#refreshPortButton").css("animation", "refreshCOMportsSpin 1s forwards");
    setTimeout(function () {
        $("#refreshPortButton").css("animation", "none");
    }, 1000);

    $("#portButtons").append("<select id = \"portSelectList\" class = \"selectCOMclass\" style = \"animation: none\" onchange = \"portSelectChange(this.value)\" name = \"Porta:\"></select>");

    var serialport = require("serialport");

    var SerialPort = serialport.SerialPort;

    daqKOTconnected = false;

    serialport.list(function (err, ports) {
        ports.forEach(function (port) {
            $("#portSelectList").append($('<option>', {
                value: port.manufacturer.includes("STM") ? (port.comName.toString() + "(DAq KOT)") : port.comName.toString(),
                text: port.manufacturer.includes("STM") ? (port.comName.toString() + "(DAq KOT)") : port.comName.toString(),
                selected: port.manufacturer.includes("STM")
            }));
            daqKOTconnected = daqKOTconnected || port.manufacturer.includes("STM");

            if (port.manufacturer.includes("STM"))
                comSelected = port.comName.toString();

            /*
            console.log(port.comName);
            console.log(port.pnpId);
            console.log(port.manufacturer);
            */
        });

        if (daqKOTconnected) {
            $("#initialCheckIcon").css("animation", "initialCheckIconSpinOut 500ms forwards");
            setTimeout(function () {
                $("#initialCheckIcon").attr("src", "./art/checkIcon.png");
                $("#initialCheckIcon").css("animation", "initialCheckIconSpinIn 500ms forwards");
                $("#initialCheckIcon").attr("onclick", "checkIfItsPossibleToOpenConnection()");
            }, 500);
        } else {
            $("#initialCheckIcon").css("animation", "initialCheckIconSpinOut 500ms forwards");
            setTimeout(function () {
                $("#initialCheckIcon").attr("src", "./art/uncheckIcon.png");
                $("#initialCheckIcon").css("animation", "initialCheckIconSpinIn 500ms forwards");
                $("#initialCheckIcon").removeAttr("onclick");
            }, 500);
        }

    });

}

function checkIfItsPossibleToOpenConnection() {
    var serialport = require("serialport");

    var STMPort = new serialport(comSelected, {
        baudRate: 115200,
        parser: new serialport.parsers.Readline("\n")
    }, function (err) {
        if (err) {
            alert("DAq reconhecido. Porem, nao foi possivel estabelecer conexao. Tente reconecta-lo e atualize a lista de portas COM.");
            console.log((err.message).toString());
        } else {
            STMPort.close();
            fadeInitialItems();
            setTimeout(function () {
                loadAquisitionScreen();
            }, 2000);
        }
    });
}

function fadeInitialItems() {
    $("#refreshPortButton").css("animation", "refreshCOMportsHide 1s forwards");
    $("#initialCheckIcon").css("animation", "initialCheckIconSpinOut 500ms forwards");
    $("#portSelectList").css("animation", "selectCOMHide 1s forwards");
    setTimeout(function () {
        $("#kotName").css("animation", "initialKotNameHide 1s forwards");
        $("#kotButton").css("animation", "initialKotLogoHide 1s forwards");
    }, 1000);
    setTimeout(function () {
        $("#initialCheckIcon").detach();
        $("#refreshPortButton").detach();
        $("#portSelectList").detach();
        $("#kotName").detach();
        $("#kotButton").detach();
        $("#initialConainer").detach();
    }, 2000);
}

function loadAquisitionScreen() {

    /*Side Navigator*/
    /*    $("<div id=\"sideNavId\" class=\"sidenav\"></div>").appendTo('body');
        $("<a href=\"javascript:void(0)\" class=\"closebtn\" onclick=\"closeNav()\">&times;</a>").appendTo("#sideNavId");
        $("<a id = \"vibrationInsideSideNav\" href=\"#\" onclick=\"expandVibrationMenu()\">Vibração</a>").appendTo("#sideNavId");
        $("<a href=\"#\">Extensometria</a>").appendTo("#sideNavId");

        $("<div id = \"sideNavAndLogoButton\"></div>").appendTo('body');
        $("<div id = \"buttonSideNav\"><img onclick = \"openNav()\" height = \"50\" class=\"kotLogoSideNav\" src=\"./art/logo_kot.png\"\></div>").appendTo('#sideNavAndLogoButton');
        $("<div id = \"sideNavIconBackgroundClass\" onclick = \"openNav()\" class = \"sideNavIconBackgroundClass\"></div>").appendTo('#sideNavAndLogoButton');
    */
    if (testSelected.includes("analog")) {
        analogVibration();
    } else if (testSelected.includes("digital")) {
        digitalVibration();
    }
}

function openNav() {
    document.getElementById("sideNavId").style.width = "250px";
    $('#buttonSideNav').css('animation', 'onOpen 1s forwards');
}

function closeNav() {
    document.getElementById("sideNavId").style.width = "0";
    $('#buttonSideNav').css('animation', 'onClose 1s forwards');
}