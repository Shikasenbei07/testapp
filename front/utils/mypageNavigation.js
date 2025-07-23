export function mypageNavigate(router, path) {
  router.push(path);
}

export function mypageLogout(router) {
  localStorage.removeItem("id");
  localStorage.removeItem("id_expire");
  router.push("/");
}

export function mypageSetting(router) {
  router.push("/mypage/setting");
}