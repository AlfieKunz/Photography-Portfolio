document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");

    if (!category) {
      document.getElementById("thumbnails").innerHTML = "<p>No category specified.</p>";
      return;
    }

    fetch(`data/${category}.json`)  // Adjusted path: remove `../`
      .then(response => {
        if (!response.ok) throw new Error("Gallery not found");
        return response.json();
      })
      .then(images => {
        const container = document.getElementById("thumbnails");
        container.innerHTML = ""; // Clear placeholder
        images.forEach(img => {
          const article = document.createElement("article");
          article.innerHTML = `
            <a class="thumbnail" href="images/${category}/full/${img.filename}" data-position="${img.position || 'center center'}">
              <img src="images/${category}/thumb/${img.filename}" alt="" />  <!-- Adjusted path -->
            </a>
            <h2>${img.title}</h2>
            <p>${img.desc}</p>
          `;
          container.appendChild(article);
        });
      })
      .catch(error => {
        document.getElementById("thumbnails").innerHTML = "<p>Error loading gallery.</p>";
        console.error(error);
      });
});
