import "./styles/variable/_color.scss";
import "./styles/variable/_utils.scss";
import "./styles/base/_reset.scss";
import { App } from "@/components/App/App";

function $(string) {
  return document.querySelector(string);
}

const $App = $("#App");
$App.appendChild(document.createElement("ky-app"));
