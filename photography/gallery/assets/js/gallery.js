document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");

  if (!category) {
      document.getElementById("thumbnails").innerHTML = "<p>Error Loading Photos: 'No category specified'.</p>";
      return;
  }


  // Header info, based on each category.
  const categoryHeader = {
    astro: {
        title: "Gallery -<br>Astrophotography",
        description: "Studying physics at university, and having a knack for long exposure photography, has given me a huge appreciation for the stars & sky. Countless blissful nights were spent taking these photos, nights have now become some of the happiest of my life.",
        startIndex: 7,
        heightDelta: 0
    },
    ball: {
        title: "Gallery -<br>Balls & Formals",
        description: "Whether it be photos of groups, candids, awards, speeches or the venue, I strive to showcase the excitement and atmosphere of an event to remember. I excel in busy situations and when meeting new people, and pride myself on building a friendly and charismatic rapport with guests while maintaining professionalism and strong directorial skills.",
        startIndex: 1,
        heightDelta: 0.5
    },
    landscape: {
        title: "Gallery -<br>Landscapes",
        description: "Powerful, raw, sublime, whatever you want to call it - there's a reason why landscapes move us so deeply. Here, I try to capture some of that feeling, aiming to preserve a place or moment in the beauty it deserves.",
        startIndex: 6,
        heightDelta: 0.5
    },
    nature: {
        title: "Gallery -<br>Animals & Nature",
        description: "<b>Eutierria</b> (noun): 'a pleasing feeling of oneness with the earth and life'. Okay, <i>perhaps</i> that's a little pretentious, but there's a reason why the majority of my photos are of nature! :) I'm really lucky to live where I do, to be surrounded by so much life. Photography helps me explore that 'oneness' through curiosity and mindfulness; I hope to share a piece of that feeling here - hope you enjoy! 😌",
        startIndex: 40,
        heightDelta: 0.5
    },
    studioportrait: {
        title: "Gallery -<br>Studio Work & Portraits",
        description: "This might just be my favourite kind of photography - getting together with a friend or two, spending hours brainstorming and planning every detail, then jumping up and down with childlike joy when unveiling the results. It's always a blast :D.",
        startIndex: 19,
        heightDelta: -0.5
    },
    travel: {
        title: "Gallery -<br>Adventures & Travel",
        description: "This is slightly more of a <i>variety</i> collection, spanning everything from everyday travels to international expeditions. Despite the range, I hope that each photo remains striking, telling a unique story that stays true to the original moment.",
        startIndex: 26,
        heightDelta: -0.25
    }
  };

    function SplitImages(images, category) {
    let groupA = [];
    let groupB = [];
    let heightA = 0;
    let heightB = category.heightDelta;

    images.forEach(image => {
        const imageHeight = 1 / image.aspect_ratio;
        
        if (heightA <= heightB) {
            groupA.push(image);
            heightA += imageHeight;
        } else {
            groupB.push(image);
            heightB += imageHeight;
        }
    });

    console.log(groupA);
    console.log(groupB);
    console.log(heightA);
    console.log(heightB);
    
    return [...groupA, ...groupB];
    }

  fetch(`data/${category}.json`)
      .then(response => {
          if (!response.ok) throw new Error("Error Loading Photos: 'Gallery not found'");
          return response.json();
      })
      .then(images => {

          // sets up title and description info.
          const headerContent = categoryHeader[category];
          document.querySelector("#header h1").innerHTML = headerContent.title;
          document.querySelector("#header p").innerHTML = headerContent.description;

          const container = document.getElementById("thumbnails");
          container.innerHTML = ""; // Clear placeholder

          orderedImages = SplitImages(images, headerContent)
          orderedImages.forEach(img => {
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
          main.switchTo(headerContent.startIndex, true);
      })
      .catch(error => {
          document.getElementById("thumbnails").innerHTML = "<p>&nbsp&nbspError Loading Photos: 'Gallery not found'.</p>";
          console.error(error);
      });
});
