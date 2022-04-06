// /* eslint-disable */
// console.log('Hello from parcel');
// import '@babel/polyfill';
// import { displayMap } from './mapbox';
// import { login, logout } from './login';
// import { register } from './register';
// import { updateSettings } from './updateSettings';
// import { forgot } from './forgotPassword';
// import { resetPassword } from './resetPassword';
// import { addTour } from './addNewTour';
// import { bookTour } from './stripe';
// import { showAlert } from './alerts';
// //DOM ELEMENTS
// const mapBox = document.getElementById('map');
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
// if (mapBox) {
//   const locations = JSON.parse(mapBox.dataset.locations);
//   displayMap(locations);
// }

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
//     // const form = new FormData();
//     // const tourName = document.getElementById('tourName').value;
//     // const tourDuration = document.getElementById('tourDuration').value;
//     // const tourGroupSize = document.getElementById('tourGroupSize').value;
//     // const tourDifficulty = document.getElementById('tourDifficulty').value;
//     // const tourPrice = document.getElementById('tourPrice').value;
//     // const tourPriceDiscount =
//     //   document.getElementById('tourPriceDiscount').value;
//     // const tourSummary = document.getElementById('tourSummary').value;
//     // const tourDescriptions = document.getElementById('tourDescriptions').value;
//     // const tourImageCover = document.getElementById('tourImageCover').files[0];
//     //imagess
//     // const tourPhoto1 = document.getElementById('tourPhoto1').files[0];
//     // const tourPhoto2 = document.getElementById('tourPhoto2').files[0];
//     // const tourPhoto3 = document.getElementById('tourPhoto3').files[0];
//     // // start date
//     // const tourDate1 = document.getElementById('tourDate1').value;
//     // const tourDate2 = document.getElementById('tourDate2').value;
//     // const tourDate3 = document.getElementById('tourDate3').value;
//     // // start location
//     // const startlat = document.getElementById('startlat').value;
//     // const startlong = document.getElementById('startlong').value;
//     // const startDescription = document.getElementById('startDescription').value;
//     // const startAddress = document.getElementById('startAddress').value;
//     // // location 1
//     // const tourlat = document.getElementById('tourlat').value;
//     // const tourlong = document.getElementById('tourlong').value;
//     // const tourDescription = document.getElementById('tourDescription').value;
//     // const tourDay = document.getElementById('tourDay').value;
//     // // location 2
//     // const tourlat2 = document.getElementById('tourlat2').value;
//     // const tourlong2 = document.getElementById('tourlong2').value;
//     // const tourDescription2 = document.getElementById('tourDescription2').value;
//     // const tourDay2 = document.getElementById('tourDay2').value;
//     // // location 3
//     // const tourlat3 = document.getElementById('tourlat3').value;
//     // const tourlong3 = document.getElementById('tourlong3').value;
//     // const tourDescription3 = document.getElementById('tourDescription3').value;
//     // const tourDay3 = document.getElementById('tourDay3').value;
//     // // guides
//     // const tourGuides1 = document.getElementById('tourGuide1').value;
//     // const tourGuides2 = document.getElementById('tourGuide2').value;
//     // const tourGuides3 = document.getElementById('tourGuide3').value;
//     // const tourImages = [tourPhoto1, tourPhoto2, tourPhoto3];
//     // const tourStartDates = [tourDate1, tourDate2, tourDate3];
//     // const tourStartLocation = {
//     //   coordinate: [startlong, startlat],
//     //   description: startDescription,
//     //   address: startAddress,
//     // };
//     // const tourLocation = [
//     //   {
//     //     coordinate: [tourlong, tourlat],
//     //     description: tourDescription,
//     //     day: tourDay,
//     //   },
//     //   {
//     //     coordinate: [tourlong2, tourlat2],
//     //     description: tourDescription2,
//     //     day: tourDay2,
//     //   },
//     //   {
//     //     coordinate: [tourlong3, tourlat3],
//     //     description: tourDescription3,
//     //     day: tourDay3,
//     //   },
//     // ];
//     // const tourGuides = [tourGuides1, tourGuides2, tourGuides3];
//     // form.append('name', document.getElementById('tourName').value);
//     // form.append('duration', document.getElementById('tourDuration').value);
//     // form.append('maxGroupSize', document.getElementById('tourGroupSize').value);
//     // form.append('difficulty', document.getElementById('tourDifficulty').value);
//     // form.append('price', document.getElementById('tourPrice').value);
//     // form.append(
//     //   'priceDiscount',
//     //   document.getElementById('tourPriceDiscount').value
//     // );
//     // form.append('summary', document.getElementById('tourSummary').value);
//     // form.append(
//     //   'description',
//     //   document.getElementById('tourDescriptions').value
//     // );
//     // form.append(
//     //   'imageCover',
//     //   document.getElementById('tourImageCover').files[0]
//     // );
//     // form.append('images', tourImages);
//     // form.append('startDates', tourStartDates);
//     // form.append('startLocation', tourStartLocation);
//     // form.append('locations', tourLocation);
//     // form.append('guides', tourGuides);
//     // await addTour(form);
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
//     newform.append('no', document.getElementById('email').value);
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
