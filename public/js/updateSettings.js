//create an update data function here , call that function in index.js (export and import inside index.js fille )
//
import axios from 'axios';
import { showAlert } from './alerts';

//update both data and the password
//type is either 'password' or 'data' , data => an object with al the data to update
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    //WHY THIS WAY DIDNT WOKR!
    // const res = await axios.patch(url, {
    //   data,
    // });
    // When you use axios like this for JSON data:
    // const res = await axios.patch(url, {
    //   name: 'John Doe',
    //   email: 'john.doe@example.com',
    // });

    // it works fine because axios automatically sets the Content-Type to application/json and sends the data in the appropriate JSON format.
    //JSON data does not require the special handling that FormData requires.

    const res = await axios({
      method: 'PATCH',
      url: url,
      data: data, // Send FormData directly
      headers: {
        // Let the browser set the correct Content-Type with boundary
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
    return;
  } catch (error) {
    showAlert('error', error.response.data.message);
    return;
  }
};
