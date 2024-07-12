//THIS index.js fille is our entery fille
//THIS one we kinba get data from the user interface and then we deligate actions to some duntion coming from the others moudles (login moudle ,alerts moudle) , just like in node.js we can now export data from moudles

// bable libary => make some of the new js fetures work at older broswers
//npm i @babel/polyfill
import '@babel/polyfill';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { login, singup, logout } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alerts';
import { sendReview, editReview } from './sendReview';
import { addFavoriteTour, displayFavorties } from './addFavoriteTour';
import {
  updateCurrentTour,
  deleteCurrentTour,
  createTour,
  getMonthlyPlan,
  deleteUserAdmin,
  singupAdmin,
} from './administartion';
// console.log('Hello from parcel'); -> check if the fille work

// FIXEME: having problem with the mapbox when entering to a tour

//DOM ELEMNTS :
const mapbox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const singupForm = document.querySelector('.form--singup');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateUserForm = document.querySelector('.form-user-data');
const updateUserPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const reviewBtn = document.getElementById('leave-review');
const Reviewform = document.getElementById('review-data');
const favorite = document.getElementById('favorite');
const iconFavorites = document.querySelector('a[href="/my-favorites"]');
const editReviewBtn = document.querySelectorAll('.reviews__edit-button');
const createTourForm = document.getElementById('create-tour-form');
const updateTour = document.getElementById('updateTour');
const deleteTour = document.getElementById('deleteTour');
const updateUserDataAdminBtn = document.getElementById('updateUserDataAdmin');
const singupFormAdmin = document.querySelector('.form--singup-admin');
const deleteUserAdminBtn = document.getElementById('deleteUserDataAdmin');

// dataset =>  read-only property of the HTMLElement interface provides read/write access to custom data attributes (data-*) on elements
//DELEGATION:
if (mapbox) {
  //extract the data from the div , what we have done in the pug tamplate - we display all the data in the div classname
  const locations = JSON.parse(mapbox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password); //check if the err is provided when faield TODO:
  });
} else {
  console.error('Form element not found');
}
if (singupForm) {
  singupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //1) Get all the values from inputs
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    //2) Check if the password and passwordConfirm is match =>
    console.log(password, passwordConfirm);
    if (password !== passwordConfirm) {
      return showAlert('error', 'Password and Password Confirm are not match!');
    }
    //3) Send the data to funciton that will proccess the post operation
    singup(name, email, password, passwordConfirm);
    // login(email, password); //check if the err is provided when faield TODO:
  });
} else {
  console.error('Form element not found');
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (updateUserForm) {
  updateUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]); //that comes as an array , in for that we need to collect only the first fille that is the image the user uploaded

    // console.log(document.getElementById('name').value);
    // console.log(document.getElementById('email').value);
    // console.log(document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });
}
if (updateUserPasswordForm) {
  updateUserPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
  });
}
//from the postman route that we have already build - to compare if the same detaills is simmilar
// {
//   "passwordCurrent":"pass1234",
//   "password":"newpassword",
//   "passwordConfirm":"newpassword"
// }

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset; //e.target=> the element that was clicked - will be the button element
    bookTour(tourId);
  });
}

const alertMessage = document.querySelector('body').dataset.alert;
// console.log(alertMessage);
if (alertMessage) showAlert('success', alertMessage, 20);

// reviewBtn
if (Reviewform) {
  Reviewform.addEventListener('submit', async (e) => {
    e.preventDefault();

    reviewBtn.textContent = 'Updating...';
    const formData = new FormData(e.target);
    const review = formData.get('reviewText');
    const rating = formData.get('reviewNumber');
    const tour = reviewBtn.dataset.tourId;
    // console.log(tour);
    if (!review && !rating) {
      reviewBtn.textContent = 'SEND IT! ';
      return showAlert('error', 'Please write a review before sending 😃', 5);
    }

    sendReview({ review, rating, tour });
  });
}
// Edit review
if (editReviewBtn) {
  editReviewBtn.forEach((editButton) => {
    editButton.addEventListener('click', (e) => {
      e.preventDefault();
      //get the current review id  :
      const reviewId = editButton.getAttribute('data-review-id');
      // Find the parent review card of the clicked edit button
      const reviewCard = editButton.closest('.reviews__card');

      const p = reviewCard.getElementsByClassName('reviews__text');
      const divStarClass = reviewCard.getElementsByClassName('reviews__rating');
      //dom elements:
      // input text
      const input = document.createElement('input');
      const inputNumber = document.createElement('input');
      const btn = document.createElement('button');
      input.type = 'text';
      input.placeholder = 'Comment here';
      input.name = 'reviewText';
      // input number
      inputNumber.type = 'number';
      inputNumber.min = '0';
      inputNumber.max = '5';
      inputNumber.name = 'reviewNumber';
      //button
      btn.innerHTML = 'save';
      btn.className = 'reviews__save-button';
      btn.id = `${reviewId}`;
      //replacment of elements:
      p[0].replaceWith(input);
      divStarClass[0].replaceWith(inputNumber);
      editButton.replaceWith(btn);

      //Checking if the user wrote an value is already at the backend err handler :

      //Send the review
      btn.addEventListener('click', (e) => {
        const reviewId = btn.getAttribute('id');
        // data:
        const review = input.value;
        const rating = inputNumber.value;
        editReview(reviewId, { review, rating });
      });
    });
  });
}

