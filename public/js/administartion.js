import axios from 'axios';
import { showAlert } from './alerts';
// import { decode } from 'decode-formdata';

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
    showAlert('error', error.data.message);
  }
};

export const createTour = async (formData) => {
  try {
    // console.log('Sending formData:', formData);

    const res = await axios.post('/api/v1/tours', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'The Tour Has successfully uploaded');
      location.assign('/manage-tours');
    }
  } catch (error) {
    console.error(
      'Error uploading tour:',
      error.response ? error.response.data : error.message
    );
    showAlert('error', 'Error uploading tour');
  }
};

//class for the create tour:
//
