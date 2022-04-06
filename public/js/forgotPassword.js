/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
export const forgot = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/forgotPassword', // since the api and website will be hosted in the same server, this will work perfectly fine
      data: {
        email,
      },
    });
    // console.log(res);
    if (res.data.status === 'success') {
      //  automatically be directed back to a page
      location.assign(`/resetToken`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    // console.log(err.response.data);
  }
};
