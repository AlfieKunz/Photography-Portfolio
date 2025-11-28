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
        NegStartIndex: 9,
        heightDelta: 0,
        tags: ["Signature", "Headshots", "Action & Directoral", "Venue"]
    },
    event: {
        title: "Gallery -<br>Formal Events & Celebrations",
        description: "Whether it be photos of groups, candids, awards, speeches or the venue, I strive to showcase the excitement and atmosphere of an event to remember. I excel in busy situations and when meeting new people, and pride myself on building a friendly and charismatic rapport with guests while maintaining professionalism and strong directorial skills.",
        NegStartIndex: 31,
        heightDelta: -0.25,
        tags: ["Signature", "Groups", "Candids", "Personal & Couples", "Venue", "Awards"]
    },
    landscape: {
        title: "Gallery -<br>Landscapes",
        description: "Powerful, raw, sublime, whatever you want to call it - there's a reason why landscapes move us so deeply. Here, I try to capture some of that feeling, aiming to preserve a place or moment in the beauty it deserves.",
        NegStartIndex: 28,
        heightDelta: 0,
        tags: ["Signature", "Water & Ocean", "Mountains & Hills", "Fields", "City"]
    },
    nature: {
        title: "Gallery -<br>Animals & Nature",
        description: "<b>Eutierria</b> (noun): 'a pleasing feeling of oneness with the earth and life'. Okay, <i>perhaps</i> that's a little pretentious, but there's a reason why the majority of my photos are of nature! :) I'm really lucky to live where I do, to be surrounded by so much life. Photography helps me explore that 'oneness' through curiosity and mindfulness; I hope to share a piece of that feeling here - hope you enjoy! 😌",
        NegStartIndex: 12,
        heightDelta: 0,
        tags: ["Signature", "Plants & Greenery", "Animals", "Insects"]
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
        NegStartIndex: 10,
        heightDelta: 0,
        tags: ["Signature", "Light & Reflection", "Portrait", "Objects & Products", "Macro"]
    },
    travel: {
        title: "Gallery -<br>Adventures & Travel",
        description: "This is slightly more of a <i>variety</i> collection, spanning everything from everyday travels to international expeditions. Despite the range, I hope that each photo remains striking, telling a unique story that stays true to the original moment.",
        NegStartIndex: 22,
        heightDelta: 0,
        tags: ["Signature", "Rocks & Mountains", "Greenery", "Street & Buildings", "Water"]
    },
    private: {
        title: "Gallery -<br>Private Collection",
        description: "This gallery uses client-side AES encryption to secure your photos, meaning only those with the correct password are able to view them. Note that, as a result of this 'on-the-fly' decryption, there might be a slight delay when browsing through photos.",
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
    let OnlyBallPhotosCheckbox = null;


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


    function CheckBallFilterChecked() {
        return (category === "event" && OnlyBallPhotosCheckbox && OnlyBallPhotosCheckbox.checked)
    }


    function renderThumbnails(imagesToRender, categoryName, firstTime) {
        
        // Only show the Ball Photos, if needed.
        if (CheckBallFilterChecked()) {
            imagesToRender = imagesToRender.filter(img => img.title && img.title.toLowerCase().includes("ball"));
        }

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
                
                // For some reason, github doesn't like photos being saved under DSC_0000_1.JPG - we need to lowercase this.
                var imgfilename = img.filename
                if (img.filename.substring(4).includes("_")) {
                    imgfilename = imgfilename.replace(/\.[a-zA-Z]+$/g, (match) => match.toLowerCase());
                }
                
                // The gif here represents a black image, used rather than the default "no image" symbol
                const dirFull = category == "private" ? 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' : `images/${categoryName}/full/${imgfilename}`
                const dirThumb = category == "private" ? 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' : `images/${categoryName}/thumb/${imgfilename}`;

                article.innerHTML = `
                    <a class="thumbnail" href="${dirFull}" data-position="${img.position || 'center center'}" ${tagsAttribute} data-index="${index}" data-filename="${imgfilename}">
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

                const ImageCont = article.querySelector('img');
                const InitImageLoadFade = () => { ImageCont.classList.add('loaded'); };
                if (ImageCont.complete) {
                    InitImageLoadFade();
                } else {
                    ImageCont.addEventListener('load', InitImageLoadFade);
                }
                
                // Decrypts the thumbs that are in view immediately, s.t we can save the decrypted url.
                if (category == "private") {
                    const observer = new IntersectionObserver(async (entries) => {
                        entries.forEach(async (entry) => {
                            if (entry.isIntersecting) {
                                observer.unobserve(entry.target);
                                const decryptedUrl = await DecryptImage(imgfilename, privateUsername, privatePassword);
                                if (decryptedUrl) {
                                    entry.target.src = decryptedUrl;
                                }
                            }
                        });
                    });
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

    function updateImageSchema(images, categoryName) {
        const schemaImages = images.map(img => {
            const imgfilename = img.filename.substring(4).includes("_") 
                ? img.filename.replace(/\.[a-zA-Z]+$/g, (match) => match.toLowerCase())
                : img.filename;
            
            const credits = img.credits 
                ? `Alfie Kunz + ${img.credits.name}`
                : 'Alfie Kunz';
            
            return {
                "@type": "ImageObject",
                "contentUrl": `https://alfiekunz.co.uk/photography/images/${categoryName}/full/${imgfilename}`,
                "name": img.title || '',
                "creator": {
                    "@type": "Person",
                    "name": credits
                },
                "copyrightHolder": {
                    "@type": "Person",
                    "name": "Alfie Kunz"
                },
                "copyrightYear": new Date(img.datetime).getFullYear().toString()
            };
        });

        const schema = {
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            "image": schemaImages
        };

        document.getElementById('image-schema').textContent = JSON.stringify(schema);
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


    function FilterUpdateGallery(filteredImages) {
        const FirstTime = (currentFilter === "Signature" && !CheckBallFilterChecked());

        const Render = function() {
            renderThumbnails(filteredImages, category, FirstTime);
        };

        const isMobile = window.innerWidth < 651;
        if (!isMobile && viewerInitialized) {
            
            // 1. Get the data for the *currently* displayed image
            const CurrentIndex = main.getCurrentIndex(); // Uses the function we added to main.js
            let CurrentImg = null, NewImg = null;
            if (CurrentIndex !== null && CurrentIndex < lastOrderedImages.length) {
                CurrentImg = lastOrderedImages[CurrentIndex];
            }

            // We must account for the ball filter to correctly predict the *actual* next image
            if (CheckBallFilterChecked()) {
                filteredImages = filteredImages.filter(img => img.title && img.title.toLowerCase().includes("ball"));
            }

            if (filteredImages.length > 0) {
                const OrderedImages = SplitImages(filteredImages, headerContent).orderedImages;
                
                let NewIndex = 0;
                if (FirstTime) {
                    NewIndex = (category === "private") ? 0 : OrderedImages.length - headerContent.NegStartIndex;
                }                
                NewImg = OrderedImages[NewIndex];
            }
            if (CurrentImg && NewImg && CurrentImg.filename === NewImg.filename) {
                // The images are the same - skip fade-out.
                Render();
            } else {
                // The images are different - load fade-out.
                main.clearSlide(Render);
            }
            
        } else {
            Render();
        }
    }



    filterButtonsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('filter-button')) {
            const selectedFilter = event.target.dataset.filter;
            if (selectedFilter === currentFilter) {return;}
            
            const previousFilter = currentFilter;
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
            
            FilterUpdateGallery(filteredImages);
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
        document.querySelector("#header p.license").innerHTML = "If you want to license or purchase any photos seen below, please <a href='/photography/#contact'>contact me!</a>";
        console.log(`Found ${allImages.length} Photos - Displaying...`);

        filteredImages = allImages.filter(img => img.type && img.type.includes(currentFilter));
        generateFilterButtons(filteredImages);

        //Adds 'Only Show Ball Photos' button, that filters the photos in each category.
        if (category === "event") {
            const checkboxContainer = document.createElement('div');
            checkboxContainer.id = 'ball-filter-container';
            checkboxContainer.style.marginTop = '1em'; 
            checkboxContainer.style.textAlign = 'center'; 
            
            checkboxContainer.innerHTML = `
                <input type="checkbox" id="ball-filter-checkbox" name="ball-filter">
                <label for="ball-filter-checkbox">Show Only Society Ball Photos</label>
            `;

            filterButtonsContainer.parentNode.insertBefore(checkboxContainer, filterButtonsContainer.nextSibling);
            OnlyBallPhotosCheckbox = document.getElementById('ball-filter-checkbox');
            OnlyBallPhotosCheckbox.addEventListener('change', () => {
                let filteredImages;
                if (currentFilter === "All") {
                    filteredImages = allImages;
                } else {
                    filteredImages = allImages.filter(img => img.type && img.type.includes(currentFilter));
                }
                FilterUpdateGallery(filteredImages);
            });
        }

        updateImageSchema(filteredImages, category);
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
        document.querySelector("#header p.license").innerHTML = "To save any of these photos, open the photo in full-screen and click the 'Download' button in the top-left corner. If you require any full-size copies, please <a href='/photography/#contact'>contact me!"

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
            if (username == "debug") {
                modal.style.display = 'none';
                return;
            }

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
            var UserPasswordInput = passwordInput.value;
            if (!passwordInput.value) {
                UserPasswordInput = nameInput.value;
            }

            //Attempt to decrypt a single thumb (the first image), using the password as the key. If this succeeds, we assume that all the photos are valid.
            submitButton.disabled = true;
            submitButton.textContent = "Validating...";

            try {
                const response = await fetch(`data/private/${username}.json`);
                const images = await response.json();

                const encName = images[0].filename.split('.')[0] + ".enc";
                const testUrl = await Decrypt(`images/private/${username}/thumb/${encName}`, UserPasswordInput);
                
                if (!testUrl) {
                    ErrorCounter += 1;
                    errorMessage.innerHTML = !passwordInput.value ? `<br>(${ErrorCounter}) Please enter a password.` : `<br>(${ErrorCounter}) Incorrect password.`;
                    submitButton.disabled = false;
                    submitButton.textContent = "Submit";
                    return;
                }

                // Password is correct - save, and render all the images.
                privateUsername = username;
                privatePassword = UserPasswordInput;
                allImages = images;

                if (allImages.length > 0 && allImages[0].GalleryTitle) {
                    document.querySelector("#header h1").innerHTML = `Gallery -<br>${allImages[0].GalleryTitle}`;
                }



                // Adds download button next to the home button, that allows the user to download ALL photos.
                const DownloadAllButton = document.createElement('a');
                DownloadAllButton.className = 'icon solid fa-download'; 
                DownloadAllButton.style.fontSize = '1.3rem';
                DownloadAllButton.style.cursor = 'pointer';
                DownloadAllButton.innerHTML = '<span class="label">Download All</span>';

                // Downloads all photos upon click.
                DownloadAllButton.addEventListener('click', async (e) => {
                    e.stopPropagation(); 
                    e.preventDefault();
                    
                    if (DownloadAllButton.dataset.processing === "true") return;
                    DownloadAllButton.dataset.processing = "true";

                    const originalClass = DownloadAllButton.className;
                    const originalHTML = DownloadAllButton.innerHTML;
                    const originalColor = DownloadAllButton.style.color;

                    DownloadAllButton.className = 'icon solid fa-spinner fa-spin'; 
                    DownloadAllButton.style.color = '#f69051'; 

                    try {
                        const zip = new JSZip();
                        const ImageFolder = zip.folder(`AlfieKunz_${privateUsername}_Collection`);

                        for (let i = 0; i < allImages.length; i++) {
                            const Image = allImages[i];
                            const decryptedUrl = await DecryptImage(Image.filename, privateUsername, privatePassword, "full");
                            if (decryptedUrl) {
                                const blob = await fetch(decryptedUrl).then(r => r.blob());
                                ImageFolder.file(Image.filename, blob);
                            }
                        }
                        const DownloadImgFetch = await zip.generateAsync({ type: "blob" });
                        const a = document.createElement("a");
                        a.href = URL.createObjectURL(DownloadImgFetch);
                        a.download = `AlfieKunz_${privateUsername}_All.zip`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        setTimeout(() => URL.revokeObjectURL(a.href), 1000);

                    } catch (err) {
                        console.error("Download failed", err);
                    } finally {
                        // Moves back to original layout.
                        DownloadAllButton.className = originalClass;
                        DownloadAllButton.innerHTML = originalHTML;
                        DownloadAllButton.style.color = originalColor;
                        DownloadAllButton.dataset.processing = "false";
                    }
                });
                document.querySelector('#header .icons').children[0].after(DownloadAllButton);
                document.querySelector('#header .icons').classList.add('has-download');



                modal.style.display = 'none';
                console.log(`Found ${images.length} Photos - Displaying...`);
                generateFilterButtons(images);
                renderThumbnails(images, `private/${username}`, true, true);

                // Adds download button to private gallery.
                const DownloadIndButton = document.createElement('div');
                DownloadIndButton.className = 'download-toggle'; 
                DownloadIndButton.innerHTML = '<span class="icon solid fa-arrow-down"></span>';
                
                // Downloads photo upon click.
                DownloadIndButton.addEventListener('click', async (e) => {
                    e.stopPropagation(); 
                    e.preventDefault();
                    
                    const CurrentIndex = main.getCurrentIndex();
                    if (main.slides && main.slides[CurrentIndex] && main.slides[CurrentIndex].url) {
                        // Mobile devices struggle to find the URL - find a blob to make this easier.
                        const DownloadImgFetch = await fetch(main.slides[CurrentIndex].url);
                        const DownloadImgBlob = await DownloadImgFetch.blob();
                        const DownloadImgBlobURL = URL.createObjectURL(DownloadImgBlob);

                        const a = document.createElement('a');
                        a.href = DownloadImgBlobURL;
                        a.download = "AlfieKunz_" + allImages[CurrentIndex].filename;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    }
                });
                document.querySelector('#viewer .inner').appendChild(DownloadIndButton);


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
