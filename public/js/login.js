import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    // console.log(email, password);
    // axios => call api instead of resolve reject promisess | we imported the axios package as cdn in the base scripts
    //resolve -> !(not) response | /api/v1/users/login => we sorted the route becouse we are working on backend and the url in the production and on the development site are the same , if we hade for exmaple rendered app with client side also like react that will not worked
    const res = await axios.post('/api/v1/users/login', {
      email,
      password,
    });
    //the data that we send as json response
    //'success' => when we sending the response we are using success to describe our res, so this is why we chose this here ( where it comes from )
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');

      //send to homepage
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios.get('/api/v1/users/logout');
    // location.reload() => will reload the page |  location.reload(true) => will force a reload the server and not from the broswer
    if (res.data.status === 'success') location.reload(true);
  } catch (error) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again .');
  }
};
