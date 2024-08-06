//THIS index.js fille is our entery fille
//THIS one we kinba get data from the user interface and then we deligate actions to some duntion coming from the others moudles (login moudle ,alerts moudle) , just like in node.js we can now export data from moudles

// bable libary => make some of the new js fetures work at older broswers
//npm i @babel/polyfill
import '@babel/polyfill';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { login, singup, logout } from './login';
import { displayMap } from './mapbox';
import { updateSettings, sendConfirmEmail } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alerts';
import { sendReview, editReview, deleteReview } from './sendReview';
import { addFavoriteTour, displayFavorties } from './addFavoriteTour';
import {
  updateCurrentTour,
  updateCurrentDateTour,
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
const deleteReviewBtn = document.querySelectorAll('.reviews__delete-button');
const createTourForm = document.getElementById('create-tour-form');
const createTourFormSeconed = document.getElementById(
  'create-tour-form-seconed'
);
const addLocationBtn = document.getElementById('addLocationContainer');
const updateTour = document.getElementById('updateTour');
const deleteTour = document.getElementById('deleteTour');
const updateUserDataAdminBtn = document.getElementById('updateUserDataAdmin');
const singupFormAdmin = document.querySelector('.form--singup-admin');
const deleteUserAdminBtn = document.getElementById('deleteUserDataAdmin');
const newDateInput = document.getElementById('newDate');
const emailConfirm = document.getElementById('email-confirm');

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
//confirm email:
if (emailConfirm) {
  emailConfirm.addEventListener('click', (e) => {
    e.preventDefault();
    const email = emailConfirm.getAttribute('data');

    sendConfirmEmail(email);
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
    const date = document.getElementById('tourDate').value;
    const { tourId } = e.target.dataset; //e.target=> the element that was clicked - will be the button element
    bookTour(tourId, date);
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

      //saving the values to present them after cancel
      const reviewLorem = p[0];
      const startContaier = divStarClass[0];

      //dom elements:
      // input text
      const input = document.createElement('input');
      const inputNumber = document.createElement('input');
      const btn = document.createElement('button');
      const cancelBtn = document.createElement('button');
      input.type = 'text';
      input.placeholder = 'Comment here';
      input.name = 'reviewText';
      // input number
      inputNumber.type = 'number';
      inputNumber.min = '0';
      inputNumber.max = '5';
      inputNumber.name = 'reviewNumber';
      //button
      cancelBtn.innerHTML = 'cancel';
      btn.innerHTML = 'save';
      btn.className = 'reviews__save-button';
      btn.id = `${reviewId}`;
      //replacment of elements:
      p[0].replaceWith(input);
      divStarClass[0].replaceWith(inputNumber);
      editButton.replaceWith(btn);
      reviewCard.append(cancelBtn);
      //Checking if the user wrote an value is already at the backend err handler :

      //cancel button:
      cancelBtn.addEventListener('click', (e) => {
        input.replaceWith(reviewLorem);
        inputNumber.replaceWith(startContaier);
        btn.replaceWith(editButton);
        reviewCard.removeChild(cancelBtn);
      });
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
if (deleteReviewBtn) {
  deleteReviewBtn.forEach((deleteButton) => {
    deleteButton.addEventListener('click', (e) => {
      e.preventDefault();
      const reviewId = deleteButton.getAttribute('data-review-id');
      // console.log(reviewId);
      deleteReview(reviewId);
    });
  });
}
// Favorites
if (favorite) {
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
      duration: Number(formData.get('duration')) || '',
      maxGroupSize: Number(formData.get('maxGroupSize')) || '',
      difficulty: formData.get('difficulty'),
      price: Number(formData.get('price')) || '',
      summary: formData.get('summary'),
      description: formData.get('description'),
      imageCover: formData.get('imageCover'),
      startLocation: {
        coordinates: [
          parseFloat(formData.get('startLocation.coordinates[0]')) || 1.1,
          parseFloat(formData.get('startLocation.coordinates[1]')) || 1.1,
        ],
        description: formData.get('startLocation.description'),
        address: formData.get('startLocation.address'),
      },
    };
    // // Send the form data
    createTour(tourData);
  });
}
//SECONED PART:
//Adding another container for the locations
if (addLocationBtn) {
  addLocationBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const container = document.getElementById('locations');
    const locationContainers = document.getElementsByClassName(
      'locations-sub-container'
    );

    if (locationContainers.length < 6) {
      const subContainer = document.createElement('div');
      subContainer.className = 'locations-sub-container';
      subContainer.style.width = '30%';
      subContainer.style.marginBottom = '15em';

      const newIndex = locationContainers.length;

      subContainer.innerHTML = `
          <label class="heading-secondary ma-bt-lg" for=" ">${
            newIndex + 1
          }</label>
          <label class="form__label" for="location.coordinates[0]">Start Location Coordinates</label>
          <input class="form__input" name="location.coordinates[1]" type="text" placeholder="Longitude (25.774772)">
          <input class="form__input" name="location.coordinates[0]" type="text" placeholder="Latitude (-80.185942)">
          
          <label class="form__label" for="location.description">Description</label>
          <input class="form__input" name="location.description" type="text" placeholder="Miami, USA">
          
          <label class="form__label" for="location.day">day</label>
          <input class="form__input" name="location.day" type="text" placeholder="day"/>
        `;
      container.appendChild(subContainer);
    } else {
      showAlert('error', 'You have cross the limite');
    }
  });
}
if (createTourFormSeconed) {
  createTourFormSeconed.addEventListener('submit', (e) => {
    e.preventDefault();
    const formElement = e.target;
    const formData = new FormData();

    // Append images
    const images = document.getElementById('file-input').files;
    for (let i = 0; i < images.length; i++) {
      formData.append('images', images[i]);
    }

    // Helper function to safely get form element values
    const getFormElementValue = (selector) => {
      const element = formElement.querySelector(selector);
      if (element) {
        return element.value;
      } else {
        console.error(`Element not found for selector: ${selector}`);
        return '';
      }
    };

    // Append startDates

    document
      .querySelectorAll('.start-dates-sub-container')
      .forEach((container, index) => {
        const date = container.querySelector(
          'input[name^="startDates"][name$=".date"]'
        ).value;

        formData.append(`startDates[${index}][date]`, date);
      });

    // Append guides
    formData.append(
      'guides[0]',
      getFormElementValue('select[name="guides[0]"]')
    );
    formData.append(
      'guides[1]',
      getFormElementValue('select[name="guides[1]"]')
    );
    formData.append(
      'guides[2]',
      getFormElementValue('select[name="guides[2]"]')
    );

    // Append locations
    document
      .querySelectorAll('.locations-sub-container')
      .forEach((container, index) => {
        const coordinates = [
          parseFloat(
            container.querySelector('input[name="location.coordinates[0]"]')
              .value
          ) || 1.1,
          parseFloat(
            container.querySelector('input[name="location.coordinates[1]"]')
              .value
          ) || 1.1,
        ];
        const description =
          container.querySelector('input[name="location.description"]').value ||
          '';
        const day =
          container.querySelector('input[name="location.day"]').value || '';

        formData.append(`locations[${index}][coordinates][0]`, coordinates[0]);
        formData.append(`locations[${index}][coordinates][1]`, coordinates[1]);
        formData.append(`locations[${index}][description]`, description);
        formData.append(`locations[${index}][day]`, day);
      });

    const create = document.getElementById('create');
    const dataset = create.getAttribute('tourid');
    //send the data
    updateCurrentTour(dataset, formData);
  });
}
// update tour
//Remove Guide
const guideRemoveButtons = document.querySelectorAll('.btn.remove');
const guideAddBtn = document.querySelector('.btn.add');
if (guideRemoveButtons) {
  guideRemoveButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const guideId = e.target.getAttribute('data-guide-id');
      const guideIndex = e.target.getAttribute('data-guide-index');

      // Find the guide element to remove (assuming the button is a child of .overview-box__detail)
      const guideDetailElement = e.target.closest('.overview-box__detail');

      // Remove the guide element from the DOM
      guideDetailElement.remove();
    });
  });
}

