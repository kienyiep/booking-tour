/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
export const updateForm = async (data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/update-tour-data'`,
      data,
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
