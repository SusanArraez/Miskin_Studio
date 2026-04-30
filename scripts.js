/* script.js */
"use strict";

// Initialize jQuery UI tabs
$("#products").tabs();

/* ---------------- Web Storage ---------------- */
function saveToLocalStorage(){
    const uName = document.getElementById("fullName");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const contactPrefs = document.getElementsByName("contactPref");
    
    let selectedPref = null;
    for(let i = 0; i < contactPrefs.length; i++){
        if(contactPrefs[i].checked) { selectedPref = contactPrefs[i].value; break; }
    }
    
    const formData = {
        userName: uName ? uName.value : "",
        userEmail: email ? email.value : "",
        userPhone: phone ? phone.value : "",
        userChoice: selectedPref || ""
    };
    
    localStorage.setItem("miskinFormData", JSON.stringify(formData));
    console.info("Form data saved to localStorage");
}

function loadFromLocalStorage(){
    const savedData = localStorage.getItem("miskinFormData");
    if(!savedData) return;
    
    try {
        const formData = JSON.parse(savedData);
        
        const uName = document.getElementById("fullName");
        const email = document.getElementById("email");
        const phone = document.getElementById("phone");
        const contactPrefs = document.getElementsByName("contactPref");
        
        if(uName && formData.userName) uName.value = formData.userName;
        if(email && formData.userEmail) email.value = formData.userEmail;
        if(phone && formData.userPhone) phone.value = formData.userPhone;
        
        if(formData.userChoice){
            for(let i = 0; i < contactPrefs.length; i++){
                if(contactPrefs[i].value === formData.userChoice){
                    contactPrefs[i].checked = true;
                    break;
                }
            }
        }
        
        console.info("Form data loaded from localStorage");
    } catch(e){
        console.error("Error loading form data:", e);
    }
}

// Load saved data when page loads
document.addEventListener("DOMContentLoaded", loadFromLocalStorage);

/* ---------------- Load Reviews ---------------- */
function loadReviews(){
    const reviewsList = document.getElementById("reviews-list");
    if(!reviewsList) return;
    
    fetch("reviews.json")
        .then(response => {
            if(!response.ok) throw new Error("Failed to load reviews");
            return response.json();
        })
        .then(reviews => {
            // Clear any existing content
            reviewsList.innerHTML = "";
            
            // Create each review
            reviews.forEach((review, index) => {
                const reviewCard = document.createElement("article");
                reviewCard.className = "review-card";
                reviewCard.innerHTML = `
                    <p class="review-text">"${review.text}"</p>
                    <p class="review-author">— ${review.name}</p>
                `;
                reviewsList.appendChild(reviewCard);
            });
            
            console.info(`Loaded ${reviews.length} reviews`);
        })
        .catch(error => {
            console.error("Error loading reviews:", error);
        });
}

// Load reviews when page loads
document.addEventListener("DOMContentLoaded", loadReviews);

// Form validation

/* ---------------- Validation messages ---------------- */
const messages = {
    success: "The form was submitted successfully",
    failure: "There was an issue when trying to submit the form, please correct your errors and try again",
    emailMsg: "Please enter a valid email address (example: you@example.com)",
    phoneMsg: "Please enter a valid phone number (example: (555) 123-4567)",
    nameMsg: "Please enter your full name",
    msgMsg: "Please let us know what you need (at least 10 characters)",
    contactPrefMsg: "Please choose a preferred contact method"
};

/* ---------------- user object ---------------- */
let newUser = {
    userName: "",
    userEmail: "",
    userPhone: "",
    userChoice: "",
    userMessage: "",
    getUser: function(){
    return `
        <strong>Full Name: </strong> ${this.userName || "(none)"}<br>
        <strong>Email:</strong> ${this.userEmail || "(none)"}<br>
        <strong>Phone:</strong> ${this.userPhone || "(none)"}<br>
        <strong>Preferred contact:</strong> ${this.userChoice || "(none)"}<br>
        <strong>Message:</strong> ${this.userMessage || "(none)"}<br>
    `;
    }
};

/* ---------------- validate form ---------------- */


