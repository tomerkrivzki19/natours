import axios from 'axios';
import { showAlert } from './alerts';

export const addFavoriteTour = async (tourId) => {
  //TODO: need to adress it to current user to make it perfect becouse when user regester as another user that may cost error -solution 1: when login-out can clear all the favoriets option 2: save the favorites somewhere
  try {
    // Get the existing favorites from localStorage
    const favorites = JSON.parse(localStorage.getItem('favoriteTours')) || [];

    // Check if the tour is already in the favorites
    if (!favorites.includes(tourId)) {
      favorites.push(tourId);
      localStorage.setItem('favoriteTours', JSON.stringify(favorites));
      showAlert('success', 'The tour added to favorites');
    } else {
      showAlert('error', 'The tour is already in favorites');
    }

    // const res = await axios.post(
    //   `${req.protocol}://${req.get('host')}/my-favorites`,
    //   {
    //     favorites,
    //   }
    // );
    // if (res.data.status === 'success') {
    //   showAlert('success', 'The tour added to favorites');
    //   location.reload(true);
    // }
  } catch (error) {
    showAlert('error', 'Please try later adding favortie tour');
  }
};
