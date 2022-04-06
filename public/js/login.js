/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login', // since the api and website will be hosted in the same server, this will work perfectly fine
      data: {
        email,
        password,
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

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    if (res.data.status === 'success') location.reload(true); //set true to force the reload from the server but not browser cache
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.');
  }
};
