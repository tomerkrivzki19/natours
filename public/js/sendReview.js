import axios from 'axios';
import { showAlert } from './alerts';

export const sendReview = async (data) => {
  //1. GET relevent data:  current rating and the review itself , must have a tour id
  const { review, rating, tour } = data;
  //NEED TO COONECT A TOUR TO THAT : OPTION 1 :  PUT THE TOUR INSIDE AN ELEMNT AND THEN USE IT , OPTION 2: IS TO SET THE TOUR ID IN THE PARAMS AND THEN SEND IT OR FIND IT IN THE REQ WHILE ENTERING THE GETTOUR DATA
  //   const tour = '';
  //   //   console.log(data);
  try {
    // 2.send AXIOS to the api route
    const res = await axios.post('/api/v1/reviews', {
      review,
      rating,
      tour,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Review sended 👍');
      location.reload(true);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
    setTimeout(() => {
      location.reload(true);
    }, 3000);
  }
};

export const editReview = async (reviewId, data) => {
  try {
    const { review, rating } = data;

    const res = await axios.patch(`/api/v1/reviews/${reviewId}`, {
      review,
      rating,
    });

    if (res.data.status === 'success') {
      showAlert('success', ' Review updated 👍');
      location.reload(true);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const deleteReview = async (reviewId) => {
  try {
    if (confirm('are you sure?!')) {
      const res = await axios.delete(`/api/v1/reviews/${reviewId}`);

      if (res.data.status === 'success') {
        showAlert('success', ' Review deleted successfully 👍');
        location.reload(true);
      }
    } else {
      return showAlert('error', 'The delete of the review was canceled');
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
