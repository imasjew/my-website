const LOCALMUSICURL = 'http://localhost:3000/';
const ACCOUNTURL = 'http://localhost:8081/';
// 已失效 const MUSICURL = 'http://www.hjmin.com/';

const APIURL = {
  register: ACCOUNTURL + 'register',
  login: ACCOUNTURL + 'login',
  auth: ACCOUNTURL + 'auth',
  song_list: LOCALMUSICURL + 'search?keywords=',
  song_url: LOCALMUSICURL + 'song/url?id=',
  check_song: LOCALMUSICURL + 'check/music?id=',
  get_song_detail: LOCALMUSICURL + 'song/detail?ids=',
  get_lyric: LOCALMUSICURL + 'lyric?id=',
}

export default APIURL
