/*!
* Start Bootstrap - Creative v7.0.7 (https://startbootstrap.com/theme/creative)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-creative/blob/master/LICENSE)
*/
//
// Scripts
// 
let HamburgerActive = false;
window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) { // stops scroll from undoing hamburder toggle animation.
            return;
        }
        if (HamburgerActive) {
            navbarToggler.click();
            HamburgerActive = false;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }
    };

    // Shrink the navbar 
    navbarShrink();

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');

    //Hamburger button controls:
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function () {
            const navbarCollapsible = document.body.querySelector('#mainNav');
            if (!navbarCollapsible) {
                return;
            }
            const isCollapsed = document.getElementById('navbarResponsive').classList.contains('show');
            
            if (HamburgerActive) {
                HamburgerActive = false;
                if (window.scrollY === 0) {
                    navbarCollapsible.classList.remove('navbar-shrink')
                }
            } else {
                HamburgerActive = true;
                navbarCollapsible.classList.add('navbar-shrink');
            }
        });
    }


    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
                HamburgerActive = false;
            }
        });
    });


    // controls for making picture captions show on mobile devices.
    const isMobileDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const onePictureMode = window.matchMedia('(max-width: 575px)').matches;

    if (isMobileDevice) {
        const portfolioBoxes = document.querySelectorAll('#portfolio .portfolio-box');
        let currentlyVisibleCaption = null; // Track the currently shown caption element

        if (portfolioBoxes.length > 0) {
            // --- Intersection Observer Setup ---

            const observerOptions = {
                root: null,
                rootMargin: '-35% 0px -27% 0px',
                threshold: 0.60
            };

            const handleIntersect = (entries, observer) => {
                entries.forEach(entry => {
                    const targetBox = entry.target;
                    const caption = targetBox.querySelector('.portfolio-box-caption');
                    if (!caption) return;

                    if (entry.isIntersecting) {
                        // Photo entering centre...
                        if (currentlyVisibleCaption && currentlyVisibleCaption !== caption) {
                            currentlyVisibleCaption.classList.remove('is-visible');
                        }
                        caption.classList.add('is-visible');
                        if (onePictureMode) {
                            currentlyVisibleCaption = caption;
                        }

                    } else {
                        // Photo leaving centre...
                        caption.classList.remove('is-visible');
                        if (currentlyVisibleCaption === caption) {
                            currentlyVisibleCaption = null;
                        }
                    }
                });
            };

            const observer = new IntersectionObserver(handleIntersect, observerOptions);
            portfolioBoxes.forEach(box => {
                observer.observe(box);
            });
        }
    }

    const UnobservedScrollObjects = ['BODY', 'INPUT', 'TEXTAREA'];
    document.addEventListener('scroll', () => {
        // Shrink the navbar when page is scrolled.
        navbarShrink();

        // Removes focus from the hamburger, if able.
        const FocussedElement = document.activeElement;
        if (FocussedElement && !UnobservedScrollObjects.includes(FocussedElement.tagName) && typeof FocussedElement.blur === 'function') {
            // Hamburger focussed.
            FocussedElement.blur();
        }
    });

    const PortfolioBoxes = document.querySelectorAll('#portfolio .container-fluid .portfolio-box');
    // Reveals the caption of the portfolio box if it is clicked.
    PortfolioBoxes.forEach(link => {
        link.addEventListener('click', () => {
            const caption = link.querySelector('.portfolio-box-caption');
            if (caption) caption.classList.add('is-visible');
        });
    });



    const UserForm = document.getElementById('contactForm');
    UserForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Stop the form from submitting normally
        // Resets previous error messages, if there are any.
        document.querySelectorAll('.is-invalid').forEach(Field => Field.classList.remove('is-invalid'));

        const SuccessMsg = document.getElementById('submitSuccessMessage');
        const ErrorMsg = document.getElementById('submitErrorMessage');
        SuccessMsg.classList.add('d-none');
        ErrorMsg.classList.add('d-none');

        var FormValid = true;

        const InputName = document.getElementById('name');
        const InputEmail = document.getElementById('email');
        const InputNumber = document.getElementById('phone');
        const InputMessage = document.getElementById('message');
        // If the user has not interacted with the form at all, we don't show an error message.
        if (!(InputName.value || InputEmail.value || InputNumber.value || InputMessage.value)) { return; }

        // Checks if user has entered a name.
        if (!InputName.value) {
            InputName.classList.add('is-invalid');
            FormValid = false;
        }

        // Checks if user has entered an email OR phone number.
        const PhoneErrorDiv = document.querySelector('[data-sb-feedback="phone:error"]');
        if (!InputEmail.value && !InputNumber.value) {
            PhoneErrorDiv.textContent = 'An email or phone number is required.';
            InputEmail.classList.add('is-invalid');
            InputNumber.classList.add('is-invalid');
            FormValid = false;
        } else if (InputNumber.value) {
            // If a phone number has been entered, check that it is valid.
            // Thanks "https://stackoverflow.com/questions/11518035/regular-expression-for-gb-based-and-only-numeric-phone-number" for the Regex!
            const GBPhoneRegex = /^(((\+44\s?\d{4}|\(?0\d{4}\)?)\s?\d{3}\s?\d{3})|((\+44\s?\d{3}|\(?0\d{3}\)?)\s?\d{3}\s?\d{4})|((\+44\s?\d{2}|\(?0\d{2}\)?)\s?\d{4}\s?\d{4}))(\s?\#(\d{4}|\d{3}))?$/;
            if (!GBPhoneRegex.test(InputNumber.value)) {
                // Phone number invalid.
                PhoneErrorDiv.textContent = 'Please enter a valid phone number.';
                InputNumber.classList.add('is-invalid');
                FormValid = false;
            }
        }

        // Checks if user has entered a message.
        if (!InputMessage.value) {
            InputMessage.classList.add('is-invalid');
            FormValid = false;
        }

        if (FormValid) {
            // Submits the form.
            const SubmitBtn = document.getElementById('submitButton');
            SubmitBtn.disabled = true;
            SubmitBtn.textContent = 'Submitting...';

            fetch(UserForm.action, {
                method: 'POST',
                body: new FormData(UserForm),
                headers: { 'Accept': 'application/json' }
            })
            .then(response => {
                if (response.ok) {
                    // Form is valid.
                    SuccessMsg.classList.remove('d-none');
                } else {
                    ErrorMsg.querySelector('div').textContent = 'Error Sending Form: Field(s) Invalid.';
                    ErrorMsg.classList.remove('d-none');
                }
            })
            .catch(error => {
                ErrorMsg.querySelector('div').textContent = 'Error Sending Form: Bad Connection.';
                ErrorMsg.classList.remove('d-none');
            })
            .finally(() => {
                SubmitBtn.disabled = false;
                SubmitBtn.textContent = 'Submit';
            });

        }
    });

});

window.addEventListener('load', () => {
    if (window.location.hash) {
        const hash = window.location.hash;
        const targetElement = document.querySelector(hash);
        
        if (targetElement) {
            // Wait for lazy images to load before scrolling.
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            let loadedCount = 0;
            const totalImages = lazyImages.length;
            
            if (totalImages === 0) {
                // No lazy images - scroll immediately.
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }, 50);
            } else {
                // Wait for all lazy images to load.
                lazyImages.forEach(img => {
                    if (img.complete) {
                        loadedCount++;
                    } else {
                        img.addEventListener('load', () => {
                            loadedCount++;
                            if (loadedCount === totalImages) {
                                setTimeout(() => {
                                    targetElement.scrollIntoView({ behavior: 'smooth' });
                                }, 50);
                            }
                        });
                    }
                });
                
                // If all images were already loaded
                if (loadedCount === totalImages) {
                    setTimeout(() => {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                }
            }
        }
    }
});