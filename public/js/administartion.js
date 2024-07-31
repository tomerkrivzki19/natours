import axios from 'axios';
import { showAlert } from './alerts';
// import { decode } from 'decode-formdata';

export const updateCurrentTour = async (dataset, data) => {
  try {
    console.log('data from function', data);
    console.log('dataset', dataset);

    const parts = dataset.split('+');

    const tourId = parts[0]; // "5c88fa8cf4afda39709c296c"
    const slug = parts[1]; // "the-wine-taster"
    const res = await axios.patch(`/api/v1/tours/${tourId}`, data, {
      // headers: {
      //   'content-type': 'multipart/form-data',
      // },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'The tour has successfully updated');
      location.assign(`/manage-tour/${slug}?edit=false`);
      // location.reload();
    }
  } catch (error) {
    console.log(error);
    showAlert('error', error.response.data.message);
  }
};
export const updateCurrentDateTour = async (dataset, data) => {
  try {
    console.log('data from function', data);
    const parts = dataset.split('+');
    const tourId = parts[0]; // "5c88fa8cf4afda39709c296c"
    const slug = parts[1]; // "the-wine-taster"
    const res = await axios.patch(`/api/v1/tours/${tourId}`, data);

    if (res.data.status === 'success') {
      showAlert('success', 'The tour has successfully updated');
      location.reload();
    }
  } catch (error) {
    console.log(error);
    showAlert('error', error.response.data.message);
  }
};
export const deleteCurrentTour = async (tourId) => {
  try {
    if (confirm('are you sure?!')) {
      const res = await axios.delete(`/api/v1/tours/${tourId}`);

      if (res.data.status === 'success') {
        showAlert('success', 'The tour has successfully deleted');
        location.assign(`/manage-tours`);
      }
    } else {
      return showAlert('error', 'The delete of the tour was canceled');
    }
  } catch (error) {
    showAlert('error', error.data.message);
  }
};

export const createTour = async (data) => {
  try {
    const res = await axios.post('/api/v1/tours', data, {
      headers: {
        'content-type': 'multipart/form-data',
      },
    });

    if (res.data.status === 'success') {
      const id = res.data.data.tour.id;

      showAlert('success', 'The Tour Has successfully uploaded');
      location.assign(`/add-tour/${id}`);
    }
  } catch (error) {
    console.log(error);
    showAlert('error', error.response.data.message);
  }
};

export const singupAdmin = async (formData) => {
  try {
    const res = await axios.post('/api/v1/users', formData, {
      headers: {
        // 'Content-Type': 'multipart/form-data',
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'The user Has successfully uploaded');
      location.assign('/manage-users');
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const deleteUserAdmin = async (tourId) => {
  try {
    if (confirm('are you sure?!')) {
      const res = await axios.delete(`/api/v1/users/${tourId}`);

      if (res.data.status === 'success') {
        showAlert('success', 'The user Has successfully uploaded');
        location.assign('/manage-users');
      }
    } else {
      return showAlert('error', 'The delete of the user was canceled');
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
