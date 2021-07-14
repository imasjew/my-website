const accountService = {
  getToken() {
    var strcookie = document.cookie;
    var arrcookie = strcookie.split("; ");
    for (var i = 0; i < arrcookie.length; i++) {
      var arr = arrcookie[i].split("=");
      if (arr[0] == "token") {
        return arr[1];
      }
    }
    return false;
  },
  login(name, token) {
    localStorage.setItem("username", name);
    document.cookie = 'token=' + token
  },
  logout() {
    localStorage.removeItem("username");
    var date = new Date();
    date.setTime(date.getTime() - 10000);
    document.cookie = "token=; expires=" + date.toGMTString();
  }
}
export default accountService;
