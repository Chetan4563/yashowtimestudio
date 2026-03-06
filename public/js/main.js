document.addEventListener("DOMContentLoaded", () => {

  const cursor = document.querySelector(".cursor");
  const follow = document.querySelector(".cursor-follow");

  if (!cursor || !follow) return;

  document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";

    follow.style.left = e.clientX + "px";
    follow.style.top = e.clientY + "px";
  });

});