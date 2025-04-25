document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");

  if (!category) {
      document.getElementById("thumbnails").innerHTML = "<p>Error Loading Photos: 'No category specified'.</p>";
      return;
  }


  // Header info, based on each category.
  const categoryHeader = {
    ball: {
        title: "Gallery -<br>Balls & Formals",
        description: "Explore the elegance of formal events and the energy of sports."
    }
  };
  const headerContent = categoryHeader[category]
  document.querySelector("#header h1").innerHTML = headerContent.title;
  document.querySelector("#header p").innerHTML = headerContent.description;


  fetch(`data/${category}.json`)
      .then(response => {
          if (!response.ok) throw new Error("Error Loading Photos: 'Gallery not found'");
          return response.json();
      })
      .then(images => {
          const container = document.getElementById("thumbnails");
          container.innerHTML = ""; // Clear placeholder

          // Create and append the new thumbnail articles
          images.forEach(img => {
              const article = document.createElement("article");
              article.innerHTML = `
                  <a class="thumbnail" href="images/${category}/full/${img.filename}" data-position="${img.position || 'center center'}">
                      <img src="images/${category}/thumb/${img.filename}" alt="" />
                  </a>
                  <h2>${img.title}</h2>
                  <p>${img.desc || '© Alfie Kunz 2025 - All Rights Reserved'}</p>
              `;
              container.appendChild(article);
          });

          main.initViewer();
          main.switchTo(2, true)
      })
      .catch(error => {
          document.getElementById("thumbnails").innerHTML = "<p>Error Loading Photos: 'One or more photos could not be fetched'.</p>";
          console.error(error);
      });
});
