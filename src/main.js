import "./styles/variable/_color.scss";
import "./styles/base/_reset.scss";
import "./components/App/App";

// localStorage에서 데이터를 가져오거나 mock.json을 초기값으로 사용
// let tripData = JSON.parse(localStorage.getItem('tripData')) || [];

// const container = $(".Schedule");
// const fallback = $(".Fallback");

function $(string) {
  return document.querySelector(string);
}

const $App = $("#App");
const App = document.createElement("ky-app");
$App.appendChild(App);
