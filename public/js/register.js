/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
export const register = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup', // since the api and website will be hosted in the same server, this will work perfectly fine
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      //  automatically be directed back to a page
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    // console.log(err.response.data);
  }
};
