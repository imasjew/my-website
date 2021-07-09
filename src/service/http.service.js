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
  console.log("响应拦截器 失败", error.response);
  return Promise.reject(error.response);
});

const httpService = {
  login(name, pswd) {
    const data = {
      name: name,
      pswd: pswd
    }
    return axios.post(APIURL.login, data)
  },
  register(name, pswd) {
    const data = {
      name: name,
      pswd: pswd
    }
    return axios.post(APIURL.register, data)
  },
  getSongList(key) {
    return axios.get(APIURL.song_list + key)
  },
  checkSong(id) {
    return axios.get(APIURL.check_song + id)
  },
  getSongDetail(id) {
    return axios.get(APIURL.get_song_detail + id)
  },
  getSongUrl(id) {
    return axios.get(APIURL.song_url + id)
  },
  getLyric(id) {
    return axios.get(APIURL.get_lyric + id)
  },
  getFullSongDetail(id) {
    return Promise.all([
      new Promise((resolve, reject) => {
        httpService.getSongDetail(id).then(
          (res) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
      }),
      new Promise((resolve, reject) => {
        httpService.getSongUrl(id).then(
          (res) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
      }),
    ]);
  },
}

export default httpService;
