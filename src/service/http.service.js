import { APIURL } from './apiurl.config';
import axios from 'axios';

// function request(config, success, failure) {
//   const instance = axios.create({
//     baseURL: ''
//   })
// }
axios.interceptors.response.use(function (response) {
  console.log("响应拦截器 成功");
  return response.data;
}, function (error) {
  console.log("响应拦截器 失败");
  return Promise.reject(error);
});

const httpService = {
  getSongList(key) {
    return axios.get(APIURL.song_list + key)
  },
  getSongUrl(id) {
    return axios.get(APIURL.song_url + id)
  },
  checkSong(id) {
    return axios.get(APIURL.check_song + id)
  },
  getSongDetail(id) {
    return axios.get(APIURL.get_song_detail + id)
  },
  getLyric(id) {
    return axios.get(APIURL.get_lyric + id)
  }
}

export default httpService;
