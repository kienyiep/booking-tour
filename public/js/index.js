/* eslint-disable */
console.log('Hello from parcel');
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { register } from './register';
import { updateSettings } from './updateSettings';
import { deleteTour } from './deleteTour';
import { forgot } from './forgotPassword';
import { resetPassword } from './resetPassword';
import { addTour } from './addNewTour';
import { bookTour } from './stripe';

import { showAlert } from './alerts';
//DOM ELEMENTS
const mapBox = document.getElementById('map');
const tokenBox = document.getElementById('token');
const loginForm = document.querySelector('.form--login');
const registerForm = document.querySelector('.form--register');
const resetForm = document.querySelector('.form--reset');
const forgotForm = document.querySelector('.form--forgot');
const addTourForm = document.querySelector('.form--addTour');
const updateTourForm = document.querySelector('.form--updateTour');
const logOutBtn = document.querySelector('.nav__el--logout');
const userPasswordForm = document.querySelector('.form-user-password');

const forgotBtn = document.getElementById('forgotBtn');
const addTourBtn = document.getElementById('add_tour');
const forgotPassword = document.getElementById('forgotBtn');
const userDataForm = document.querySelector('.form-user-data');
const bookBtn = document.getElementById('book-tour');
const deleteBtn = document.getElementById('btn--delete');
// const btnDeleteBox = document.getElementById('btnDelete');

//DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    register(name, email, password, passwordConfirm);
  });
}
if (resetForm) {
  resetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const tokenId = tokenBox.dataset.token;

    resetPassword(password, passwordConfirm, tokenId);
  });
}
if (forgotForm) {
  forgotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;

    forgot(email);
  });
}

if (userDataForm) {
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // programatically recreate multi part form data
    const newform = new FormData();

    newform.append('name', document.getElementById('name').value);
    newform.append('email', document.getElementById('email').value);
    newform.append('photo', document.getElementById('photo').files[0]);

    await updateSettings(newform, 'data');
  });
}

// if (updateTourForm) {
//   updateTourForm.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     // programatically recreate multi part form data
//     // let myForm = e.target;
//     let form = new FormData();

//     await updateForm(form);
//   });
// }

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
if (deleteBtn) {
  deleteBtn.addEventListener('click', (ev) => {
    ev.target.textContent = 'Processing...';
    const { deleteId } = ev.target.dataset;
    deleteTour(deleteId);
  });
}

const alertMessage = document.querySelector('body').dataset.alert;

if (alertMessage) {
  showAlert('success', alertMessage);
}
