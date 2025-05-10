document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");

  let viewerInitialized = false;
  let lastOrderedImages = [];

  if (!category) {
      document.getElementById("thumbnails").innerHTML = "<p>Error Loading Photos: 'No category specified'.</p>";
      return;
  }


  // Header info, based on each category.
  const categoryHeader = {
    astro: {
        title: "Gallery -<br>Astrophotography",
        description: "Studying physics at university, and having a knack for long exposure photography, has given me a huge appreciation for the stars & sky. Countless blissful nights were spent taking these photos, nights have now become some of the happiest of my life.",
        NegStartIndex: 6,
        heightDelta: 0,
        tags: ["Signature", "Moon", "Stars"]
    },
    ball: {
        title: "Gallery -<br>Balls & Formals",
        description: "Whether it be photos of groups, candids, awards, speeches or the venue, I strive to showcase the excitement and atmosphere of an event to remember. I excel in busy situations and when meeting new people, and pride myself on building a friendly and charismatic rapport with guests while maintaining professionalism and strong directorial skills.",
        NegStartIndex: 14,
        heightDelta: 0.5,
        tags: ["Signature", "Groups", "Candids", "Personal & Couples", "Venue", "Awards"]
    },
    landscape: {
        title: "Gallery -<br>Landscapes",
        description: "Powerful, raw, sublime, whatever you want to call it - there's a reason why landscapes move us so deeply. Here, I try to capture some of that feeling, aiming to preserve a place or moment in the beauty it deserves.",
        NegStartIndex: 26,
        heightDelta: 0.5,
        tags: ["Signature", "City", "Water & Ocean", "Mountains & Hills"]
    },
    nature: {
        title: "Gallery -<br>Animals & Nature",
        description: "<b>Eutierria</b> (noun): 'a pleasing feeling of oneness with the earth and life'. Okay, <i>perhaps</i> that's a little pretentious, but there's a reason why the majority of my photos are of nature! :) I'm really lucky to live where I do, to be surrounded by so much life. Photography helps me explore that 'oneness' through curiosity and mindfulness; I hope to share a piece of that feeling here - hope you enjoy! 😌",
        NegStartIndex: 27,
        heightDelta: 0.5,
        tags: ["Signature", "Animals", "Insects", "Plants & Greenery"]
    },
    studioportrait: {
        title: "Gallery -<br>Studio Work & Portraits",
        description: "This might just be my favourite kind of photography - getting together with a friend or two, spending hours brainstorming and planning every detail, then jumping up and down with childlike joy when unveiling the results. It's always a blast :D.",
        NegStartIndex: 20,
        heightDelta: -0.5,
        tags: ["Signature", "Studio", "Portraits"]
    },
    travel: {
        title: "Gallery -<br>Adventures & Travel",
        description: "This is slightly more of a <i>variety</i> collection, spanning everything from everyday travels to international expeditions. Despite the range, I hope that each photo remains striking, telling a unique story that stays true to the original moment.",
        NegStartIndex: 18,
        heightDelta: -0.25,
        tags: ["Signature", "Street & Buildings", "Greenery", "Water"]
    }
  };

  let allImages = [];
    let currentFilter = "Signature";
    const headerContent = categoryHeader[category];
    const thumbnailsContainer = document.getElementById("thumbnails");
    const filterButtonsContainer = document.getElementById("filter-buttons");

    function SplitImages(images, category) {
    let groupA = [];
    let groupB = [];
    let heightA = 0;
    let heightB = 0; //category.heightDelta;

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

    // console.log(groupA);
    // console.log(groupB);
    // console.log(heightA);
    // console.log(heightB);
    
    return {
        orderedImages: [...groupA, ...groupB],
        columnASize: groupA.length,
        columnBSize: groupB.length
    };
    }



    function renderThumbnails(imagesToRender, firstTime) {
        thumbnailsContainer.innerHTML = "";
        const splitResult = SplitImages(imagesToRender, headerContent);
        const orderedImages = splitResult.orderedImages;
        lastOrderedImages = orderedImages;

        main.layoutInfo = {
            columnASize: splitResult.columnASize,
            columnBSize: splitResult.columnBSize
        };

        orderedImages.forEach((img, index) => {
            const article = document.createElement("article");
            const aspectRatio = img.aspect_ratio || (3 / 2);
            const nominalWidth = 16;
            const nominalHeight = nominalWidth / aspectRatio;
            const tagsAttribute = img.type ? `data-tags="${img.type.join(',')}"` : '';

            article.innerHTML = `
                <a class="thumbnail" href="images/${category}/full/${img.filename}" data-position="${img.position || 'center center'}" ${tagsAttribute} data-index="${index}">
                    <img
                        src="images/${category}/thumb/${img.filename}"
                        alt="${img.title || ''}"
                        style="aspect-ratio: ${aspectRatio};"
                        loading="lazy"
                        width="${nominalWidth}"
                        height="${nominalHeight}"
                    />
                </a>
                <h2>${img.title || ''}</h2>
                <p>© Alfie Kunz Photography - 2025</p>
            `;
            thumbnailsContainer.appendChild(article);
        });


        const isMobile = breakpoints.active('<=medium');
        if (!isMobile) {
            // --- Desktop Behavior (Initialize immediately) ---
            main.initViewer(orderedImages);
            if (firstTime) {
                main.switchTo(orderedImages.length - headerContent.NegStartIndex, true);
             } else {
                main.switchTo(0, true);
             };
             viewerInitialized = true;
        } else {
            main.clearSlide();
            main.slides = [];
            viewerInitialized = false;
        }
        document.getElementById('main').scrollTop = 0;
    }



    function generateFilterButtons() {
        if (headerContent.tags.length > 0) {
            const sortedTags = ["All", ...headerContent.tags];
            sortedTags.forEach(tag => {
                const button = document.createElement("button");
                button.classList.add("filter-button");
                button.dataset.filter = tag;
                button.textContent = tag;
                if (tag === "Signature") {
                    button.classList.add("active");
                }
                filterButtonsContainer.appendChild(button);
            });
        }
    }


    if (!thumbnailsContainer.dataset.listenerAttached) {
        thumbnailsContainer.addEventListener('click', function(event) {
            const thumbnailLink = event.target.closest('a.thumbnail');
            if (!thumbnailLink) return;
    
            event.preventDefault();
            event.stopPropagation();
    
            const indexAttr = thumbnailLink.getAttribute('data-index');
            const indexToSwitch = parseInt(indexAttr, 10);
    
    
            const isMobile = breakpoints.active('<=medium');
            if (isMobile && !viewerInitialized) {
                main.initViewer(lastOrderedImages); // Pass the correctly ordered data
                viewerInitialized = true;
            }
            main.switchTo(indexToSwitch);
        });
        thumbnailsContainer.dataset.listenerAttached = 'true';
    }


    filterButtonsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('filter-button')) {
            const selectedFilter = event.target.dataset.filter;
            if (selectedFilter === currentFilter) {return;}
            currentFilter = selectedFilter;

            filterButtonsContainer.querySelectorAll('.filter-button').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');

            let filteredImages;
            if (currentFilter === "All") {
                filteredImages = allImages;
            } else {
                filteredImages = allImages.filter(img => img.type && img.type.includes(currentFilter));
            }

            renderThumbnails(filteredImages, (currentFilter == "Signature"));
        }
    });



  fetch(`data/${category}.json`)
      .then(response => {
          if (!response.ok) throw new Error("Error Loading Photos: 'Gallery not found'");
          return response.json();
      })
      .then(images => {
        allImages = images;
        document.querySelector("#header h1").innerHTML = headerContent.title;
        document.querySelector("#header p").innerHTML = headerContent.description;

        filteredImages = allImages.filter(img => img.type && img.type.includes(currentFilter))
        generateFilterButtons(filteredImages);
        renderThumbnails(filteredImages, true);

      })
      .catch(error => {
          document.getElementById("thumbnails").innerHTML = "<p>&nbsp&nbspError Loading Photos: 'Gallery not found'.</p>";
          console.error(error);
      });
});
