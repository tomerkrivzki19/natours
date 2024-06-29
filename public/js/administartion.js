import axios from 'axios';
import { showAlert } from './alerts';

export const updateCurrentTour = async (tourId, data) => {
  try {
    const res = await axios.patch(`/api/v1/tours/${tourId}`, {
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'The tour has successfully updated');
      location.reload(true);
    }
  } catch (error) {
    console.log(error);
    showAlert('error', error.data.message);
  }
};

export const deleteCurrentTour = async (tourId) => {
  try {
    if (confirm('are you sure?!')) {
      const res = await axios.delete(`api/v1/tours/${tourId}`);

      if (res.data.status === 'success') {
        showAlert('success', 'The tour has successfully deleted');
        location.reload(true);
      }
    } else {
      return showAlert('error', 'The delete of the tour was canceld');
    }
  } catch (error) {
    console.log(error);
    showAlert('error', error.data.message);
  }
};
