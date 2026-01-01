import "./styles/main.scss";
import DoubleCol from "./components/DoubleCol/DoubleCol";
import { $ } from "./lib/dom";

// localStorage에서 데이터를 가져오거나 mock.json을 초기값으로 사용
// let tripData = JSON.parse(localStorage.getItem('tripData')) || [];

// const container = $(".Schedule");
// const fallback = $(".Fallback");

const $App = $("#App");
$App.appendChild(DoubleCol());