function validateForm(event){
  event.preventDefault(); // always prevent until validation finishes
    console.clear();
    console.info("validateForm: starting validation");

    const uName = document.getElementById("fullName");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const fieldset = document.querySelector("fieldset");
    const confirm = document.getElementById("confirm");

  // create / ensure contactPrefError element (inserted after the fieldset)
    let contactPrefError = document.getElementById("contactPrefError");
    if(!contactPrefError && fieldset){
    contactPrefError = document.createElement("p");
    contactPrefError.id = "contactPrefError";
    contactPrefError.className = "hidden";
    contactPrefError.style.color = "#8f1212";
    contactPrefError.style.marginTop = "0.35rem";
    contactPrefError.textContent = messages.contactPrefMsg;
    fieldset.insertAdjacentElement("afterend", contactPrefError);
    }

  // helpful adjacent <p> elements (create if missing and set text)
    let emailHelp = email ? email.nextElementSibling : null;
    let phoneHelp = phone ? phone.nextElementSibling : null;

    if(uName && (!uName.nextElementSibling || uName.nextElementSibling.tagName.toLowerCase() !== "p")){
    const p = document.createElement("p");
    p.className = "hidden";
    p.id = "nameError";
    p.textContent = messages.nameMsg;
    uName.insertAdjacentElement("afterend", p);
    }
    if(email && (!emailHelp || emailHelp.tagName.toLowerCase() !== "p")){
    const p = document.createElement("p");
    p.className = "hidden";
    p.textContent = messages.emailMsg;
    email.insertAdjacentElement("afterend", p);
    emailHelp = p;
    }
    if(phone && (!phoneHelp || phoneHelp.tagName.toLowerCase() !== "p")){
    const p = document.createElement("p");
    p.className = "hidden";
    p.textContent = messages.phoneMsg;
    phone.insertAdjacentElement("afterend", p);
    phoneHelp = p;
    }

  // msg error element (exists in HTML as #msgError)
    const msgEl = document.getElementById("msg");
    const msgError = document.getElementById("msgError");
    if(msgError) msgError.classList.add("hidden");

  // remove previous error styles/messages
    [uName, email, phone, msgEl].forEach(el => { if(el) el.classList.remove("error"); });
    if(uName && uName.nextElementSibling) uName.nextElementSibling.classList.add("hidden");
    if(emailHelp) emailHelp.classList.add("hidden");
    if(phoneHelp) phoneHelp.classList.add("hidden");
    if(contactPrefError) contactPrefError.classList.add("hidden");
    if(confirm) { confirm.classList.add("hidden"); confirm.innerHTML = ""; }

  // regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phoneRegex = /^\+?([0-9]{1,3})?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;

    let isValid = true;
    newUser.userName = "";
    newUser.userEmail = "";
    newUser.userPhone = "";
    newUser.userChoice = "";
    newUser.userMessage = "";

  // Full name required
    if(!uName || uName.value.trim() === ""){
    isValid = false;
    if(uName) uName.classList.add("error");
    if(uName && uName.nextElementSibling) uName.nextElementSibling.classList.remove("hidden");
    console.error("Validation: full name required");
    } else {
    newUser.userName = uName.value.trim();
    }

  // Message required, min length 10
    if(!msgEl || msgEl.value.trim().length < 10){
    isValid = false;
    if(msgEl) msgEl.classList.add("error");
    if(msgError) msgError.classList.remove("hidden");
    console.error("Validation: message too short or missing");
    } else {
    newUser.userMessage = msgEl.value.trim();
    }

  // Contact preference
    const contactPrefs = document.getElementsByName("contactPref");
    let selectedPref = null;
    for(let i = 0; i < contactPrefs.length; i++){
        if(contactPrefs[i].checked) { selectedPref = contactPrefs[i].value; break; }
    }
    if(!selectedPref){
    isValid = false;
    if(contactPrefError) contactPrefError.classList.remove("hidden");
    console.error("Validation: contact preference required");
    } else {
    newUser.userChoice = selectedPref;
    }

    const emailVal = email ? email.value.trim() : "";
    const phoneVal = phone ? phone.value.trim() : "";

    if(selectedPref === "email"){
    if(!emailVal || !emailRegex.test(emailVal)){
        isValid = false;
        if(email) email.classList.add("error");
        if(emailHelp) emailHelp.classList.remove("hidden");
        console.error("Validation: invalid email");
    } else {
        newUser.userEmail = emailVal;
    }
    if(phoneVal && !phoneRegex.test(phoneVal)){
        isValid = false;
        if(phone) phone.classList.add("error");
        if(phoneHelp) phoneHelp.classList.remove("hidden");
        console.error("Validation: invalid phone (optional)");
    }
    } else if(selectedPref === "textMsg" || selectedPref === "phone"){
    if(!phoneVal || !phoneRegex.test(phoneVal)){
        isValid = false;
        if(phone) phone.classList.add("error");
        if(phoneHelp) phoneHelp.classList.remove("hidden");
        console.error("Validation: invalid or missing phone");
    } else {
        newUser.userPhone = phoneVal;
    }
    if(emailVal && !emailRegex.test(emailVal)){
        isValid = false;
        if(email) email.classList.add("error");
        if(emailHelp) emailHelp.classList.remove("hidden");
        console.error("Validation: invalid email (optional)");
    }
    } else {
    // if contact pref unknown, be strict and require at least one contact method
    if(!emailVal && !phoneVal){
        isValid = false;
        if(contactPrefError) contactPrefError.classList.remove("hidden");
        console.error("Validation: no contact method provided");
    }
    }

  // final outcome
    if(isValid){
    console.info("Validation: success. Preparing submission...");
    // displaySubmission();
    
    // Save to localStorage
    saveToLocalStorage();

    // clear inputs
    if(uName) uName.value = "";
    if(email) email.value = "";
    if(phone) phone.value = "";
    if(msgEl) msgEl.value = "";
    if(contactPrefs.length) contactPrefs[0].checked = true;

    // hide help text
    if(uName && uName.nextElementSibling) uName.nextElementSibling.classList.add("hidden");
    if(emailHelp) emailHelp.classList.add("hidden");
    if(phoneHelp) phoneHelp.classList.add("hidden");
    if(contactPrefError) contactPrefError.classList.add("hidden");
    if(msgError) msgError.classList.add("hidden");

    console.info(messages.success);
    // Use a user-friendly notification rather than forcing an alert every time:
    // window.alert(messages.success);
    } else {
    console.warn(messages.failure);
    // optionally focus the first error element for accessibility
    const firstError = document.querySelector(".error");
    if(firstError) firstError.focus();
    }
}

// Attach validation to form submit
const form = document.getElementById("contact-us-form");
if(form){
    form.addEventListener("submit", validateForm);
}

