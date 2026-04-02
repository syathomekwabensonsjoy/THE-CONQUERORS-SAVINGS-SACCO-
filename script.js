// DEFAULT MEMBERS

let defaultMembers = [
{name:"BALUKU WILSON",phone:"0701111137",balance:0,transactions:[],img:"",locked:false,join:"2024"},
{name:"MUHINDO AARON",phone:"0774933114",balance:0,transactions:[],img:"",locked:false,join:"2024"}
];


// LOAD MEMBERS

let members = JSON.parse(localStorage.getItem("members")) || [];

defaultMembers.forEach(m=>{
if(!members.find(x=>x.phone===m.phone)){
members.push(m);
}
});

save();


// USERS

let users = JSON.parse(localStorage.getItem("users")) || [];

let isAdmin=false;
let currentMember=0;
let loggedUser=null;


// PAGE NAVIGATION

function show(page){

document.querySelectorAll(".page").forEach(p=>{
p.style.display="none";
});

let el=document.getElementById(page);
if(el) el.style.display="block";

}

function goHome(){show("homePage");}
function showLogin(){show("loginPage");}
function showUserLogin(){show("userLoginPage");}
function showCreate(){show("createPage");}
function showAdminLogin(){show("adminLogin");}
function showReset(){show("resetPage");}
function showAddMember(){show("addMemberPage");}


// USER LOGIN

function loginUser(){

let username=document.getElementById("loginUser").value.trim();
let pin=document.getElementById("loginPin").value.trim();

let user=users.find(u=>u.username===username && u.pin===pin);

if(!user){
alert("Invalid login");
return;
}

loggedUser=user;

let index=members.findIndex(m=>m.phone===user.phone);

if(index==-1){
alert("Member not found");
return;
}

openMember(index);

}


// CREATE ACCOUNT

function createAccount(){
if(!document.getElementById("agreeTerms").checked){
alert("Please agree to the Terms and Conditions before creating an account.");
return;
}
let username=document.getElementById("newUser").value.trim();
let phone=document.getElementById("newPhone").value.trim();
let pin=document.getElementById("newPin").value;
let confirm=document.getElementById("confirmPin").value;
let answer=document.getElementById("newAnswer").value.trim();

if(!username || !phone || !pin || !confirm || !answer){
alert("Fill all fields");
return;
}

if(pin!==confirm){
alert("PINs do not match");
return;
}

users.push({
username:username,
phone:phone,
pin:pin,
answer:answer
});

localStorage.setItem("users",JSON.stringify(users));

alert("Account created successfully");

showLogin();

}


// RESET PASSWORD

function resetPassword(){

let username=document.getElementById("resetUser").value.trim();
let answer=document.getElementById("resetAnswer").value.trim();
let newPin=document.getElementById("newPinReset").value;

let user=users.find(u=>u.username===username && u.answer===answer);

if(!user){
alert("Wrong details");
return;
}

user.pin=newPin;

localStorage.setItem("users",JSON.stringify(users));

alert("PIN reset successful");

showLogin();

}


// ADMIN LOGIN

function loginAdmin(){

let pass=document.getElementById("adminPass").value;

if(pass==="078077"){
isAdmin=true;
openDashboard();
}else{
alert("Wrong password");
}

}


// DASHBOARD

function openDashboard(){
show("dashboard");
renderDashboard();
}

function renderDashboard(){

let total=0;

members.forEach(m=>{
total+=m.balance;
});

let totalBox=document.getElementById("totalSavings");
if(totalBox) totalBox.innerText=total;

let names=members.map(m=>m.name.split(" ")[0]);
let balances=members.map(m=>m.balance);

if(typeof Chart === "undefined") return;

if(window.chart) window.chart.destroy();

let canvas=document.getElementById("mainChart");
if(!canvas) return;

window.chart=new Chart(canvas,{
type:"bar",
data:{
labels:names,
datasets:[{
label:"Savings",
data:balances
}]
}
});

}


// MEMBERS PAGE

function openMembersPage(){
show("membersPage");
renderMembers();
}

function renderMembers(){

let box=document.getElementById("membersList");
if(!box) return;

box.innerHTML="";

members.forEach((m,i)=>{

let div=document.createElement("div");
div.className="member-card";

div.innerHTML=`
<img src="${m.img || 'img/home.jpg'}">
<h4>${m.name}</h4>
<p>${m.phone}</p>
`;

div.onclick=()=>openMember(i);

box.appendChild(div);

});

}


// ADD MEMBER

function addMember(){

if(!isAdmin){
alert("Only Admin can add members");
return;
}

let name=document.getElementById("newMemberName").value.trim();
let phone=document.getElementById("newMemberPhone").value.trim();
let photo=document.getElementById("newMemberPhoto").files[0];

if(name==="" || phone===""){
alert("Enter member name and phone");
return;
}

let member={
name:name,
phone:phone,
balance:0,
transactions:[],
img:"",
locked:false,
join:new Date().getFullYear()
};

if(photo){

let reader=new FileReader();

reader.onload=function(e){
member.img=e.target.result;
members.push(member);
save();
openMembersPage();
}

reader.readAsDataURL(photo);

}else{

members.push(member);
save();
openMembersPage();

}

}


// OPEN MEMBER

