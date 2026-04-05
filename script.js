import {
collection,
addDoc,
getDocs,
doc,
getDoc,
updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const membersCollection = collection(window.db,"members");

let currentMemberId=null;
let members=[];
let transactions = [];
let mainChart;
let isAdmin=false;


// PAGE CONTROL
function showPage(id){

document.querySelectorAll(".page").forEach(p=>{
p.style.display="none";
});

let page=document.getElementById(id);
if(page) page.style.display="block";

}

window.showLogin=()=>showPage("loginPage");
window.showUserLogin=()=>showPage("userLoginPage");
window.showCreate=()=>showPage("createPage");
window.showReset=()=>showPage("resetPage");
window.showAdminLogin=()=>showPage("adminLogin");
window.goHome=()=>showPage("homePage");
window.openMembersPage=()=>{showPage("membersPage");loadMembers();}

window.openDashboard=function(){

showPage("dashboard");
loadTotalSavings();
loadDashboardChart();

}

window.logout=()=>showPage("loginPage");


// USER LOGIN
window.loginUser=function(){

let user=document.getElementById("loginUser").value;
let pin=document.getElementById("loginPin").value;

if(!user||!pin){
alert("Enter username and PIN");
return;
}

isAdmin=false;

let addMember=document.getElementById("addMemberSection");

if(addMember){
addMember.style.display="none";
}

alert("Login successful");

showPage("dashboard");

}





// CREATE ACCOUNT
window.createAccount=function(){

let user=document.getElementById("newUser").value;
let phone=document.getElementById("newPhone").value;
let pin=document.getElementById("newPin").value;
let confirm=document.getElementById("confirmPin").value;
let answer=document.getElementById("newAnswer").value;

if(!user||!phone||!pin||!confirm||!answer){
alert("Fill all fields");
return;
}

if(pin!==confirm){
alert("PIN does not match");
return;
}

alert("Account created");
showPage("loginPage");

}


// RESET PASSWORD
window.resetPassword=function(){

let user=document.getElementById("resetUser").value;
let answer=document.getElementById("resetAnswer").value;
let pin=document.getElementById("newPinReset").value;

if(!user||!answer||!pin){
alert("Fill all fields");
return;
}

alert("Password reset successful");
showPage("loginPage");

}


// ADMIN LOGIN
window.loginAdmin=function(){

let pass=document.getElementById("adminPass").value;

if(pass==="078077"){

isAdmin=true;

alert("Admin login successful");

showPage("dashboard");

}else{

alert("Wrong admin password");

}

}


// ADD MEMBER
window.addMember=function(){

let name=document.getElementById("memberName").value;
let phone=document.getElementById("memberPhoneInput").value;
let photoInput=document.getElementById("memberPhoto");

if(!name||!phone){
alert("Enter name and phone");
return;
}

let reader=new FileReader();

reader.onload=async function(e){

let photo=e.target.result;

await addDoc(membersCollection,{
name:name,
phone:phone,
photo:photo,
balance:0,
transactions:[]
});

alert("Member added");
loadMembers();

};

if(photoInput.files[0]){
reader.readAsDataURL(photoInput.files[0].slice(0,800000));
}else{
reader.onload({target:{result:""}});
}

}


// LOAD MEMBERS
async function loadMembers(){

let list=document.getElementById("membersList");
if(!list) return;

list.innerHTML="Loading...";

const snapshot=await getDocs(membersCollection);

list.innerHTML="";
members=[];

snapshot.forEach(docSnap=>{

let m=docSnap.data();
m.id=docSnap.id;

members.push(m);

let card=document.createElement("div");

card.innerHTML=`

<div style="border:1px solid #ccc;padding:10px;margin:10px">

<img src="${m.photo}" width="80"><br>

<b>${m.name}</b><br>
${m.phone}<br>

<button onclick="openMember('${m.id}')">Open</button>

</div>

`;

list.appendChild(card);

});

}


// LIVE MEMBER SEARCH
window.searchMembers=function(){

let search=document.getElementById("searchMember").value.toLowerCase();
let cards=document.querySelectorAll("#membersList div");

cards.forEach(card=>{

let text=card.innerText.toLowerCase();

if(text.includes(search)){
card.style.display="block";
}else{
card.style.display="none";
}

});

}


// OPEN MEMBER
window.openMember=async function(id){

currentMemberId=id;

let ref=doc(window.db,"members",id);
let snap=await getDoc(ref);

let m=snap.data();

document.getElementById("memberTitle").innerText=m.name;
document.getElementById("memberPhoneDisplay").innerText=m.phone;
document.getElementById("balance").innerText = Number(m.balance) || 0;
document.getElementById("memberPhotoDisplay").src=m.photo;

showPage("memberPage");

loadTransactions(m.transactions);

// SAFE ADMIN UI CONTROL
let amountSection = document.getElementById("amountSection");
let editBtn = document.getElementById("editProfileBtn");

if(!isAdmin){

if(amountSection)
amountSection.style.display="none";

if(editBtn)
editBtn.style.display="none";

if(withdrawBtn)
withdrawBtn.style.display="none";

if(addMemberBtn)
addMemberBtn.style.display="none";

}
// SHOW TRANSACTIONS
function loadTransactions(txns){

let table=document.getElementById("txnHistory");
if(!table) return;

table.innerHTML="";

txns.forEach((t,i)=>{

let row=document.createElement("tr");

row.innerHTML=`
<td>${i+1}</td>
<td>${t.date}</td>
<td>${t.type}</td>
<td>${t.amount}</td>
<td>${t.balance}</td>
<td>
<button onclick="deleteTransaction(${i})">Delete</button>
</td>
`;

table.appendChild(row);

});

}


// DELETE TRANSACTION
window.deleteTransaction = async function(index){

if(!isAdmin){
alert("Only admin can delete transactions");
return;
}

let ref = doc(window.db,"members",currentMemberId);
let snap = await getDoc(ref);

let m = snap.data();

m.transactions.splice(index,1);

let balance = 0;

m.transactions.forEach(t=>{
balance = t.balance;
});

await updateDoc(ref,{
transactions:m.transactions,
balance:balance
});

openMember(currentMemberId);

}


// DEPOSIT
window.addSaving = async function(){

if(!isAdmin){
alert("Only admin can deposit");
return;
}

let amount = parseInt(document.getElementById("amount").value);

if(!amount){
alert("Enter amount");
return;
}

let ref = doc(window.db,"members",currentMemberId);
let snap = await getDoc(ref);

let m = snap.data();

let currentBalance = Number(m.balance) || 0;
let newBalance = currentBalance + amount;

m.transactions.push({
date:new Date().toLocaleDateString(),
type:"Deposit",
amount:amount,
balance:newBalance
});

await updateDoc(ref,{
balance:newBalance,
transactions:m.transactions
});

openMember(currentMemberId);

loadTotalSavings();
loadDashboardChart();

}


// WITHDRAW
window.withdraw = async function(){

if(!isAdmin){
alert("Only admin can withdraw");
return;
}

let amount = parseInt(document.getElementById("amount").value);

let ref = doc(window.db,"members",currentMemberId);
let snap = await getDoc(ref);

let m = snap.data();

let currentBalance = Number(m.balance) || 0;

if(amount > currentBalance){
alert("Insufficient balance");
return;
}

let newBalance = currentBalance - amount;

m.transactions.push({
date:new Date().toLocaleDateString(),
type:"Withdraw",
amount:amount,
balance:newBalance
});

await updateDoc(ref,{
balance:newBalance,
transactions:m.transactions
});

openMember(currentMemberId);

loadTotalSavings();
loadDashboardChart();

}


// DASHBOARD CHART
window.loadDashboardChart = async function(){

const snapshot=await getDocs(collection(window.db,"members"));

let labels=[];
let data=[];

snapshot.forEach(docSnap=>{

let m=docSnap.data();

labels.push(m.name);
data.push(Number(m.balance)||0);

});

let ctx=document.getElementById("mainChart").getContext("2d");

if(mainChart){
mainChart.destroy();
}

mainChart=new Chart(ctx,{
type:"bar",
data:{
labels:labels,
datasets:[{
label:"Member Savings",
data:data
}]
},
options:{
responsive:true
}
});

}


// TOTAL SAVINGS
async function loadTotalSavings(){

const snapshot=await getDocs(collection(window.db,"members"));

let total=0;

snapshot.forEach(docSnap=>{
let m=docSnap.data();
total+=Number(m.balance)||0;
});

let el=document.getElementById("totalSavings");
if(el) el.innerText="UGX "+total;

}


// START APP
window.onload=function(){
showPage("homePage");
};


// EDIT MEMBER
window.editMember = async function(){

let name = prompt("Enter new name");
let phone = prompt("Enter new phone");

if(!name || !phone){
alert("Cancelled");
return;
}

let ref = doc(window.db,"members",currentMemberId);

await updateDoc(ref,{
name:name,
phone:phone
});

alert("Profile updated");

openMember(currentMemberId);

}


// CHANGE PHOTO
window.changePhoto = function(){

let input = document.createElement("input");
input.type="file";
input.accept="image/*";

input.onchange = function(){

let file = input.files[0];

let reader = new FileReader();

reader.onload = async function(e){

let photo = e.target.result;

let ref = doc(window.db,"members",currentMemberId);

await updateDoc(ref,{
photo:photo
});

alert("Photo updated");

openMember(currentMemberId);

}

reader.readAsDataURL(file.slice(0,800000));

}

input.click();

}


// EDIT TRANSACTION
window.editTransaction = async function(index){

let ref = doc(window.db,"members",currentMemberId);
let snap = await getDoc(ref);

let m = snap.data();

let t = m.transactions[index];

let newAmount = prompt("Enter new amount",t.amount);

if(!newAmount) return;

t.amount = parseInt(newAmount);

await updateDoc(ref,{
transactions:m.transactions
});

openMember(currentMemberId);

}

window.withdrawSaving = function(){
withdraw();
}

window.editProfile = function(){
editMember();
}
window.callMember = function(){

let phone = document.getElementById("memberPhoneDisplay").innerText;

if(!phone){
alert("No phone number");
return;
}

window.location.href = "tel:"+phone;

}

window.whatsappMember = function(){

let phone = document.getElementById("memberPhoneDisplay").innerText;

if(!phone){
alert("No phone number");
return;
}

phone = phone.replace("+","");

window.open("https://wa.me/"+phone,"_blank");

}
}

window.loadTotalSavings = async function(){

let total = 0;

const snapshot = await getDocs(collection(window.db,"members"));

snapshot.forEach(docSnap=>{
let m = docSnap.data();
total += Number(m.balance) || 0;
});

let totalDisplay = document.getElementById("totalSavings");

if(totalDisplay){
totalDisplay.innerText = total;
}

}

loadTotalSavings();

window.openDeveloper = function(){
window.location.href = "Developer.html";
}

function loadDashboardChart(){
console.log("Dashboard chart loaded");
}






function loadChart(){

let ctx=document.getElementById("membersChart");

new Chart(ctx,{
type:'bar',
data:{
labels:["Members"],
datasets:[{
label:"Total Members",
data:[members.length],
backgroundColor:"#22c55e"
}]
}
});

}
window.showLogin = function(){

document.getElementById("homePage").style.display = "none";
document.getElementById("loginPage").style.display = "block";



window.showLogin = function () {

document.getElementById("homePage").style.display = "none";
document.getElementById("loginPage").style.display = "block";

};


}
window.goHome();

function copyNumber(){
navigator.clipboard.writeText("0776083223");
alert("Deposit number copied!");
}