import routeCard from "./routeCard.module.scss";

export default function RouteCard({ from, to }) {
  const template = `
    <section class="${routeCard.routeCard}">
      <h3 class="${routeCard.title}">경로</h3>
      <div class="${routeCard.card}">
        <p class="${routeCard.point}">
          <span class="${routeCard.label}">출발지</span>
          <strong ${routeCard.value}>${from}</strong>
        </p>
        <p class="${routeCard.point}">
          <span class="${routeCard.label}">도착지</span>
          <strong ${routeCard.value}>${to}</strong>
        </p>
      </div>
    </section>
  `;
  return template;
}
