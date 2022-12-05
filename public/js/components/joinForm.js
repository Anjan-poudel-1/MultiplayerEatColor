let inputField = document.getElementById("room_name");
let joinBtn = document.getElementById("join-btn");
let createBtn = document.getElementById("create-btn");
let tryElement = document.getElementsByTagName("button");
let selectGame = document.getElementsByClassName("selectGame");

console.log(inputField);
console.log(selectGame);
console.log(tryElement);
console.log("first");
console.log(createBtn);

setTimeout(() => {
    let createBtn = document.getElementById("create-btn");
    console.log(createBtn);
}, 2000);

function createGame() {
    console.log("The button is clicked");
    console.log(inputField);
    console.log(inputField.innerText);
}
