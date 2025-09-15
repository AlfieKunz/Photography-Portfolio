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
    corporate: {
        title: "Gallery -<br>Corporate",
        description: "My newest avenue of photography! I've been fortunate enough to partner with industry-leading and promising new businesses, taking photos that promises to capture the very essense of a company: the talent of the team, what they have to offer, and the atmosphere of their workplace. From professional headshots and 'action' team shots to venue photograpy and candids at a launch party, I'll do whatever it takes to showcase your business at its absolute best.",
        NegStartIndex: 9, //2 if LHS
        heightDelta: 0,
        tags: ["Signature", "Headshots", "Action & Staged", "Venue"]
    },
    event: {
        title: "Gallery -<br>Formal Events & Celebrations",
        description: "Whether it be photos of groups, candids, awards, speeches or the venue, I strive to showcase the excitement and atmosphere of an event to remember. I excel in busy situations and when meeting new people, and pride myself on building a friendly and charismatic rapport with guests while maintaining professionalism and strong directorial skills.",
        NegStartIndex: 32, //CHANGE TO 34!!!!!! //14 if RHS
        heightDelta: 0,
        tags: ["Signature", "Groups", "Candids", "Personal & Couples", "Venue", "Awards"]
    },
    landscape: {
        title: "Gallery -<br>Landscapes",
        description: "Powerful, raw, sublime, whatever you want to call it - there's a reason why landscapes move us so deeply. Here, I try to capture some of that feeling, aiming to preserve a place or moment in the beauty it deserves.",
        NegStartIndex: 9,
        heightDelta: 0,
        tags: ["Signature", "City", "Water & Ocean", "Mountains & Hills", "Fields"]
    },
    nature: {
        title: "Gallery -<br>Animals & Nature",
        description: "<b>Eutierria</b> (noun): 'a pleasing feeling of oneness with the earth and life'. Okay, <i>perhaps</i> that's a little pretentious, but there's a reason why the majority of my photos are of nature! :) I'm really lucky to live where I do, to be surrounded by so much life. Photography helps me explore that 'oneness' through curiosity and mindfulness; I hope to share a piece of that feeling here - hope you enjoy! 😌",
        NegStartIndex: 13, //27 if LHS
        heightDelta: 0,
        tags: ["Signature", "Animals", "Insects", "Plants & Greenery"]
    },
    portrait: {
        title: "Gallery -<br>Portraits",
        description: "An absolutely essential part of my love for photography. A great portrait captures a deep range of emotion and wonder, and I love utilising this to its fullest (especially with friends!) to capture authentic moments that provoke awe and evocation.",
        NegStartIndex: 4,
        heightDelta: 0,
        tags: ["Signature", "Nature", "Studio", "Landscape", "Animals"]
    },
    studio: {
        title: "Gallery -<br>Studio Work",
        description: "This might just be my favourite kind of photography - getting together with a friend or two, spending hours brainstorming and planning every detail, then jumping up and down with childlike joy when unveiling the results. It's always a blast :D.",
        NegStartIndex: 10, //20 if LHS
        heightDelta: 0,
        tags: ["Signature", "Light & Reflection", "Portrait", "Objects & Products", "Macro"]
    },
    travel: {
        title: "Gallery -<br>Adventures & Travel",
        description: "This is slightly more of a <i>variety</i> collection, spanning everything from everyday travels to international expeditions. Despite the range, I hope that each photo remains striking, telling a unique story that stays true to the original moment.",
        NegStartIndex: 7,
        heightDelta: 0,
        tags: ["Signature", "Street & Buildings", "Greenery", "Water"]
    },
    private: {
        title: "Gallery -<br>Private Collection",
        description: "This gallery uses client-side AES encryption to secure your photos, meaning only those with the correct password are able to view them.",
        heightDelta: -0.1,
        tags: ["Signature"]
    }
  };

    let allImages = [];
    let currentFilter = "Signature";
    const headerContent = categoryHeader[category];
    const thumbnailsContainer = document.getElementById("thumbnails");
    const filterButtonsContainer = document.getElementById("filter-buttons");
    let ErrorCounter = 0;

    let privatePassword = null;
    let privateUsername = null;
    //Links between the files (stored in the jsons) and the a local link to the decrypted images.
    let DecryptedFulls = new Map();
    let DecryptedThumbs = new Map();


    async function Decrypt(dir, password) {
        try {
            // fetch the encrypted file data as an array.
            const response = await fetch(dir);
            if (!response.ok) {
                throw new Error(`Failed to fetch encrypted file: ${response.statusText}`);
            }
            const encryptedData = await response.arrayBuffer();
            const encryptedBytes = new Uint8Array(encryptedData);

            // Extract salt, iv & ciphertext.
            const salt = encryptedBytes.slice(0, 16);
            const iv = encryptedBytes.slice(16, 32);
            const ciphertext = encryptedBytes.slice(32);

            // Encodes the password.
            const passwordKey = await window.crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode(password), { name: 'PBKDF2' },
                false, ['deriveKey']
            );

            const key = await window.crypto.subtle.deriveKey({
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 15000,
                    hash: 'SHA-256'
                },
                passwordKey, { name: 'AES-CBC', length: 256 },
                false,
                ['decrypt']
            );

            // Decrypts data.
            const plaintext = await window.crypto.subtle.decrypt({
                    name: 'AES-CBC',
                    iv: iv
                },
                key,
                ciphertext
            );

            // Figures out the file type of the image (defaulting to jpeg, unless proven otherwise).
            const decryptedBytes = new Uint8Array(plaintext);
            let mimeType = 'image/jpeg';
            if (decryptedBytes[0] === 0x89 && decryptedBytes[1] === 0x50 && decryptedBytes[2] === 0x4E && decryptedBytes[3] === 0x47) {
                mimeType = 'image/png';
            }

            // Creates URL for decrypted image.
            const blob = new Blob([plaintext], { type: mimeType });
            return URL.createObjectURL(blob);

        } catch (error) {
            //We were unable to decrypt the file - return nothing, so the system can flag it up.
            return null;
        }
    }


    //Decrypts each image on command, for use by either lazy loading of thumbs, or for loading of fulls upon click.
    async function DecryptImage(filename, username, password, format="thumb") {
        //Chooses the right map to save to.
        DecryptedMap = format == "thumb" ? DecryptedThumbs : DecryptedFulls
        if (DecryptedMap.has(filename)) {
            //Don't need to load.
            return DecryptedMap.get(filename);
        }
        //Computes the image and stores it for safe keeping :).
        const encName = filename.split('.')[0] + ".enc";
        const decryptedUrl = await Decrypt(`images/private/${username}/${format}/${encName}`, password);
        if (decryptedUrl) {DecryptedMap.set(filename, decryptedUrl);}
        return decryptedUrl;
    }


    async function DecryptNextSlide(slideIndex) {
        // Checks for invalid indices.
        if (!main.slides || !main.slides[slideIndex] || !lastOrderedImages[slideIndex]) {return;}

        const slideToSwitch = main.slides[slideIndex];
        const imageToSwitch = lastOrderedImages[slideIndex];
        
        // Check if already decrypted, by finding if the url is a blob (local).
        if (slideToSwitch.url && slideToSwitch.url.startsWith('blob:')) {return;}

        //Decrypts the image, then assigns the url to the slide.
        const decryptedUrl = await DecryptImage(imageToSwitch.filename, privateUsername, privatePassword, "full");
        if (decryptedUrl) {
            slideToSwitch.url = decryptedUrl;
            // Modofies that full's thumbnail, so we don't have to decrypt it upon click.
            const thumbnailLink = slideToSwitch.$parent.find('a.thumbnail')[0];
            if (thumbnailLink) {thumbnailLink.href = decryptedUrl; }
        }
    }



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



    function renderThumbnails(imagesToRender, categoryName, firstTime) {
        thumbnailsContainer.innerHTML = "";
        const splitResult = SplitImages(imagesToRender, headerContent);
        const orderedImages = splitResult.orderedImages;
        lastOrderedImages = orderedImages;

        main.layoutInfo = {
            columnASize: splitResult.columnASize,
            columnBSize: splitResult.columnBSize
        };
        
        try {
            orderedImages.forEach((img, index) => {
                const article = document.createElement("article");
                const aspectRatio = img.aspect_ratio || (3 / 2);
                const nominalWidth = 16;
                const nominalHeight = nominalWidth / aspectRatio;
                const tagsAttribute = img.type ? `data-tags="${img.type.join(',')}"` : '';
                const Credits = img.credits ? ('Alfie Kunz + ' + (img.credits.url ? `<a href="${img.credits.url}" target="_blank">${img.credits.name}</a>` : img.credits.name)) : 'Alfie Kunz'
                const YearOfCapture = new Date(img.datetime).getFullYear();
                
                //The gif here represents a black image, used rather than the default "no image" symbol - a better replacement of the default lazy animation (or if something goes wrong with SwitchTo())
                const dirFull = category == "private" ? 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' : `images/${categoryName}/full/${img.filename}` //CHANGE TO DECRYPTED FILE UPON CLICK!?!?!?
                const dirThumb = category == "private" ? 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' : `images/${categoryName}/thumb/${img.filename}`;

                article.innerHTML = `
                    <a class="thumbnail" href="${dirFull}" data-position="${img.position || 'center center'}" ${tagsAttribute} data-index="${index}" data-filename="${img.filename}">
                        <img
                            src="${dirThumb}"
                            alt="${img.title || ''}"
                            style="aspect-ratio: ${aspectRatio};"
                            loading="lazy"
                            width="${nominalWidth}"
                            height="${nominalHeight}"
                        />
                    </a>
                    <h2>${img.title || ''}</h2>
                    <p>© ${Credits} Photography - ${YearOfCapture}</p>
                `;
                thumbnailsContainer.appendChild(article);
                
                //Decrypts the thumbs that are in view immediately, s.t we can save the decrypted url.
                if (category == "private") {
                    const observer = new IntersectionObserver(async (entries) => {
                        entries.forEach(async (entry) => {
                            if (entry.isIntersecting) {
                                observer.unobserve(entry.target);
                                const decryptedUrl = await DecryptImage(img.filename, privateUsername, privatePassword);
                                if (decryptedUrl) {
                                    entry.target.src = decryptedUrl;
                                }
                            }
                        });
                    });
                    //Observes the newly rendered image, so that it can be loaded when it is in view.
                    const imgElement = article.querySelector('img');
                    observer.observe(imgElement);
                }
            });
        } catch(error) {
            console.error(error);
        };
        
        const isMobile = window.innerWidth < 651;
        if (!isMobile) {
            // Desktop Behavior (Initialize immediately)
            main.initViewer(orderedImages);
            if (firstTime) {
                main.switchTo(category == "private" ? 0 : orderedImages.length - headerContent.NegStartIndex, true);
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
                if (tag === currentFilter) {
                    button.classList.add("active");
                }
                filterButtonsContainer.appendChild(button);
            });
        }
    }


    if (!thumbnailsContainer.dataset.listenerAttached) {
        thumbnailsContainer.addEventListener('click', async function(event) {
            const thumbnailLink = event.target.closest('a.thumbnail');
            if (!thumbnailLink) return;
    
            event.preventDefault();
            event.stopPropagation();
    
            const indexAttr = thumbnailLink.getAttribute('data-index');
            const indexToSwitch = parseInt(indexAttr, 10);
    
            const filename = thumbnailLink.getAttribute('data-filename');

            // If this is a private gallery image, decrypt the full image first.
            if (category == "private" && filename) {
                try {
                    const decryptedFullUrl = await DecryptImage(filename, privateUsername, privatePassword, "full");
                    if (decryptedFullUrl) {
                        // Update the href to point to the decrypted URL
                        thumbnailLink.href = decryptedFullUrl;
                        // Update the slide's url property, so that we are able to switch to it in SwitchTo.
                        if (viewerInitialized && main.slides && main.slides[indexToSwitch]) {
                            main.slides[indexToSwitch].url = decryptedFullUrl;
                        }
                    } else {
                        console.error('Failed to decrypt image:', filename);
                        return;
                    }
                } catch (error) {
                    console.error('Error decrypting full image:', error);
                    return;
                }
            }

            const isMobile = window.innerWidth < 651;
            if (isMobile && !viewerInitialized) {
                main.initViewer(lastOrderedImages); // Pass the correctly ordered data
                viewerInitialized = true;
                // After initializing on mobile, update the URL for the clicked image if it's encrypted
                if (category == "private" && filename && main.slides && main.slides[indexToSwitch]) {
                    const decryptedFullUrl = await DecryptImage(filename, privateUsername, privatePassword, "full");
                    if (decryptedFullUrl) {
                        main.slides[indexToSwitch].url = decryptedFullUrl;
                    }
                }
            }

            main.switchTo(indexToSwitch);
        });
        thumbnailsContainer.dataset.listenerAttached = 'true';
    }


    if (category == "private" && typeof main !== 'undefined') {
        // Overwrites the navigation controls, so that we decrypt the slide that is about to load.
        const nav = {
            next: main.next.bind(main),
            previous: main.previous.bind(main),
            up: main.up.bind(main),
            down: main.down.bind(main),
            switchTo: main.switchTo.bind(main)
        };
        // Creates a wrapper that calls DecryptNextSlide before nav control.
        const createAsyncNav = (originalFn) => {
            return async function(...args) {
                if (originalFn === nav.switchTo) {
                    await DecryptNextSlide(args[0]);
                }
                return originalFn.call(this, ...args);
            };
        };
        // Override switchTo to always decrypt first.
        main.switchTo = async function(index, noHide) {
            await DecryptNextSlide(index);
            return nav.switchTo(index, noHide);
        };
        // Assign wrappers.
        main.next = createAsyncNav(nav.next);
        main.previous = createAsyncNav(nav.previous);
        main.up = createAsyncNav(nav.up);
        main.down = createAsyncNav(nav.down);
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

            renderThumbnails(filteredImages, category, (currentFilter == "Signature"), category === "private");
        }
    });



  fetch(`data/${category}.json`)
    .then(response => {
        if (!response.ok) {throw new Error("Error Loading Photos: 'Gallery not found'");}
        return response.json();
    })
    .then(async images => {
        allImages = images;

        // const verifiedImages = [];
        // //Only includes photos if we can find a valid .jpg file in thumbs. Note this is a last-case scenario - makes the page take a while to load...
        // for (const img of allImages) {
        //     const thumbUrl = `images/${category}/thumb/${img.filename}`;
        //     const thumbResponse = await fetch(thumbUrl, { method: 'HEAD' });
        //     if (thumbResponse.ok) {
        //     verifiedImages.push(img);
        //     } else {
        //     console.warn(`Error: Unable to Find Photo: ${img.filename}.`);
        //     }
        // }
        // allImages = verifiedImages;

        document.querySelector("#header h1").innerHTML = headerContent.title;
        document.querySelector("#header p").innerHTML = headerContent.description;
        console.log(`Found ${allImages.length} Photos - Displaying...`)

        filteredImages = allImages.filter(img => img.type && img.type.includes(currentFilter));
        generateFilterButtons(filteredImages);
        renderThumbnails(filteredImages, category, true);

    })
    .catch(error => {
        errormsg = category == "private" ? "" : "Error Loading Photos: 'Gallery not found'."
        document.getElementById("thumbnails").innerHTML = `<p>&nbsp;&nbsp;${errormsg}</p>`;
        console.error(error);
    });



    if (category == "private") {
        currentFilter = "All"
        document.querySelector("#header h1").innerHTML = headerContent.title;
        document.querySelector("#header p").innerHTML = headerContent.description;
        // Prompts the viewer for a username and password. The username will be used to access the gallery in question; the password will be used to decrypt the images.
        const modal = document.getElementById('private-popup');
        const nameInput = document.getElementById('username-input');
        const passwordInput = document.getElementById('password-input');
        const submitButton = document.getElementById('info-submit');
        const errorMessage = document.getElementById('error-message');

        //Allows the user to press ENTER to submit their fields.
        function handleEnter(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                submitButton.click();
            }
        }
        nameInput.addEventListener("keydown", handleEnter);
        passwordInput.addEventListener("keydown", handleEnter);

        modal.style.display = 'flex';

        submitButton.onclick = async () => {

            //Checks to see if a name has been entered.
            if (!nameInput.value) {
                ErrorCounter += 1;
                errorMessage.innerHTML = `<br>(${ErrorCounter}) Please enter a username.`;
                return;
            }
            const username = nameInput.value.toLowerCase()

            //Checks to see if the name is in the database of names.
            try {
                const response = await fetch(`data/private/${username}.json`, {
                    cache: 'no-store'
                });
                if (!response.ok) {                  
                    ErrorCounter += 1;
                    errorMessage.innerHTML = `<br>(${ErrorCounter}) Please enter a valid username.`;
                    return;
                }
            } catch {
                errorMessage.innerHTML = "Network Error.";
                return;
            }

            //Checks to see if a password has been entered.
            if (!passwordInput.value) {
                ErrorCounter += 1;
                errorMessage.innerHTML = `<br>(${ErrorCounter}) Please enter a password.`;
                return;
            }

            //Attempt to decrypt a single thumb (the first image), using the password as the key. If this succeeds, we assume that all the photos are valid.
            submitButton.disabled = true;
            submitButton.textContent = "Validating...";

            try {
                const response = await fetch(`data/private/${username}.json`);
                const images = await response.json();

                const encName = images[0].filename.split('.')[0] + ".enc";
                const testUrl = await Decrypt(`images/private/${username}/thumb/${encName}`, passwordInput.value);
                
                if (!testUrl) {
                    ErrorCounter += 1;
                    errorMessage.innerHTML = `<br>(${ErrorCounter}) Incorrect password.`;
                    submitButton.disabled = false;
                    submitButton.textContent = "Submit";
                    return;
                }

                // Password is correct - save, and render all the images.
                privateUsername = username;
                privatePassword = passwordInput.value;
                allImages = images;

                modal.style.display = 'none';
                console.log(`Found ${images.length} Photos - Displaying...`);
                generateFilterButtons(images);
                renderThumbnails(images, `private/${username}`, true, true);

            } catch (error) {
                console.log(error);
                ErrorCounter += 1;
                errorMessage.innerHTML = `<br>(${ErrorCounter}) An unknown error occurred.<br>If this persists, please contact Alfie :).`;
                submitButton.disabled = false;
                submitButton.textContent = "Submit";
            }
        };
    }
});
