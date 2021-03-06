const LOCALMUSICURL = 'http://localhost:3000/';
const ACCOUNTURL = 'http://localhost:8081/';
// 已失效 const MUSICURL = 'http://www.hjmin.com/';

export const APIURL = {
  login: ACCOUNTURL + 'login',
  register: ACCOUNTURL + 'register',
  song_list: LOCALMUSICURL + 'search?keywords=',
  song_url: LOCALMUSICURL + 'song/url?id=',
  check_song: LOCALMUSICURL + 'check/music?id=',
  get_song_detail: LOCALMUSICURL + 'song/detail?ids=',
  get_lyric: LOCALMUSICURL + 'lyric?id=',

}