if (favorite) {
  // Favorites
  favorite.addEventListener('click', (e) => {
    e.preventDefault();
    const tourId = bookBtn.dataset.tourId;
    addFavoriteTour(tourId);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (iconFavorites) {
    iconFavorites.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent the default link behavior
      displayFavorties(); // Call the function to handle favorites
    });
  }
});
//manage tours - admins:
//create tour
if (createTourForm) {
  createTourForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // Ensure to append the files correctly to FormData
    const tourData = {
      name: formData.get('name'),
      duration: formData.get('duration'),
      maxGroupSize: formData.get('maxGroupSize'),
      difficulty: formData.get('difficulty'),
      price: formData.get('price'),
      summary: formData.get('summary'),
      description: formData.get('description'),
      startLocation: {
        type: 'Point',
        coordinates: [
          parseFloat(formData.get('startLocation.coordinates[0]')) || null,
          parseFloat(formData.get('startLocation.coordinates[1]')) || null,
        ],
        description: formData.get('startLocation.description'),
        address: formData.get('startLocation.address'),
      },
      startDates: [
        formData.get('startDates[0]'),
        formData.get('startDates[1]'),
        formData.get('startDates[2]'),
      ],
      guides: [
        formData.get('guides[0]'),
        formData.get('guides[1]'),
        formData.get('guides[2]'),
      ],
    };

    // Append non-file fields to FormData
    Object.keys(tourData).forEach((key) => {
      if (typeof tourData[key] === 'object' && !Array.isArray(tourData[key])) {
        // Handle nested objects like startLocation
        Object.keys(tourData[key]).forEach((nestedKey) => {
          formData.append(`${key}[${nestedKey}]`, tourData[key][nestedKey]);
        });
      } else if (Array.isArray(tourData[key])) {
        // Handle arrays like startDates and guides
        tourData[key].forEach((item, index) => {
          formData.append(`${key}[${index}]`, item);
        });
      } else {
        formData.append(key, tourData[key]);
      }
    });

    // Append files
    formData.append('imageCover', formData.get('imageCover'));
    formData.append('images', formData.get('images[0].file'));
    formData.append('images', formData.get('images[1].file'));
    formData.append('images', formData.get('images[2].file'));

    // console.log(formData);
    // Send the form data
    createTour(formData);
  });
}

// update tour - not relevnt for now , becouse we need to figure it out how we want to display this option to the client ( like decide if we want to add uploaded images option , or what exactly we wan to display becouse we need to compaine preview all the tours and also what kind of stuuf to update TODO: )
if (updateTour) {
  updateTour.addEventListener('click', (e) => {
    //make it optional to update -get all data
    const data = {
      // message: GET - ALL - THE - DATA - FOR - UPDATE, TODO:
    };
    //  send the updated data with the current id
    const dataset = updateTour.dataset.tourId;
    updateCurrentTour(dataset, data);
  });
}

if (deleteTour) {
  deleteTour.addEventListener('click', (e) => {
    //make it optional to update

    //  send the updated data with the current id
    const tourId = deleteTour.dataset.tourId;
    deleteCurrentTour(tourId);
  });
}

//manage users -admins
if (updateUserDataAdminBtn) {
  updateUserDataAdminBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    const tourId = updateUserDataAdminBtn.getAttribute('data-user');

    updateSettings({ name, email, role }, 'admin', tourId);
  });
}

if (singupFormAdmin) {
  singupFormAdmin.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData();
    //1) Get all the values from inputs  -append the filles in to the form data
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const password = document.getElementById('password').value;

    //2) Check if the password and passwordConfirm is match =>
    if (password !== passwordConfirm) {
      return showAlert('error', 'Password and Password Confirm are not match!');
    }
    //apepend
    formData.append('role', document.getElementById('role').value);
    formData.append('name', document.getElementById('name').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('photo', document.getElementById('photo').files[0]);
    formData.append('passwordConfirm', passwordConfirm);
    formData.append('password', password);
    //3) Send the data to funciton that will proccess the post operation
    singupAdmin(formData);
  });
}
if (deleteUserAdminBtn) {
  deleteUserAdminBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const tourId = updateUserDataAdminBtn.getAttribute('data-user');
    deleteUserAdmin(tourId);
  });
}
