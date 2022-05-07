const container = document.querySelector(".container");
const hamburger_menu = document.querySelector(".hamburger-menu");
const overlay = document.querySelector(".overlay")

hamburger_menu.addEventListener("click", () => {
    container.classList.toggle("active");
});

      

