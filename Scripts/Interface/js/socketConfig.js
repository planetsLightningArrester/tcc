let socket = io('http://localhost:8013');
let pathToSave;

socket.on('show alert', function(msg){
    alert(msg);
});

socket.on('current folder', function(data){
    pathToSave = data;
});