if (updateTour) {
  updateTour.addEventListener('click', (e) => {
    //make it optional to update -get all data
    e.preventDefault();
    const form = document.getElementById('updateTourForm');
    const formData = new FormData(form);

    const formElement = e.target;

    //Append quick facts

    // const nextDate = document.querySelector('input[type="date"]').value;
    const elementGuides = document.getElementById('guides');
    const guidesValue = elementGuides.value;

    //if there no guides:
    if (guidesValue === '') {
      formData.delete('guides'); // Use the name of the input field, not its value
    }
    // console.log(nextDate);
    // formData.append('startDates[2].date', nextDate);
    // formData.append('maxGroupSize', participants);

    //Append startDates
    const dateInputs = document.querySelectorAll(
      'input[name^="startDates["][name$="].date"]'
    );
    const participantInputs = document.querySelectorAll(
      'input[name^="startDates["][name$="].participants"]'
    );
    // Append existing startDates
    dateInputs.forEach((dateInput, index) => {
      const date = dateInput.value;
      const participants = participantInputs[index]
        ? participantInputs[index].placeholder.replace('Participants: ', '')
        : 0;

      if (date) {
        formData.append(`startDates[${index}].date`, date);
        formData.append(`startDates[${index}].participants`, participants || 0);
      }
    });

    //Append guides
    function getGuideIds() {
      const guideIds = [];
      document
        .querySelectorAll('.overview-box__detail .remove')
        .forEach((button) => {
          const guideId = button.getAttribute('data-guide-id');
          if (guideId) {
            guideIds.push(guideId);
          }
        });
      return guideIds;
    }
    const guideIds = getGuideIds();
    guideIds.forEach((guideId) => {
      formData.append('guides', guideId);
    });

    //Append locations
    document
      .querySelectorAll('.locations-sub-container')
      .forEach((container, index) => {
        const coordinates = [
          parseFloat(
            container.querySelector('input[name="location.coordinates[0]"]')
              .value
          ) || 0,
          parseFloat(
            container.querySelector('input[name="location.coordinates[1]"]')
              .value
          ) || 0,
        ];
        const description =
          container.querySelector('input[name="location.description"]').value ||
          '';
        const day = Number(
          container.querySelector('input[name="location.day"]').value || 0
        );

        formData.append(`locations[${index}][coordinates][0]`, coordinates[0]);
        formData.append(`locations[${index}][coordinates][1]`, coordinates[1]);
        formData.append(`locations[${index}][description]`, description);
        formData.append(`locations[${index}][day]`, day);
      });
    //text-area append
    let description = '';
    document.querySelectorAll('.description__text').forEach((el) => {
      //get thier values
      const value = el.value;
      if (value === '') return;
      //get them inside one verible
      description += value + '\n'; // Add '\n' for line breaks
    });
    if (description) {
      formData.append('description', description);
    }
    // Append images
    const images = document.getElementById('file-input').files;
    for (let i = 0; i < images.length; i++) {
      formData.append('images', images[i]);
    }

    // Debug: Log the FormData entries
    // for (let pair of formData.entries()) {
    //   console.log(pair[0] + ': ' + pair[1]);
    // }
    //  send the updated data with the current id
    const dataset = updateTour.getAttribute('tourId');
    updateCurrentTour(dataset, formData);
  });
}
// Get the new date value
if (newDateInput) {
  newDateInput.addEventListener('click', (e) => {
    // Initialize FormData
    const formData = new FormData();

    // Collect all existing startDates inputs
    const dateInputs = document.querySelectorAll(
      'input[name^="startDates["][name$="].date"]'
    );
    const participantInputs = document.querySelectorAll(
      'input[name^="startDates["][name$="].participants"]'
    );

    // Prepare the startDates array
    const startDatesArray = [];

    // Append existing startDates
    dateInputs.forEach((dateInput, index) => {
      const date = dateInput.value;
      const participants = participantInputs[index]
        ? participantInputs[index].placeholder.replace('Participants: ', '')
        : 0;

      if (date) {
        startDatesArray.push({
          date,
          participants: Number(participants),
        });
      }
    });

    // Append the new date

    // Append the entire startDates array to FormData
    // formData.append('startDates', JSON.stringify(startDatesArray));
    const jsonData = {
      startDates: startDatesArray,
    };
    // Log FormData contents for debugging
    console.log(jsonData);
    const dataset = updateTour.getAttribute('tourId');
    updateCurrentDateTour(dataset, jsonData);
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
