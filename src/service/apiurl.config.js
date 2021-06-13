const LOCALMUSICURL = 'http://localhost:3000/';
// 已失效 const MUSICURL = 'http://www.hjmin.com/';

export const APIURL = {
  song_list: LOCALMUSICURL + 'search?keywords=',
  song_url: LOCALMUSICURL + 'song/url?id=',
  check_song: LOCALMUSICURL + 'check/music?id=',
  get_song_info: LOCALMUSICURL + 'song/detail?ids=',
  get_lyric: LOCALMUSICURL + 'lyric?id='
}
