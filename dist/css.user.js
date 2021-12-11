const css = `
.foil {
  position: relative;
}

.foil::before,
.foil::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background-repeat: no-repeat;
  background-position: 50% 50%;
}

.foil::before {
  background-size: 250% 250%;
  background-image: linear-gradient(
      115deg,
      transparent 20%,
      #ec9bb6 36%,
      #ccac6f 43%,
      #69e4a5 50%,
      #8ec5d6 57%,
      #b98cce 64%,
      transparent 80%
  );
  opacity: 0.8;
  mix-blend-mode: color-dodge;
  z-index: 1;
  filter: brightness(0.6) contrast(1.3);
  animation: foilTurn 55s ease-in-out infinite;
}

.foil::after {
  background-image: url(https://assets.codepen.io/13471/sparkles.gif),
      url(https://assets.codepen.io/13471/holo.png),
      linear-gradient(
          125deg,
          #ff008460 15%,
          #fca40050 30%,
          #ffff0040 40%,
          #00ff8a30 60%,
          #00cfff50 70%,
          #cc4cfa60 85%
      );
  background-size: 160%;
  z-index: 2;
  mix-blend-mode: color-dodge;
  background-blend-mode: overlay;
  opacity: 0.15;
  animation: foilScroll 55s infinite;
}

@keyframes foilTurn {
  0%,
  10%,
  90%,
  100% {
      background-position: 50% 50%;
  }
  30%,
  40% {
      background-position: 0% 0%;
  }
  60%,
  70% {
      background-position: 100% 100%;
  }
}

@keyframes foilScroll {
  0%,
  10%,
  90%,
  100% {
      opacity: 0.15;
  }
  30%,
  40% {
      opacity: 0.4;
  }
  60%,
  70% {
      opacity: 0.4;
  }
}
`;