function openMember(i){

currentMember=i;

let m=members[i];

document.getElementById("memberTitle").innerText=m.name;
document.getElementById("memberPhone").innerText=m.phone;
document.getElementById("memberID").innerText="SACCO-"+(i+1).toString().padStart(3,"0");
document.getElementById("memberJoin").innerText=m.join;

document.getElementById("profileImg").src=m.img || "img/home.jpg";

let callBtn=document.getElementById("callBtn");
let whatsappBtn=document.getElementById("whatsappBtn");

if(callBtn) callBtn.href="tel:"+m.phone;
if(whatsappBtn) whatsappBtn.href="https://wa.me/"+m.phone;

let adminBox=document.getElementById("adminControls");
let userBox=document.getElementById("userControls");

if(isAdmin){
if(adminBox) adminBox.style.display="block";
if(userBox) userBox.style.display="none";
}else{
if(adminBox) adminBox.style.display="none";
if(userBox) userBox.style.display="block";
}

renderTransactions();

let bal=document.getElementById("balance");
if(bal) bal.innerText=m.balance;

show("memberPage");

}


// SAVE

function save(){
localStorage.setItem("members",JSON.stringify(members));
}


// DEPOSIT

function addSaving(){

let m=members[currentMember];

let amt=parseInt(document.getElementById("amount").value);
let reason=document.getElementById("reason").value || "Deposit";

if(isNaN(amt) || amt<=0){
alert("Invalid amount");
return;
}

m.transactions.push({
type:"Deposit",
amount:amt,
reason:reason,
date:new Date().toISOString()
});

m.balance+=amt;

save();
openMember(currentMember);

}


// WITHDRAW

function withdraw(){

let m=members[currentMember];

let amt=parseInt(document.getElementById("amount").value);
let reason=document.getElementById("reason").value || "Withdraw";

if(isNaN(amt) || amt<=0){
alert("Invalid amount");
return;
}

if(amt>m.balance){
alert("Insufficient balance");
return;
}

m.transactions.push({
type:"Withdraw",
amount:amt,
reason:reason,
date:new Date().toISOString()
});

m.balance-=amt;

save();
openMember(currentMember);

}


// EDIT TRANSACTION

function editTransaction(){

let m=members[currentMember];

if(m.transactions.length===0){
alert("No transaction to edit");
return;
}

let last=m.transactions[m.transactions.length-1];

let newAmount=prompt("Edit amount",last.amount);

if(newAmount===null) return;

newAmount=parseInt(newAmount);

if(isNaN(newAmount) || newAmount<=0){
alert("Invalid amount");
return;
}

if(last.type==="Deposit") m.balance-=last.amount;
else m.balance+=last.amount;

last.amount=newAmount;

if(last.type==="Deposit") m.balance+=newAmount;
else m.balance-=newAmount;

save();
openMember(currentMember);

}


// DELETE TRANSACTION

function deleteTransaction(){

let m=members[currentMember];

if(m.transactions.length===0){
alert("No transaction");
return;
}

if(confirm("Delete last transaction?")){

let last=m.transactions.pop();

if(last.type==="Deposit") m.balance-=last.amount;
if(last.type==="Withdraw") m.balance+=last.amount;

save();
openMember(currentMember);

}

}


// EDIT MEMBER

function showEditMember(){

let m=members[currentMember];

document.getElementById("editMemberName").value=m.name;
document.getElementById("editMemberPhone").value=m.phone;

show("editMemberPage");

}

function saveMemberEdit(){

let m=members[currentMember];

m.name=document.getElementById("editMemberName").value;
m.phone=document.getElementById("editMemberPhone").value;

save();

openMember(currentMember);

}


// DOWNLOAD STATEMENT

function downloadStatement(){

let m=members[currentMember];

let text="THE CONQUERORS SAVINGS SACCO\n\n";

text+="Member: "+m.name+"\n";
text+="Phone: "+m.phone+"\n\n";

text+="Transaction History\n\n";

let balance=0;

m.transactions.forEach((t,i)=>{

if(t.type==="Deposit") balance+=t.amount;
if(t.type==="Withdraw") balance-=t.amount;

text+=(i+1)+". "+new Date(t.date).toLocaleDateString()+" | "+t.reason+" | "+t.type+" | UGX "+t.amount+" | Balance: UGX "+balance+"\n";

});

let blob=new Blob([text],{type:"text/plain"});

let a=document.createElement("a");

a.href=URL.createObjectURL(blob);

a.download=m.name+"_statement.txt";

a.click();

}


// TRANSACTION TABLE

function renderTransactions(){

let box=document.getElementById("txnHistory");
if(!box) return;

let txns=members[currentMember].transactions;

let balance=0;

box.innerHTML="";

txns.forEach((t,i)=>{

if(t.type==="Deposit") balance+=t.amount;
if(t.type==="Withdraw") balance-=t.amount;

box.innerHTML+=`
<tr>
<td>${i+1}</td>
<td>${new Date(t.date).toLocaleDateString()}</td>
<td>${t.reason}</td>
<td>${t.type==="Deposit" ? "UGX "+t.amount : ""}</td>
<td>${t.type==="Withdraw" ? "UGX "+t.amount : ""}</td>
<td>UGX ${balance}</td>
</tr>
`;

});

}


// LOGOUT

function logout(){

isAdmin=false;
loggedUser=null;

goHome();

}


// START APP

window.onload=function(){
show("homePage");
};

function searchMembers(){

let input = document.getElementById("searchMembersInput").value.toLowerCase();

let members = document.querySelectorAll("#membersList .member-card");

members.forEach(function(member){

let name = member.innerText.toLowerCase();

if(name.includes(input)){
member.style.display = "block";
}else{
member.style.display = "none";
}

});

}