/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
export const deleteTour = async (deleteId) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/tours/${deleteId}`,
    });
    console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'delete tour successful!');
      //  automatically be directed back to a page

      window.setTimeout(() => {
        location.assign('/manageTour');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    // console.log(err.response.data);
  }
};
