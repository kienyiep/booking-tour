// /* eslint-disable */
// console.log('Hello from parcel');
// import '@babel/polyfill';
// // import { displayMap } from './mapbox';
// import { login, logout } from './login';
// import { register } from './register';
// import { updateSettings } from './updateSettings';
// import { forgot } from './forgotPassword';
// import { resetPassword } from './resetPassword';
// import { addTour } from './addNewTour';
// import { bookTour } from './stripe';
// import { showAlert } from './alerts';
// //DOM ELEMENTS
// // const mapBox = document.getElementById('map');
// const tokenBox = document.getElementById('token');
// const loginForm = document.querySelector('.form--login');
// const registerForm = document.querySelector('.form--register');
// const resetForm = document.querySelector('.form--reset');
// const forgotForm = document.querySelector('.form--forgot');
// const addTourForm = document.querySelector('.form--addTour');
// const logOutBtn = document.querySelector('.nav__el--logout');
// const forgotBtn = document.getElementById('forgotBtn');
// const addTourBtn = document.getElementById('add_tour');
// const forgotPassword = document.getElementById('forgotBtn');
// const userDataForm = document.querySelector('.form-user-data');
// const userPasswordForm = document.querySelector('.form-user-password');
// const bookBtn = document.getElementById('book-tour');
// //DELEGATION
// // if (mapBox) {
// //   const locations = JSON.parse(mapBox.dataset.locations);
// //   displayMap(locations);
// // }

// if (loginForm) {
//   loginForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     login(email, password);
//   });
// }
// if (addTourForm) {
//   addTourForm.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     let myForm = e.target;
//     let form = new FormData(myForm);
//     form.append('name', form.get('tourName'));
//     form.append('duration', form.get('tourDuration'));
//     form.append('maxGroupSize', form.get('tourGroupSize'));
//     form.append('difficulty', form.get('tourDifficulty'));
//     form.append('price', form.get('tourPrice'));
//     form.append('priceDiscount', form.get('tourPriceDiscount'));
//     form.append('summary', form.get('tourSummary'));
//     form.append('description', form.get('tourDescriptions'));
//     form.append('imageCover', form.get('tourImageCover'));
//     form.append('images', [
//       form.get('tourPhoto1'),
//       form.get('tourPhoto2'),
//       form.get('tourPhoto3'),
//     ]);
//     form.append(
//       'startDates',
//       form.get('tourDate1'),
//       form.get('tourDate2'),
//       form.get('tourDate3')
//     );
//     form.append('startLocation', {
//       coordinate: [form.get('startlong'), form.get('startlat')],
//       description: form.get('startDescription'),
//       address: form.get('startAddress'),
//     });
//     form.append('locations', [
//       {
//         coordinate: [form.get('tourlong'), form.get('tourlat')],
//         description: form.get('tourDescription'),
//         day: form.get('tourDay'),
//       },
//       {
//         coordinate: [form.get('tourlong2'), form.get('tourlat2')],
//         description: form.get('tourDescription2'),
//         day: form.get('tourDay2'),
//       },
//       {
//         coordinate: [form.get('tourlong3'), form.get('tourlat3')],
//         description: form.get('tourDescription23'),
//         day: form.get('tourDay3'),
//       },
//     ]);
//     form.append('guides', [
//       form.get('tourGuide1'),
//       form.get('tourGuide2'),
//       form.get('tourGuide3'),
//     ]);
//     await addTour(form);
//   });
// }

// if (registerForm) {
//   registerForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const name = document.getElementById('name').value;
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     const passwordConfirm = document.getElementById('passwordConfirm').value;
//     register(name, email, password, passwordConfirm);
//   });
// }
// if (resetForm) {
//   resetForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const password = document.getElementById('password').value;
//     const passwordConfirm = document.getElementById('passwordConfirm').value;
//     const tokenId = tokenBox.dataset.token;

//     resetPassword(password, passwordConfirm, tokenId);
//   });
// }
// if (forgotForm) {
//   forgotForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const email = document.getElementById('email').value;

//     forgot(email);
//   });
// }

// if (logOutBtn) logOutBtn.addEventListener('click', logout);

// if (forgotPassword) logOutBtn.addEventListener('click');

// if (userDataForm)
//   userDataForm.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     // programatically recreate multi part form data
//     const newform = new FormData();
//     newform.append('name', document.getElementById('name').value);
//     newform.append('email', document.getElementById('email').value);
//     newform.append('photo', document.getElementById('photo').files[0]);
//     await updateSettings(newform, 'data');
//   });

// if (userPasswordForm)
//   userPasswordForm.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     document.querySelector('.btn--save-password').textContent = 'Updating...';
//     const passwordCurrent = document.getElementById('password-current').value;
//     const password = document.getElementById('password').value;
//     const passwordConfirm = document.getElementById('password-confirm').value;
//     await updateSettings(
//       { passwordCurrent, password, passwordConfirm },
//       'password'
//     );

//     document.querySelector('.btn--save-password').textContent = 'Save password';

//     document.getElementById('password-current').value = '';
//     document.getElementById('password').value = '';
//     document.getElementById('password-confirm').value = '';
//   });

// if (bookBtn)
//   bookBtn.addEventListener('click', (e) => {
//     e.target.textContent = 'Processing...';
//     const { tourId } = e.target.dataset;
//     bookTour(tourId);
//   });

// const alertMessage = document.querySelector('body').dataset.alert;
// if (alertMessage) showAlert('success', alertMessage, 20);
