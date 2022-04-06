/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
export const addTour = async (data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/tours/addPost', // since the api and website will be hosted in the same server, this will work perfectly fine
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
