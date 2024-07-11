import axios from 'axios';
import { showAlert } from './alerts';
// import { decode } from 'decode-formdata';

export const updateCurrentTour = async (dataset, data) => {
  try {
    const parts = dataset.split('+');

    const tourId = parts[0]; // "5c88fa8cf4afda39709c296c"
    const slug = parts[1]; // "the-wine-taster"

    const res = await axios.patch(`/api/v1/tours/${tourId}`, {
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'The tour has successfully updated');
      //need to relocate to the this url href=`/manage-tour/${tour.slug}?edit=false`
      location.assign(`/manage-tour/${slug}?edit=false`);
      // location.reload(true);
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
        // location.reload(true);
        console.log('deleted');
        location.assign(`/manage-tours`);
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
