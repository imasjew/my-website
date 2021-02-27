import { APIURL } from './apiurl.config';
import axios from 'axios';

const httpService = function(Vue, option) {
  Vue.prototype.getMusicList = function (key) {
    return axios.get(APIURL.music_list + key)
  }
}

export default httpService;
